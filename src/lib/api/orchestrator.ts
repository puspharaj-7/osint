// =============================================================
// src/lib/api/orchestrator.ts
// Master scan orchestrator — chains all OSINT APIs based on
// the type of input provided (email, domain, IP, name, etc.)
// Returns a consolidated ScanResult with risk scoring.
// =============================================================

import { checkEmailBreaches } from './breach';
import { lookupWhois, lookupDns } from './whois';
import { lookupIp } from './ipinfo';
import { analyzeDomain, analyzeIp } from './virustotal';
import { searchSanctions } from './opensanctions';
import { verifyEmail, searchDomainEmails } from './hunter';
import { searchCompany } from './opencorporates';
import { lookupPhone } from './phone';
import { uid, nowISO } from './client';
import type { ScanInput, ScanResult, ApiEvidence, ApiAlert, GraphNodeResult, GraphEdgeResult } from './types';

export type ScanProgressCallback = (step: string, done: number, total: number) => void;

/**
 * Run OSINT enrichment for all provided inputs.
 * Dispatches calls based on input type and merges results.
 */
export async function runScan(
  inputs: ScanInput[],
  caseId: string,
  onProgress?: ScanProgressCallback,
): Promise<ScanResult> {
  const allEvidence: ApiEvidence[] = [];
  const allAlerts: ApiAlert[] = [];
  const graphNodes: GraphNodeResult[] = [];
  const graphEdges: GraphEdgeResult[] = [];

  // Build the task pipeline based on input types
  type Task = { label: string; fn: () => Promise<{ evidence: ApiEvidence[]; alerts: ApiAlert[] }> };
  const tasks: Task[] = [];

  for (const input of inputs) {
    const v = input.value.trim();
    if (!v) continue;

    switch (input.type) {
      case 'email': {
        tasks.push({ label: `Breach check: ${v}`, fn: () => checkEmailBreaches(v, caseId) });
        tasks.push({ label: `Email verify: ${v}`, fn: () => verifyEmail(v, caseId) });
        // Extract domain from email and run domain scans
        const emailDomain = v.split('@')[1];
        if (emailDomain) {
          tasks.push({ label: `WHOIS: ${emailDomain}`, fn: () => lookupWhois(emailDomain, caseId) });
          tasks.push({ label: `Threat intel: ${emailDomain}`, fn: () => analyzeDomain(emailDomain, caseId) });
        }
        break;
      }

      case 'domain':
        tasks.push({ label: `WHOIS: ${v}`, fn: () => lookupWhois(v, caseId) });
        tasks.push({ label: `DNS records: ${v}`, fn: async () => ({ evidence: await lookupDns(v), alerts: [] }) });
        tasks.push({ label: `Threat intel: ${v}`, fn: () => analyzeDomain(v, caseId) });
        tasks.push({ label: `Email discovery: ${v}`, fn: async () => ({ evidence: await searchDomainEmails(v), alerts: [] }) });
        break;

      case 'ip':
        tasks.push({ label: `IP intelligence: ${v}`, fn: () => lookupIp(v, caseId) });
        tasks.push({ label: `IP threat scan: ${v}`, fn: () => analyzeIp(v, caseId) });
        break;

      case 'name':
        tasks.push({ label: `Sanctions check: ${v}`, fn: () => searchSanctions(v, caseId) });
        break;

      case 'phone':
        tasks.push({ label: `Phone lookup: ${v}`, fn: () => lookupPhone(v, caseId) });
        break;

      case 'company':
        tasks.push({ label: `Company registry: ${v}`, fn: () => searchCompany(v, caseId) });
        tasks.push({ label: `Sanctions check (company): ${v}`, fn: () => searchSanctions(v, caseId) });
        break;

      case 'username':
      case 'social':
        // Social platform lookups — add as evidence placeholder (requires scrapers)
        tasks.push({
          label: `Social profile: ${v}`,
          fn: async () => ({
            evidence: [
              {
                id: uid('social'),
                source: 'Social Discovery',
                type: 'social' as const,
                title: `Social Target: ${v}`,
                content: `Identifier "${v}" queued for manual social media investigation.\n\nRecommended: Search Twitter/X, LinkedIn, Instagram, and GitHub for this username.`,
                confidence: 40,
                timestamp: nowISO(),
              },
            ],
            alerts: [],
          }),
        });
        break;

      case 'address':
        tasks.push({
          label: `Address OSINT: ${v}`,
          fn: async () => ({
            evidence: [
              {
                id: uid('addr'),
                source: 'Address Intelligence',
                type: 'domain' as const,
                title: `Address Record: ${v}`,
                content: `Address "${v}" logged. Recommend cross-referencing with property records, voter rolls, and business registries.`,
                confidence: 30,
                timestamp: nowISO(),
              },
            ],
            alerts: [],
          }),
        });
        break;
    }
  }

  // Execute all tasks sequentially with progress tracking
  const total = tasks.length;
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    onProgress?.(task.label, i, total);
    try {
      const result = await task.fn();
      allEvidence.push(...result.evidence);
      allAlerts.push(...result.alerts);
    } catch (err) {
      console.error(`[Orchestrator] Task failed — ${task.label}:`, err);
    }
  }
  onProgress?.('Scan complete', total, total);

  // Build graph nodes from inputs
  let nodeIdx = 0;
  const inputNodeIds: Record<string, string> = {};
  for (const input of inputs) {
    if (!input.value.trim()) continue;
    const nodeId = `n_${nodeIdx++}`;
    inputNodeIds[input.value] = nodeId;
    graphNodes.push({
      id: nodeId,
      label: input.value,
      type: mapInputTypeToNode(input.type),
      x: 400 + nodeIdx * 30,
      y: 300 + nodeIdx * 20,
    });
  }

  // Add evidence-derived nodes
  for (const ev of allEvidence) {
    if (ev.type === 'social' || ev.type === 'domain' || ev.type === 'ip') {
      const nodeId = `n_ev_${nodeIdx++}`;
      graphNodes.push({
        id: nodeId,
        label: ev.title.replace(/.*:\s*/, '').slice(0, 30),
        type: mapEvidenceTypeToNode(ev.type),
        x: 200 + (nodeIdx % 4) * 200,
        y: 150 + Math.floor(nodeIdx / 4) * 150,
      });
      // Connect to first input node
      const firstNodeId = Object.values(inputNodeIds)[0];
      if (firstNodeId) {
        graphEdges.push({ source: firstNodeId, target: nodeId, relationship: 'linked_to' });
      }
    }
  }

  // Connect input nodes to each other
  const nodeIds = Object.values(inputNodeIds);
  if (nodeIds.length > 1) {
    for (let i = 0; i < nodeIds.length - 1; i++) {
      graphEdges.push({ source: nodeIds[0], target: nodeIds[i + 1], relationship: 'associated_with' });
    }
  }

  // Calculate risk score from alerts
  const riskScore = calculateRiskScore(allAlerts);
  const identityConfidence = Math.min(
    95,
    40 + allEvidence.filter((e) => e.confidence > 70).length * 10,
  );

  return {
    evidence: allEvidence,
    alerts: allAlerts,
    graphNodes,
    graphEdges,
    riskScore,
    identityConfidence,
  };
}

function mapInputTypeToNode(type: string): GraphNodeResult['type'] {
  const map: Record<string, GraphNodeResult['type']> = {
    name: 'person',
    email: 'email',
    phone: 'phone',
    company: 'company',
    domain: 'domain',
    ip: 'ip',
    username: 'social',
    social: 'social',
    address: 'person',
  };
  return map[type] ?? 'person';
}

function mapEvidenceTypeToNode(type: string): GraphNodeResult['type'] {
  const map: Record<string, GraphNodeResult['type']> = {
    social: 'social',
    domain: 'domain',
    ip: 'ip',
    company: 'company',
    email: 'email',
  };
  return (map[type] as GraphNodeResult['type']) ?? 'domain';
}

function calculateRiskScore(alerts: ApiAlert[]): number {
  let score = 0;
  for (const alert of alerts) {
    switch (alert.severity) {
      case 'critical': score += 30; break;
      case 'high':     score += 20; break;
      case 'medium':   score += 10; break;
      case 'low':      score +=  5; break;
    }
  }
  return Math.min(100, score);
}
