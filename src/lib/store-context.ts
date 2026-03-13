import { createContext } from 'react';
import type { Investigation, Alert, GraphNode, GraphEdge } from './mock-data';
import type { ScanResult } from './api/types';

export interface State {
  investigations: Investigation[];
  alerts: Alert[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
}

export type Action =
  | { type: 'ADD_INVESTIGATION'; payload: Investigation }
  | { type: 'UPDATE_INVESTIGATION'; payload: Partial<Investigation> & { id: string } }
  | { type: 'ADD_ALERTS'; payload: Alert[] }
  | { type: 'MARK_ALERT_READ'; payload: string }
  | { type: 'ADD_EVIDENCE'; payload: { caseId: string; evidence: any[] } }
  | { type: 'ADD_GRAPH_DATA'; payload: { nodes: GraphNode[]; edges: GraphEdge[] } }
  | { type: 'ADD_TIMELINE_ENTRY'; payload: { caseId: string; entry: Investigation['timeline'][0] } }
  | { type: 'ADD_NOTE'; payload: { caseId: string; note: string } }
  | { type: 'START_SCAN'; payload: { caseId: string } }
  | { type: 'SCAN_COMPLETE'; payload: { caseId: string; result: ScanResult } };

export const initialState: State = {
  investigations: [],
  alerts: [],
  graphNodes: [],
  graphEdges: [],
};

export const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);
