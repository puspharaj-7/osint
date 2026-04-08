import React, { useContext, useReducer, ReactNode } from 'react';
import type { Alert, Evidence, GraphNode } from './mock-data';
import { runScan } from './api/orchestrator';
import { sendAlertNotification } from './notifications';
import { StoreContext, initialState, type State, type Action, type TaggedGraphNode, type TaggedGraphEdge } from './store-context';

function storeReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_INVESTIGATION':
      return { ...state, investigations: [action.payload, ...state.investigations] };

    case 'UPDATE_INVESTIGATION':
      return {
        ...state,
        investigations: state.investigations.map(inv =>
          inv.id === action.payload.id ? { ...inv, ...action.payload } : inv
        ),
      };

    case 'DELETE_INVESTIGATION':
      return {
        ...state,
        investigations: state.investigations.filter(inv => inv.id !== action.payload),
        graphNodes: state.graphNodes.filter(n => n.caseId !== action.payload),
        graphEdges: state.graphEdges.filter(e => e.caseId !== action.payload),
      };

    case 'LOAD_INVESTIGATIONS':
      return { ...state, investigations: action.payload };

    case 'ADD_ALERTS':
      return { ...state, alerts: [...action.payload, ...state.alerts] };

    case 'MARK_ALERT_READ':
      return {
        ...state,
        alerts: state.alerts.map(a =>
          a.id === action.payload ? { ...a, read: true } : a
        ),
      };

    case 'ADD_EVIDENCE':
      return {
        ...state,
        investigations: state.investigations.map(inv =>
          inv.id === action.payload.caseId
            ? { ...inv, evidence: [...(action.payload.evidence as Evidence[]), ...inv.evidence] }
            : inv
        ),
      };

    case 'ADD_GRAPH_DATA':
      return {
        ...state,
        graphNodes: [...state.graphNodes, ...action.payload.nodes],
        graphEdges: [...state.graphEdges, ...action.payload.edges],
      };

    case 'ADD_TIMELINE_ENTRY':
      return {
        ...state,
        investigations: state.investigations.map(inv =>
          inv.id === action.payload.caseId
            ? { ...inv, timeline: [...inv.timeline, action.payload.entry] }
            : inv
        ),
      };

    case 'ADD_NOTE':
      return {
        ...state,
        investigations: state.investigations.map(inv =>
          inv.id === action.payload.caseId
            ? { ...inv, notes: [...inv.notes, action.payload.note] }
            : inv
        ),
      };

    case 'START_SCAN':
      return {
        ...state,
        investigations: state.investigations.map(inv =>
          inv.id === action.payload.caseId
            ? { ...inv, status: 'active', scanStatus: 'deep' }
            : inv
        ),
      };

    case 'SCAN_COMPLETE': {
      const { caseId, result } = action.payload;

      const newAlerts = result.alerts.map(a => ({
        ...a,
        caseId,
      })) as Alert[];

      const newNodes: TaggedGraphNode[] = (result.graphNodes as GraphNode[]).map(n => ({
        ...n,
        caseId,
      }));
      const newEdges: TaggedGraphEdge[] = result.graphEdges.map(e => ({
        ...e,
        caseId,
      }));

      // Trigger standard browser notification for critical/high alerts
      const criticalAlerts = newAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');
      if (criticalAlerts.length > 0) {
        sendAlertNotification(
          `OSINT Alert: ${criticalAlerts.length} high/critical issue(s) found`,
          criticalAlerts.map(a => a.title).join('\n')
        );
      }

      return {
        ...state,
        alerts: [...newAlerts, ...state.alerts],
        graphNodes: [...state.graphNodes, ...newNodes],
        graphEdges: [...state.graphEdges, ...newEdges],
        investigations: state.investigations.map(inv => {
          if (inv.id !== caseId) return inv;
          return {
            ...inv,
            status: 'completed',
            scanStatus: 'complete',
            riskScore: result.riskScore,
            identityConfidence: result.identityConfidence,
            evidence: [...(result.evidence as unknown as Evidence[]), ...inv.evidence],
            alerts: [...newAlerts, ...inv.alerts],
            timeline: [
              ...inv.timeline,
              {
                id: `t_${Date.now()}`,
                timestamp: new Date().toISOString(),
                event: `Scan completed. Found ${result.evidence.length} evidence items and ${result.alerts.length} alerts.`,
                type: 'scan' as const,
              }
            ],
          };
        }),
      };
    }

    default:
      return state;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}

// Helper hook for triggering live scans
export function useScanRunner() {
  const { dispatch } = useStore();

  const startScan = async (
    investigationId: string,
    inputs: { type: string; value: string }[],
    onProgress?: (step: string) => void
  ) => {
    dispatch({ type: 'START_SCAN', payload: { caseId: investigationId } });

    try {
      const result = await runScan(inputs, investigationId, (step) => {
        onProgress?.(step);
        dispatch({
          type: 'ADD_TIMELINE_ENTRY',
          payload: {
            caseId: investigationId,
            entry: {
              id: `t_${Date.now()}_${Math.random()}`,
              timestamp: new Date().toISOString(),
              event: step,
              type: 'discovery',
            },
          },
        });
      });

      dispatch({ type: 'SCAN_COMPLETE', payload: { caseId: investigationId, result } });
      return result;
    } catch (err) {
      console.error('Scan failed:', err);
      dispatch({
        type: 'ADD_TIMELINE_ENTRY',
        payload: {
          caseId: investigationId,
          entry: {
            id: `err_${Date.now()}`,
            timestamp: new Date().toISOString(),
            event: `Scan failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
            type: 'alert',
          },
        },
      });
      throw err;
    }
  };

  return { startScan };
}
