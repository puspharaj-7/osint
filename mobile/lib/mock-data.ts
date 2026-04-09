export interface Investigation {
  id: string;
  caseId: string;
  target: string;
  targetType: string;
  status: 'active' | 'completed' | 'pending' | 'archived';
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  identityConfidence: number;
  createdAt: string;
  updatedAt: string;
  inputs: { type: string; value: string }[];
  alerts: Alert[];
  evidence: Evidence[];
  timeline: TimelineEntry[];
  notes: string[];
  scanStatus: 'quick' | 'deep' | 'complete';
}

export interface Alert {
  id: string;
  type: 'breach' | 'domain' | 'entity' | 'intelligence';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  caseId: string;
}

export interface Evidence {
  id: string;
  source: string;
  type: string;
  title: string;
  content: string;
  confidence: number;
  timestamp: string;
}

export interface TimelineEntry {
  id: string;
  timestamp: string;
  event: string;
  type: 'discovery' | 'alert' | 'scan' | 'note';
}

export const mockInvestigations: Investigation[] = [
  {
    id: '1',
    caseId: 'CASE-2026-001',
    target: 'Rahul Sharma',
    targetType: 'Person',
    status: 'active',
    riskScore: 67,
    riskLevel: 'medium',
    identityConfidence: 82,
    createdAt: '2026-03-08T10:30:00Z',
    updatedAt: '2026-03-10T08:15:00Z',
    inputs: [
      { type: 'name', value: 'Rahul Sharma' },
      { type: 'email', value: 'rahul@gmail.com' },
      { type: 'phone', value: '+919876543210' },
    ],
    alerts: [
      { id: 'a1', type: 'breach', severity: 'high', title: 'Email found in breach database', description: 'Email appeared in 3 known data breaches', timestamp: '2026-03-08T10:31:00Z', read: false, caseId: 'CASE-2026-001' },
    ],
    evidence: [],
    timeline: [
      { id: 't1', timestamp: '2026-03-08T10:30:00Z', event: 'Investigation initiated', type: 'scan' },
      { id: 't2', timestamp: '2026-03-08T10:31:00Z', event: 'Quick scan completed', type: 'discovery' },
      { id: 't6', timestamp: '2026-03-09T14:00:00Z', event: 'Alert: New breach database match', type: 'alert' },
    ],
    notes: [],
    scanStatus: 'deep',
  },
  {
    id: '3',
    caseId: 'CASE-2026-003',
    target: 'suspicious-domain.xyz',
    targetType: 'Domain',
    status: 'active',
    riskScore: 89,
    riskLevel: 'critical',
    identityConfidence: 45,
    createdAt: '2026-03-09T09:00:00Z',
    updatedAt: '2026-03-10T07:30:00Z',
    inputs: [
      { type: 'domain', value: 'suspicious-domain.xyz' },
    ],
    alerts: [
      { id: 'a3', type: 'intelligence', severity: 'critical', title: 'IP on threat list', description: 'Malware C2 infrastructure', timestamp: '2026-03-09T09:05:00Z', read: false, caseId: 'CASE-2026-003' },
    ],
    evidence: [],
    timeline: [
      { id: 't9', timestamp: '2026-03-09T09:00:00Z', event: 'Investigation initiated', type: 'scan' },
      { id: 't10', timestamp: '2026-03-09T09:05:00Z', event: 'Critical alert: Malware C2 association', type: 'alert' },
    ],
    notes: [],
    scanStatus: 'deep',
  },
];

export const allAlerts: Alert[] = [
  ...mockInvestigations.flatMap(inv => inv.alerts),
  { id: 'a4', type: 'entity', severity: 'medium', title: 'New linked entity discovered', description: 'A new social media account', timestamp: '2026-03-10T06:00:00Z', read: false, caseId: 'CASE-2026-001' },
];
