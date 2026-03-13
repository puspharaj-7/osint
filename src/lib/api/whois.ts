// =============================================================
// src/lib/api/whois.ts
// WhoisXML API — WHOIS lookup, DNS records, and domain history
// Docs: https://whois.whoisxmlapi.com/api/documentation/making-requests
// Free tier: 500 req/month at https://whois.whoisxmlapi.com/
// =============================================================

import { getJSON, uid, nowISO } from './client';
import type { ApiEvidence, ApiAlert } from './types';

const API_KEY = import.meta.env.VITE_WHOISXML_API_KEY as string;

interface WhoisResponse {
  WhoisRecord?: {
    domainName?: string;
    registrarName?: string;
    createdDate?: string;
    updatedDate?: string;
    expiresDate?: string;
    registrant?: {
      name?: string;
      organization?: string;
      country?: string;
      email?: string;
    };
    nameServers?: { hostNames?: string[] };
    registryData?: { domainName?: string; createdDate?: string };
    parseCode?: number;
  };
}

interface DnsResponse {
  DNSData?: {
    dnsTypes?: string;
    domainName?: string;
    dnsRecords?: Array<{
      dnsType?: string;
      address?: string;
      name?: string;
    }>;
  };
}

/**
 * WHOIS lookup for a domain or IP address.
 */
export async function lookupWhois(
  domain: string,
  caseId: string,
): Promise<{ evidence: ApiEvidence[]; alerts: ApiAlert[] }> {
  if (!API_KEY) {
    console.warn('[WhoisXML] No API key set — skipping WHOIS lookup');
    return { evidence: [], alerts: [] };
  }

  try {
    const data = await getJSON<WhoisResponse>(
      `/api/whoisxml/whoisserver/WhoisService?apiKey=${API_KEY}&domainName=${encodeURIComponent(domain)}&outputFormat=JSON`,
      'WhoisXML',
    );

    const record = data.WhoisRecord;
    if (!record) return { evidence: [], alerts: [] };

    const registrant = record.registrant;
    const lines: string[] = [];

    if (record.registrarName) lines.push(`Registrar: ${record.registrarName}`);
    if (record.createdDate) lines.push(`Created: ${record.createdDate}`);
    if (record.updatedDate) lines.push(`Updated: ${record.updatedDate}`);
    if (record.expiresDate) lines.push(`Expires: ${record.expiresDate}`);
    if (registrant?.organization) lines.push(`Registrant Org: ${registrant.organization}`);
    if (registrant?.country) lines.push(`Country: ${registrant.country}`);
    if (registrant?.email) lines.push(`Contact Email: ${registrant.email}`);
    if (record.nameServers?.hostNames?.length)
      lines.push(`Name Servers: ${record.nameServers.hostNames.slice(0, 3).join(', ')}`);

    const evidence: ApiEvidence[] = [
      {
        id: uid('whois'),
        source: 'WhoisXML',
        type: 'whois',
        title: `WHOIS Record: ${domain}`,
        content: lines.join('\n') || 'Minimal WHOIS data available (likely privacy-protected)',
        confidence: record.parseCode === 1 ? 90 : 60,
        timestamp: nowISO(),
        raw: record,
      },
    ];

    // Alert if domain was created very recently (< 30 days)
    const alerts: ApiAlert[] = [];
    if (record.createdDate) {
      const created = new Date(record.createdDate);
      const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) {
        alerts.push({
          id: uid('alert'),
          type: 'domain',
          severity: 'high',
          title: 'Domain registered very recently',
          description: `${domain} was registered only ${Math.round(daysSince)} days ago — newly created domains are a common fraud indicator.`,
          timestamp: nowISO(),
          read: false,
          caseId,
        });
      } else if (daysSince < 90) {
        alerts.push({
          id: uid('alert'),
          type: 'domain',
          severity: 'medium',
          title: 'Domain registered recently',
          description: `${domain} was registered ${Math.round(daysSince)} days ago (${record.createdDate}).`,
          timestamp: nowISO(),
          read: false,
          caseId,
        });
      }
    }

    return { evidence, alerts };
  } catch (err) {
    console.error('[WhoisXML] Error:', err);
    return { evidence: [], alerts: [] };
  }
}

/**
 * DNS lookup for a domain.
 */
export async function lookupDns(
  domain: string,
): Promise<ApiEvidence[]> {
  if (!API_KEY) return [];

  try {
    const data = await getJSON<DnsResponse>(
      `/api/whoisxml/whoisserver/DNSService?apiKey=${API_KEY}&domainName=${encodeURIComponent(domain)}&type=_all&outputFormat=JSON`,
      'WhoisXML-DNS',
    );

    const records = data.DNSData?.dnsRecords ?? [];
    if (!records.length) return [];

    const summary = records
      .slice(0, 10)
      .map((r) => `${r.dnsType}: ${r.address ?? r.name ?? ''}`)
      .join('\n');

    return [
      {
        id: uid('dns'),
        source: 'WhoisXML DNS',
        type: 'domain',
        title: `DNS Records: ${domain}`,
        content: summary,
        confidence: 88,
        timestamp: nowISO(),
        raw: records,
      },
    ];
  } catch (err) {
    console.error('[WhoisXML-DNS] Error:', err);
    return [];
  }
}
