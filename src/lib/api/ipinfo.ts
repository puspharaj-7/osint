// =============================================================
// src/lib/api/ipinfo.ts
// IPinfo.io — IP geolocation, ASN, organization, and abuse info
// Docs: https://ipinfo.io/developers
// Free tier: 50k requests/month — https://ipinfo.io/signup
// =============================================================

import { getJSON, uid, nowISO } from './client';
import type { ApiEvidence, ApiAlert } from './types';

const TOKEN = import.meta.env.VITE_IPINFO_TOKEN as string;

interface IpInfoResponse {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;        // "AS12345 Some ISP"
  timezone?: string;
  loc?: string;        // "lat,lon"
  hostname?: string;
  bogon?: boolean;
  abuse?: {
    address?: string;
    country?: string;
    email?: string;
    name?: string;
    network?: string;
    phone?: string;
  };
}

/**
 * Look up an IP address using IPinfo.io.
 */
export async function lookupIp(
  ip: string,
  caseId: string,
): Promise<{ evidence: ApiEvidence[]; alerts: ApiAlert[] }> {
  const url = TOKEN
    ? `/api/ipinfo/${encodeURIComponent(ip)}/json?token=${TOKEN}`
    : `/api/ipinfo/${encodeURIComponent(ip)}/json`;

  try {
    const data = await getJSON<IpInfoResponse>(url, 'IPinfo');

    if (data.bogon) {
      return {
        evidence: [
          {
            id: uid('ip'),
            source: 'IPinfo',
            type: 'ip',
            title: `Bogon/Private IP: ${ip}`,
            content: 'This IP address is in a private or reserved range and is not routable on the public internet.',
            confidence: 99,
            timestamp: nowISO(),
          },
        ],
        alerts: [],
      };
    }

    const lines: string[] = [];
    if (data.city && data.region && data.country)
      lines.push(`Location: ${data.city}, ${data.region}, ${data.country}`);
    if (data.org) lines.push(`Organization / ASN: ${data.org}`);
    if (data.hostname) lines.push(`Hostname: ${data.hostname}`);
    if (data.timezone) lines.push(`Timezone: ${data.timezone}`);
    if (data.loc) lines.push(`Coordinates: ${data.loc}`);
    if (data.abuse?.email) lines.push(`Abuse Contact: ${data.abuse.email}`);

    const evidence: ApiEvidence[] = [
      {
        id: uid('ip'),
        source: 'IPinfo',
        type: 'ip',
        title: `IP Intelligence: ${ip}`,
        content: lines.join('\n'),
        confidence: 85,
        timestamp: nowISO(),
        raw: data,
      },
    ];

    // Flag data-center / hosting ASNs as medium risk
    const alerts: ApiAlert[] = [];
    const isHosting =
      data.org &&
      /hosting|cloud|datacenter|vps|server|digital ocean|vultr|linode|ovh|hetzner/i.test(data.org);

    if (isHosting) {
      alerts.push({
        id: uid('alert'),
        type: 'intelligence',
        severity: 'medium',
        title: 'IP belongs to hosting/cloud provider',
        description: `${ip} resolves to ${data.org} — hosting IPs are commonly used for anonymous activity.`,
        timestamp: nowISO(),
        read: false,
        caseId,
      });
    }

    return { evidence, alerts };
  } catch (err) {
    console.error('[IPinfo] Error:', err);
    return { evidence: [], alerts: [] };
  }
}
