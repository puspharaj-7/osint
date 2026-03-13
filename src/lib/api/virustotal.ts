// =============================================================
// src/lib/api/virustotal.ts
// VirusTotal API — threat intelligence for domains, IPs, URLs
// Docs: https://developers.virustotal.com/reference/overview
// Free public API key: https://www.virustotal.com/gui/join-us
// =============================================================

import { getJSON, uid, nowISO } from './client';
import type { ApiEvidence, ApiAlert } from './types';

const API_KEY = import.meta.env.VITE_VIRUSTOTAL_API_KEY as string;
const BASE = '/api/virustotal/api/v3';

interface VtStats {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  timeout?: number;
}

interface VtDomainResponse {
  data?: {
    attributes?: {
      last_analysis_stats?: VtStats;
      last_analysis_date?: number;
      reputation?: number;
      categories?: Record<string, string>;
      creation_date?: number;
      registrar?: string;
    };
  };
}

interface VtIpResponse {
  data?: {
    attributes?: {
      last_analysis_stats?: VtStats;
      reputation?: number;
      country?: string;
      as_owner?: string;
      asn?: number;
      last_analysis_date?: number;
    };
  };
}

function formatStats(stats: VtStats): string {
  const total =
    stats.malicious + stats.suspicious + stats.harmless + stats.undetected;
  return [
    `Malicious: ${stats.malicious}/${total}`,
    `Suspicious: ${stats.suspicious}/${total}`,
    `Harmless: ${stats.harmless}/${total}`,
  ].join(' | ');
}

function severityFromStats(stats: VtStats): 'low' | 'medium' | 'high' | 'critical' {
  if (stats.malicious >= 10) return 'critical';
  if (stats.malicious >= 3) return 'high';
  if (stats.malicious >= 1 || stats.suspicious >= 5) return 'medium';
  return 'low';
}

/**
 * Analyze a domain with VirusTotal.
 */
export async function analyzeDomain(
  domain: string,
  caseId: string,
): Promise<{ evidence: ApiEvidence[]; alerts: ApiAlert[] }> {
  if (!API_KEY) {
    console.warn('[VirusTotal] No API key set — skipping domain analysis');
    return { evidence: [], alerts: [] };
  }

  try {
    const data = await getJSON<VtDomainResponse>(
      `${BASE}/domains/${encodeURIComponent(domain)}`,
      'VirusTotal',
      { headers: { 'x-apikey': API_KEY } },
    );

    const attrs = data.data?.attributes;
    if (!attrs) return { evidence: [], alerts: [] };

    const stats = attrs.last_analysis_stats;
    const lines: string[] = [];
    if (stats) lines.push(`Vendor Verdicts: ${formatStats(stats)}`);
    if (attrs.reputation !== undefined) lines.push(`Reputation Score: ${attrs.reputation}`);
    if (attrs.registrar) lines.push(`Registrar: ${attrs.registrar}`);
    if (attrs.categories && Object.keys(attrs.categories).length)
      lines.push(`Categories: ${[...new Set(Object.values(attrs.categories))].join(', ')}`);
    if (attrs.last_analysis_date)
      lines.push(`Last Scanned: ${new Date(attrs.last_analysis_date * 1000).toLocaleDateString()}`);

    const evidence: ApiEvidence[] = [
      {
        id: uid('vt'),
        source: 'VirusTotal',
        type: 'threat',
        title: `Threat Analysis: ${domain}`,
        content: lines.join('\n'),
        confidence: 90,
        timestamp: nowISO(),
        raw: attrs,
      },
    ];

    const alerts: ApiAlert[] = [];
    if (stats && (stats.malicious > 0 || stats.suspicious > 0)) {
      const sev = severityFromStats(stats);
      alerts.push({
        id: uid('alert'),
        type: 'intelligence',
        severity: sev,
        title: `VirusTotal: ${domain} flagged by ${stats.malicious} vendor(s)`,
        description: `Domain analysis: ${formatStats(stats)}`,
        timestamp: nowISO(),
        read: false,
        caseId,
      });
    }

    return { evidence, alerts };
  } catch (err) {
    console.error('[VirusTotal-Domain] Error:', err);
    return { evidence: [], alerts: [] };
  }
}

/**
 * Analyze an IP address with VirusTotal.
 */
export async function analyzeIp(
  ip: string,
  caseId: string,
): Promise<{ evidence: ApiEvidence[]; alerts: ApiAlert[] }> {
  if (!API_KEY) return { evidence: [], alerts: [] };

  try {
    const data = await getJSON<VtIpResponse>(
      `${BASE}/ip_addresses/${encodeURIComponent(ip)}`,
      'VirusTotal',
      { headers: { 'x-apikey': API_KEY } },
    );

    const attrs = data.data?.attributes;
    if (!attrs) return { evidence: [], alerts: [] };

    const stats = attrs.last_analysis_stats;
    const lines: string[] = [];
    if (stats) lines.push(`Vendor Verdicts: ${formatStats(stats)}`);
    if (attrs.country) lines.push(`Country: ${attrs.country}`);
    if (attrs.as_owner) lines.push(`AS Owner: ${attrs.as_owner}`);
    if (attrs.asn) lines.push(`ASN: ${attrs.asn}`);
    if (attrs.reputation !== undefined) lines.push(`Reputation: ${attrs.reputation}`);

    const evidence: ApiEvidence[] = [
      {
        id: uid('vt-ip'),
        source: 'VirusTotal',
        type: 'threat',
        title: `IP Threat Analysis: ${ip}`,
        content: lines.join('\n'),
        confidence: 90,
        timestamp: nowISO(),
        raw: attrs,
      },
    ];

    const alerts: ApiAlert[] = [];
    if (stats && stats.malicious > 0) {
      alerts.push({
        id: uid('alert'),
        type: 'intelligence',
        severity: severityFromStats(stats),
        title: `IP ${ip} flagged as malicious by ${stats.malicious} vendors`,
        description: `VirusTotal analysis: ${formatStats(stats)}`,
        timestamp: nowISO(),
        read: false,
        caseId,
      });
    }

    return { evidence, alerts };
  } catch (err) {
    console.error('[VirusTotal-IP] Error:', err);
    return { evidence: [], alerts: [] };
  }
}
