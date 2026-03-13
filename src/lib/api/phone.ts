// =============================================================
// src/lib/api/phone.ts
// Abstract API — phone number validation and carrier intelligence
// Docs: https://www.abstractapi.com/api/phone-validation-api
// Free tier: 250 requests/month — https://www.abstractapi.com/
// Also uses public NumVerify-compatible fallback (apilayer)
// =============================================================

import { getJSON, uid, nowISO } from './client';
import type { ApiEvidence, ApiAlert } from './types';

const ABSTRACT_KEY = import.meta.env.VITE_ABSTRACT_API_KEY as string;

interface AbstractPhoneResponse {
  phone: string;
  valid: boolean;
  format: {
    international?: string;
    local?: string;
  };
  country: {
    code?: string;
    name?: string;
    prefix?: string;
  };
  location?: string;
  type?: string;           // "mobile" | "landline" | "voip" | "satellite"
  carrier?: string;
}

/**
 * Validate and look up intelligence on a phone number.
 */
export async function lookupPhone(
  phone: string,
  caseId: string,
): Promise<{ evidence: ApiEvidence[]; alerts: ApiAlert[] }> {
  if (!ABSTRACT_KEY) {
    console.warn('[Phone] No Abstract API key — skipping phone lookup');
    return { evidence: [], alerts: [] };
  }

  try {
    const data = await getJSON<AbstractPhoneResponse>(
      `/api/abstract/?api_key=${ABSTRACT_KEY}&phone=${encodeURIComponent(phone)}`,
      'AbstractAPI-Phone',
    );

    if (!data.valid) {
      return {
        evidence: [
          {
            id: uid('phone'),
            source: 'Abstract Phone API',
            type: 'phone',
            title: `Invalid Phone Number: ${phone}`,
            content: `The number ${phone} does not appear to be a valid phone number.`,
            confidence: 90,
            timestamp: nowISO(),
          },
        ],
        alerts: [
          {
            id: uid('alert'),
            type: 'entity',
            severity: 'medium',
            title: 'Phone number appears invalid',
            description: `${phone} could not be validated as a real phone number.`,
            timestamp: nowISO(),
            read: false,
            caseId,
          },
        ],
      };
    }

    const lines = [
      `International: ${data.format.international ?? phone}`,
      `Country: ${data.country.name ?? 'Unknown'} (${data.country.code ?? ''})`,
      `Country Code: ${data.country.prefix ?? ''}`,
      data.location ? `Region: ${data.location}` : null,
      data.type ? `Line Type: ${data.type}` : null,
      data.carrier ? `Carrier: ${data.carrier}` : null,
    ].filter(Boolean).join('\n');

    const evidence: ApiEvidence[] = [
      {
        id: uid('phone'),
        source: 'Abstract Phone API',
        type: 'phone',
        title: `Phone Intelligence: ${phone}`,
        content: lines,
        confidence: 87,
        timestamp: nowISO(),
        raw: data,
      },
    ];

    const alerts: ApiAlert[] = [];
    if (data.type === 'voip') {
      alerts.push({
        id: uid('alert'),
        type: 'entity',
        severity: 'medium',
        title: 'VoIP number detected',
        description: `${phone} is a VoIP line — these are often used to create anonymous phone numbers.`,
        timestamp: nowISO(),
        read: false,
        caseId,
      });
    }

    return { evidence, alerts };
  } catch (err) {
    console.error('[Phone] Error:', err);
    return { evidence: [], alerts: [] };
  }
}
