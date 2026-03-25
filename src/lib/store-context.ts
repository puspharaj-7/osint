import { createContext } from 'react';
import type { Investigation, Alert, GraphNode, GraphEdge } from './mock-data';
import type { ScanResult } from './api/types';
import { mockInvestigations, mockGraphNodes, mockGraphEdges, allAlerts } from './mock-data';

export type TaggedGraphNode = GraphNode & { caseId?: string };
export type TaggedGraphEdge = GraphEdge & { caseId?: string };

export interface State {
  investigations: Investigation[];
  alerts: Alert[];
  graphNodes: TaggedGraphNode[];
  graphEdges: TaggedGraphEdge[];
}

export type Action =
  | { type: 'ADD_INVESTIGATION'; payload: Investigation }
  | { type: 'UPDATE_INVESTIGATION'; payload: Partial<Investigation> & { id: string } }
  | { type: 'DELETE_INVESTIGATION'; payload: string }
  | { type: 'LOAD_INVESTIGATIONS'; payload: Investigation[] }
  | { type: 'ADD_ALERTS'; payload: Alert[] }
  | { type: 'MARK_ALERT_READ'; payload: string }
  | { type: 'ADD_EVIDENCE'; payload: { caseId: string; evidence: unknown[] } }
  | { type: 'ADD_GRAPH_DATA'; payload: { nodes: TaggedGraphNode[]; edges: TaggedGraphEdge[] } }
  | { type: 'ADD_TIMELINE_ENTRY'; payload: { caseId: string; entry: Investigation['timeline'][0] } }
  | { type: 'ADD_NOTE'; payload: { caseId: string; note: string } }
  | { type: 'START_SCAN'; payload: { caseId: string } }
  | { type: 'SCAN_COMPLETE'; payload: { caseId: string; result: ScanResult } };

// Seed mock graph nodes/edges with their caseId so per-case filtering works
const seededGraphNodes: TaggedGraphNode[] = mockGraphNodes.map(n => ({
  ...n,
  caseId: '1', // linked to CASE-2026-001 (Rahul Sharma)
}));
const seededGraphEdges: TaggedGraphEdge[] = mockGraphEdges.map(e => ({
  ...e,
  caseId: '1',
}));

export const initialState: State = {
  investigations: mockInvestigations,
  alerts: allAlerts,
  graphNodes: seededGraphNodes,
  graphEdges: seededGraphEdges,
};

export const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);
