// =============================================================
// src/lib/api/types.ts
// Shared types for all OSINT API responses and evidence data
// =============================================================

export type EvidenceType =
  | 'breach'
  | 'domain'
  | 'ip'
  | 'social'
  | 'company'
  | 'threat'
  | 'email'
  | 'phone'
  | 'sanctions'
  | 'whois';

export interface ApiEvidence {
  id: string;
  source: string;
  type: EvidenceType;
  title: string;
  content: string;
  confidence: number;
  timestamp: string;
  raw?: unknown;
}

export interface ApiAlert {
  id: string;
  type: 'breach' | 'domain' | 'entity' | 'intelligence';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  caseId: string;
}

export interface ScanInput {
  type: string;
  value: string;
}

export interface ScanResult {
  evidence: ApiEvidence[];
  alerts: ApiAlert[];
  graphNodes: GraphNodeResult[];
  graphEdges: GraphEdgeResult[];
  riskScore: number;
  identityConfidence: number;
}

export interface GraphNodeResult {
  id: string;
  label: string;
  type: 'person' | 'email' | 'phone' | 'company' | 'domain' | 'ip' | 'social' | 'image';
  x: number;
  y: number;
}

export interface GraphEdgeResult {
  source: string;
  target: string;
  relationship: string;
}

export interface ApiError {
  message: string;
  status?: number;
  source: string;
}
