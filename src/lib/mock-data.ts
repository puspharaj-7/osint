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

export interface GraphNode {
  id: string;
  label: string;
  type: 'person' | 'email' | 'phone' | 'company' | 'domain' | 'ip' | 'social' | 'image';
  x: number;
  y: number;
  expanded?: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
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
      { id: 'a1', type: 'breach', severity: 'high', title: 'Email found in breach database', description: 'Email appeared in 3 known data breaches (2019, 2021, 2023)', timestamp: '2026-03-08T10:31:00Z', read: false, caseId: 'CASE-2026-001' },
      { id: 'a2', type: 'domain', severity: 'medium', title: 'Domain registered recently', description: 'Associated domain registered 14 days before vendor onboarding', timestamp: '2026-03-08T10:32:00Z', read: true, caseId: 'CASE-2026-001' },
    ],
    evidence: [
      { id: 'e1', source: 'Breach DB', type: 'breach', title: 'Data Breach Record', content: 'Email found in LinkedIn breach (2021), Adobe breach (2019), Canva breach (2023)', confidence: 95, timestamp: '2026-03-08T10:31:00Z' },
      { id: 'e2', source: 'WHOIS', type: 'domain', title: 'Domain Registration', content: 'Domain rahulsharma.in registered on 2026-02-22 via GoDaddy', confidence: 88, timestamp: '2026-03-08T10:32:00Z' },
      { id: 'e3', source: 'Social Discovery', type: 'social', title: 'Social Media Profiles', content: 'LinkedIn: Rahul Sharma - VP of Operations at TechCorp\nTwitter: @rahulsharma_tech (4.2K followers)', confidence: 72, timestamp: '2026-03-08T10:35:00Z' },
    ],
    timeline: [
      { id: 't1', timestamp: '2026-03-08T10:30:00Z', event: 'Investigation initiated', type: 'scan' },
      { id: 't2', timestamp: '2026-03-08T10:31:00Z', event: 'Quick scan completed - 3 breaches detected', type: 'discovery' },
      { id: 't3', timestamp: '2026-03-08T10:32:00Z', event: 'Domain intelligence gathered', type: 'discovery' },
      { id: 't4', timestamp: '2026-03-08T10:35:00Z', event: 'Social media profiles discovered', type: 'discovery' },
      { id: 't5', timestamp: '2026-03-08T10:40:00Z', event: 'Deep scan initiated', type: 'scan' },
      { id: 't6', timestamp: '2026-03-09T14:00:00Z', event: 'Alert: New breach database match', type: 'alert' },
    ],
    notes: ['Subject appears to have strong online presence', 'Domain registration timing is suspicious - investigate further'],
    scanStatus: 'deep',
  },
  {
    id: '2',
    caseId: 'CASE-2026-002',
    target: 'CyberNova Ltd',
    targetType: 'Company',
    status: 'completed',
    riskScore: 34,
    riskLevel: 'low',
    identityConfidence: 91,
    createdAt: '2026-03-05T14:00:00Z',
    updatedAt: '2026-03-07T16:45:00Z',
    inputs: [
      { type: 'company', value: 'CyberNova Ltd' },
      { type: 'domain', value: 'cybernova.io' },
    ],
    alerts: [],
    evidence: [
      { id: 'e4', source: 'Company Registry', type: 'company', title: 'Company Registration', content: 'CyberNova Ltd - Registered in Delaware, USA. Active since 2018.', confidence: 98, timestamp: '2026-03-05T14:05:00Z' },
    ],
    timeline: [
      { id: 't7', timestamp: '2026-03-05T14:00:00Z', event: 'Investigation initiated', type: 'scan' },
      { id: 't8', timestamp: '2026-03-07T16:45:00Z', event: 'Investigation completed - Low risk', type: 'scan' },
    ],
    notes: ['Clean company profile'],
    scanStatus: 'complete',
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
      { type: 'ip', value: '185.234.72.11' },
    ],
    alerts: [
      { id: 'a3', type: 'intelligence', severity: 'critical', title: 'IP on threat intelligence list', description: 'IP address associated with known malware C2 infrastructure', timestamp: '2026-03-09T09:05:00Z', read: false, caseId: 'CASE-2026-003' },
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

export const mockGraphNodes: GraphNode[] = [
  { id: 'n1', label: 'Rahul Sharma', type: 'person', x: 400, y: 300 },
  { id: 'n2', label: 'rahul@gmail.com', type: 'email', x: 250, y: 180 },
  { id: 'n3', label: '+919876543210', type: 'phone', x: 550, y: 180 },
  { id: 'n4', label: 'TechCorp', type: 'company', x: 600, y: 400 },
  { id: 'n5', label: 'rahulsharma.in', type: 'domain', x: 200, y: 400 },
  { id: 'n6', label: '103.21.58.7', type: 'ip', x: 100, y: 300 },
  { id: 'n7', label: '@rahulsharma_tech', type: 'social', x: 500, y: 500 },
  { id: 'n8', label: 'linkedin/rahulsharma', type: 'social', x: 300, y: 500 },
];

export const mockGraphEdges: GraphEdge[] = [
  { source: 'n1', target: 'n2', relationship: 'owns' },
  { source: 'n1', target: 'n3', relationship: 'owns' },
  { source: 'n1', target: 'n4', relationship: 'works_at' },
  { source: 'n1', target: 'n5', relationship: 'registered' },
  { source: 'n5', target: 'n6', relationship: 'resolves_to' },
  { source: 'n1', target: 'n7', relationship: 'owns' },
  { source: 'n1', target: 'n8', relationship: 'owns' },
  { source: 'n4', target: 'n5', relationship: 'associated_with' },
];

export const allAlerts: Alert[] = [
  ...mockInvestigations.flatMap(inv => inv.alerts),
  { id: 'a4', type: 'entity', severity: 'medium', title: 'New linked entity discovered', description: 'A new social media account linked to CASE-2026-001 target', timestamp: '2026-03-10T06:00:00Z', read: false, caseId: 'CASE-2026-001' },
  { id: 'a5', type: 'intelligence', severity: 'high', title: 'Sanctions list match', description: 'Partial name match on OFAC sanctions list for CASE-2026-003', timestamp: '2026-03-10T07:00:00Z', read: false, caseId: 'CASE-2026-003' },
];
