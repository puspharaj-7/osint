// =============================================================
// src/lib/api/breach.ts
// HaveIBeenPwned API — check if an email address appears in
// known data breach databases.
// Docs: https://haveibeenpwned.com/API/v3
// Free API key: https://haveibeenpwned.com/API/Key
// =============================================================

import { getJSON, uid, nowISO, ApiRequestError } from './client';
import type { ApiEvidence, ApiAlert } from './types';

const API_BASE = '/api/hibp/api/v3';
const API_KEY = import.meta.env.VITE_HIBP_API_KEY as string;

interface Breach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  Description: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsSensitive: boolean;
}

/**
 * Check if an email has been found in data breaches.
 * Returns evidence cards and alerts for each breach found.
 */
export async function checkEmailBreaches(
  email: string,
  caseId: string,
): Promise<{ evidence: ApiEvidence[]; alerts: ApiAlert[] }> {
  if (!API_KEY) {
    console.warn('[HIBP] No API key set — skipping breach check');
    return { evidence: [], alerts: [] };
  }

  let breaches: Breach[] = [];
  try {
    breaches = await getJSON<Breach[]>(
      `${API_BASE}/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      'HaveIBeenPwned',
      {
        headers: {
          'hibp-api-key': API_KEY,
          'User-Agent': 'GDSS-OSINT-Platform/1.0',
        },
      },
    );
  } catch (err) {
    // 404 = email not found in any breach (good news)
    if (err instanceof ApiRequestError && err.status === 404) {
      return {
        evidence: [
          {
            id: uid('breach'),
            source: 'HaveIBeenPwned',
            type: 'breach',
            title: 'No Breach Records Found',
            content: `Email address ${email} does not appear in any known data breach.`,
            confidence: 99,
            timestamp: nowISO(),
          },
        ],
        alerts: [],
      };
    }
    throw err;
  }

  const evidence: ApiEvidence[] = breaches.map((b) => ({
    id: uid('breach'),
    source: 'HaveIBeenPwned',
    type: 'breach',
    title: `Data Breach: ${b.Title}`,
    content: [
      `Breach Date: ${b.BreachDate}`,
      `Domain: ${b.Domain}`,
      `Exposed Data: ${b.DataClasses.join(', ')}`,
      `Verified: ${b.IsVerified ? 'Yes' : 'No'}`,
    ].join('\n'),
    confidence: b.IsVerified ? 95 : 70,
    timestamp: nowISO(),
    raw: b,
  }));

  const alerts: ApiAlert[] =
    breaches.length > 0
      ? [
          {
            id: uid('alert'),
            type: 'breach',
            severity: breaches.length >= 5 ? 'critical' : breaches.length >= 2 ? 'high' : 'medium',
            title: `Email found in ${breaches.length} data breach${breaches.length > 1 ? 'es' : ''}`,
            description: `${email} appeared in: ${breaches
              .slice(0, 3)
              .map((b) => b.Title)
              .join(', ')}${breaches.length > 3 ? ` and ${breaches.length - 3} more` : ''}`,
            timestamp: nowISO(),
            read: false,
            caseId,
          },
        ]
      : [];

  return { evidence, alerts };
}

/**
 * Check if a password has been exposed (uses k-Anonymity model — safe to use).
 * Returns count of how many times the hash prefix was seen.
 */
export async function checkPasswordPwned(password: string): Promise<number> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();

  const prefix = hashHex.slice(0, 5);
  const suffix = hashHex.slice(5);

  const text = await (
    await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)
  ).text();

  const lines = text.split('\n');
  for (const line of lines) {
    const [lineSuffix, count] = line.split(':');
    if (lineSuffix.trim() === suffix) {
      return parseInt(count.trim(), 10);
    }
  }
  return 0;
}
