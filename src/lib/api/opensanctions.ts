// =============================================================
// src/lib/api/opensanctions.ts
// OpenSanctions — free consolidated sanctions & PEP list search
// Docs: https://www.opensanctions.org/docs/api/
// No key required for basic use; premium for higher rate limits
// =============================================================

import { getJSON, uid, nowISO } from './client';
import type { ApiEvidence, ApiAlert } from './types';

const BASE = '/api/opensanctions';
const API_KEY = import.meta.env.VITE_OPENSANCTIONS_API_KEY as string | undefined;

interface SanctionsEntity {
  id: string;
  caption: string;
  schema: string;
  datasets: string[];
  properties?: {
    name?: string[];
    nationality?: string[];
    birthDate?: string[];
    country?: string[];
    notes?: string[];
    program?: string[];
    reason?: string[];
  };
}

interface SanctionsResponse {
  total: { value: number };
  results: SanctionsEntity[];
}

/**
 * Search OpenSanctions for a person or company name.
 * Also works for aliases and partial matches.
 */
export async function searchSanctions(
  name: string,
  caseId: string,
): Promise<{ evidence: ApiEvidence[]; alerts: ApiAlert[] }> {
  try {
    const params = new URLSearchParams({
      q: name,
      limit: '10',
      schema: 'Thing',
    });

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (API_KEY) headers['Authorization'] = `ApiKey ${API_KEY}`;

    const data = await getJSON<SanctionsResponse>(
      `${BASE}/search/default?${params.toString()}`,
      'OpenSanctions',
      { headers },
    );

    if (!data.results || data.results.length === 0) {
      return {
        evidence: [
          {
            id: uid('sanc'),
            source: 'OpenSanctions',
            type: 'sanctions',
            title: `No Sanctions Match: ${name}`,
            content: `"${name}" does not appear on any consolidated sanctions or PEP watchlist.`,
            confidence: 90,
            timestamp: nowISO(),
          },
        ],
        alerts: [],
      };
    }

    const evidence: ApiEvidence[] = data.results.map((entity) => {
      const props = entity.properties ?? {};
      const details = [
        `Schema: ${entity.schema}`,
        `Lists: ${entity.datasets.join(', ')}`,
        props.nationality?.length ? `Nationality: ${props.nationality.join(', ')}` : null,
        props.birthDate?.length ? `Birth Date: ${props.birthDate[0]}` : null,
        props.program?.length ? `Program/Reason: ${props.program.join(', ')}` : null,
        props.reason?.length ? `Reason: ${props.reason.join(', ')}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      return {
        id: uid('sanc'),
        source: 'OpenSanctions',
        type: 'sanctions' as const,
        title: `Sanctions Match: ${entity.caption}`,
        content: details,
        confidence: entity.caption.toLowerCase().includes(name.toLowerCase()) ? 85 : 55,
        timestamp: nowISO(),
        raw: entity,
      };
    });

    // Create a single consolidated alert
    const alerts: ApiAlert[] = [
      {
        id: uid('alert'),
        type: 'intelligence',
        severity: 'critical',
        title: `Sanctions/PEP match: ${data.total.value} result(s) for "${name}"`,
        description: `Subject may appear on: ${
          [...new Set(data.results.flatMap((r) => r.datasets))]
            .slice(0, 4)
            .join(', ')
        }`,
        timestamp: nowISO(),
        read: false,
        caseId,
      },
    ];

    return { evidence, alerts };
  } catch (err) {
    console.error('[OpenSanctions] Error:', err);
    return { evidence: [], alerts: [] };
  }
}
