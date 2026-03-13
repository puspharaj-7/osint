// =============================================================
// src/lib/api/hunter.ts
// Hunter.io — email finder and verification by domain
// Docs: https://hunter.io/api-documentation
// Free tier: 25 requests/month — https://hunter.io/users/sign_up
// =============================================================

import { getJSON, uid, nowISO } from './client';
import type { ApiEvidence, ApiAlert } from './types';

const API_KEY = import.meta.env.VITE_HUNTER_API_KEY as string;
const BASE = '/api/hunter/v2';

interface HunterVerifyResponse {
  data?: {
    status: string;         // "valid" | "invalid" | "accept_all" | "webmail" | "disposable" | "unknown"
    result: string;         // "deliverable" | "undeliverable" | "risky"
    score: number;          // 0-100 deliverability score
    email: string;
    regexp: boolean;
    gibberish: boolean;
    disposable: boolean;
    webmail: boolean;
    mx_records: boolean;
    smtp_server: boolean;
    smtp_check: boolean;
    accept_all: boolean;
    block: boolean;
    sources: Array<{ domain: string; uri: string; extracted_on: string }>;
  };
  meta?: { params: { email: string } };
}

interface HunterDomainResponse {
  data?: {
    domain: string;
    disposable: boolean;
    webmail: boolean;
    accept_all: boolean;
    pattern: string;
    organization: string;
    country?: string;
    emails: Array<{
      value: string;
      type: string;
      confidence: number;
      first_name?: string;
      last_name?: string;
      position?: string;
      seniority?: string;
      department?: string;
    }>;
  };
}

/**
 * Verify an email address via Hunter.io.
 */
export async function verifyEmail(
  email: string,
  caseId: string,
): Promise<{ evidence: ApiEvidence[]; alerts: ApiAlert[] }> {
  if (!API_KEY) {
    console.warn('[Hunter] No API key set — skipping email verification');
    return { evidence: [], alerts: [] };
  }

  try {
    const data = await getJSON<HunterVerifyResponse>(
      `${BASE}/email-verifier?email=${encodeURIComponent(email)}&api_key=${API_KEY}`,
      'Hunter.io',
    );

    const d = data.data;
    if (!d) return { evidence: [], alerts: [] };

    const lines = [
      `Status: ${d.status}`,
      `Deliverability: ${d.result}`,
      `Score: ${d.score}/100`,
      `Disposable: ${d.disposable ? 'Yes ⚠️' : 'No'}`,
      `Webmail: ${d.webmail ? 'Yes' : 'No'}`,
      `MX Records: ${d.mx_records ? 'Valid' : 'Not found'}`,
      `SMTP Check: ${d.smtp_check ? 'Passed' : 'Failed'}`,
    ];

    if (d.sources?.length) {
      lines.push(`\nFound on ${d.sources.length} web source(s):`);
      d.sources.slice(0, 3).forEach((s) => lines.push(`  - ${s.domain}`));
    }

    const evidence: ApiEvidence[] = [
      {
        id: uid('hunter'),
        source: 'Hunter.io',
        type: 'email',
        title: `Email Verification: ${email}`,
        content: lines.join('\n'),
        confidence: d.score,
        timestamp: nowISO(),
        raw: d,
      },
    ];

    const alerts: ApiAlert[] = [];
    if (d.disposable) {
      alerts.push({
        id: uid('alert'),
        type: 'entity',
        severity: 'high',
        title: 'Disposable/temporary email address detected',
        description: `${email} is a disposable email address — commonly used to avoid traceability.`,
        timestamp: nowISO(),
        read: false,
        caseId,
      });
    }
    if (d.result === 'undeliverable' || d.status === 'invalid') {
      alerts.push({
        id: uid('alert'),
        type: 'entity',
        severity: 'medium',
        title: 'Email address appears invalid or undeliverable',
        description: `Hunter.io verification: ${d.result} (score: ${d.score}/100)`,
        timestamp: nowISO(),
        read: false,
        caseId,
      });
    }

    return { evidence, alerts };
  } catch (err) {
    console.error('[Hunter] Email verify error:', err);
    return { evidence: [], alerts: [] };
  }
}

/**
 * Find email addresses and employees associated with a domain.
 */
export async function searchDomainEmails(
  domain: string,
): Promise<ApiEvidence[]> {
  if (!API_KEY) return [];

  try {
    const data = await getJSON<HunterDomainResponse>(
      `${BASE}/domain-search?domain=${encodeURIComponent(domain)}&api_key=${API_KEY}&limit=10`,
      'Hunter.io',
    );

    const d = data.data;
    if (!d || !d.emails.length) return [];

    const lines = [
      `Organization: ${d.organization ?? 'Unknown'}`,
      `Email Pattern: ${d.pattern ?? 'Unknown'}`,
      `Country: ${d.country ?? 'Not available'}`,
      `Disposable: ${d.disposable ? 'Yes' : 'No'}`,
      '',
      `Employees found (${d.emails.length}):`,
      ...d.emails.slice(0, 8).map((e) => {
        const name = [e.first_name, e.last_name].filter(Boolean).join(' ');
        return `  - ${e.value}${name ? ` (${name}${e.position ? ', ' + e.position : ''})` : ''}`;
      }),
    ];

    return [
      {
        id: uid('hunter-domain'),
        source: 'Hunter.io',
        type: 'email',
        title: `Domain Email Intelligence: ${domain}`,
        content: lines.join('\n'),
        confidence: 80,
        timestamp: nowISO(),
        raw: d,
      },
    ];
  } catch (err) {
    console.error('[Hunter] Domain search error:', err);
    return [];
  }
}
