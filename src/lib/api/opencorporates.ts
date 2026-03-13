// =============================================================
// src/lib/api/opencorporates.ts
// OpenCorporates — largest open database of company information
// Docs: https://api.opencorporates.com/documentation/API-Reference
// Free tier available: https://opencorporates.com/api_accounts/new
// =============================================================

import { getJSON, uid, nowISO } from './client';
import type { ApiEvidence, ApiAlert } from './types';

const API_KEY = import.meta.env.VITE_OPENCORPORATES_API_KEY as string;
const BASE = '/api/opencorporates/v0.4';

interface OcCompany {
  name: string;
  company_number: string;
  jurisdiction_code: string;
  incorporation_date?: string;
  dissolution_date?: string;
  company_type?: string;
  current_status?: string;
  registry_url?: string;
  registered_address?: { in_full?: string };
  officers?: Array<{ name: string; position: string; start_date?: string }>;
}

interface OcSearchResponse {
  results?: {
    companies?: Array<{ company: OcCompany }>;
    total_count?: number;
  };
}

/**
 * Search for a company in the OpenCorporates registry.
 */
export async function searchCompany(
  companyName: string,
  caseId: string,
): Promise<{ evidence: ApiEvidence[]; alerts: ApiAlert[] }> {
  try {
    const params = new URLSearchParams({
      q: companyName,
      format: 'json',
    });
    if (API_KEY) params.set('api_token', API_KEY);

    const data = await getJSON<OcSearchResponse>(
      `${BASE}/companies/search?${params}`,
      'OpenCorporates',
    );

    const companies = data.results?.companies ?? [];
    if (!companies.length) {
      return {
        evidence: [
          {
            id: uid('corp'),
            source: 'OpenCorporates',
            type: 'company',
            title: `Company Not Found: ${companyName}`,
            content: `No registered company matching "${companyName}" found in the OpenCorporates database.`,
            confidence: 70,
            timestamp: nowISO(),
          },
        ],
        alerts: [],
      };
    }

    const evidence: ApiEvidence[] = companies.slice(0, 5).map(({ company: c }) => {
      const lines = [
        `Registered Name: ${c.name}`,
        `Company Number: ${c.company_number}`,
        `Jurisdiction: ${c.jurisdiction_code}`,
        c.company_type ? `Type: ${c.company_type}` : null,
        c.current_status ? `Status: ${c.current_status}` : null,
        c.incorporation_date ? `Incorporated: ${c.incorporation_date}` : null,
        c.dissolution_date ? `Dissolved: ${c.dissolution_date}` : null,
        c.registered_address?.in_full ? `Address: ${c.registered_address.in_full}` : null,
        c.registry_url ? `Registry: ${c.registry_url}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      return {
        id: uid('corp'),
        source: 'OpenCorporates',
        type: 'company' as const,
        title: `Corporate Record: ${c.name}`,
        content: lines,
        confidence: c.name.toLowerCase() === companyName.toLowerCase() ? 95 : 65,
        timestamp: nowISO(),
        raw: c,
      };
    });

    const alerts: ApiAlert[] = [];
    // Alert if the target company appears dissolved
    const dissolved = companies
      .slice(0, 3)
      .find(({ company: c }) => c.dissolution_date || /dissolved|inactive/i.test(c.current_status ?? ''));

    if (dissolved) {
      alerts.push({
        id: uid('alert'),
        type: 'entity',
        severity: 'high',
        title: `Company "${companyName}" may be dissolved or inactive`,
        description: `Records indicate dissolution: ${dissolved.company.dissolution_date ?? dissolved.company.current_status ?? 'unknown date'}`,
        timestamp: nowISO(),
        read: false,
        caseId,
      });
    }

    return { evidence, alerts };
  } catch (err) {
    console.error('[OpenCorporates] Error:', err);
    return { evidence: [], alerts: [] };
  }
}
