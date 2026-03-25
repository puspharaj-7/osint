import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { User, Mail, Phone, Building2, Globe, Wifi, Share2, Image, ZoomIn, ZoomOut, Maximize2, ArrowLeft, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GraphNode } from '@/lib/mock-data';
import type { TaggedGraphNode, TaggedGraphEdge } from '@/lib/store-context';

const nodeIcons: Record<string, typeof User> = {
  person: User, email: Mail, phone: Phone, company: Building2,
  domain: Globe, ip: Wifi, social: Share2, image: Image,
};

const nodeColors: Record<string, string> = {
  person:  'hsl(160, 80%, 45%)',
  email:   'hsl(200, 70%, 50%)',
  phone:   'hsl(38, 92%, 50%)',
  company: 'hsl(280, 60%, 55%)',
  domain:  'hsl(0, 72%, 51%)',
  ip:      'hsl(330, 70%, 50%)',
  social:  'hsl(210, 70%, 60%)',
  image:   'hsl(150, 50%, 50%)',
};

interface ViewTransform { x: number; y: number; scale: number; }

const GraphView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const caseIdFilter = searchParams.get('case');
  const { state: { graphNodes, graphEdges, investigations } } = useStore();

  const nodes: TaggedGraphNode[] = caseIdFilter ? graphNodes.filter(n => n.caseId === caseIdFilter) : graphNodes;
  const edges: TaggedGraphEdge[] = caseIdFilter ? graphEdges.filter(e => e.caseId === caseIdFilter) : graphEdges;
  const caseInfo = caseIdFilter ? investigations.find(i => i.id === caseIdFilter) : null;

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [transform, setTransform] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setNodePositions(prev => {
      const next = { ...prev };
      nodes.forEach(n => { if (!(n.id in next)) next[n.id] = { x: n.x, y: n.y }; });
      return next;
    });
  }, [nodes]);

  const getNodePos = (id: string, fallback: { x: number; y: number }) => nodePositions[id] ?? fallback;

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({ ...t, scale: Math.min(3, Math.max(0.2, t.scale * delta)) }));
  }, []);

  const handleSvgMouseDown = useCallback((e: React.MouseEvent) => {
    if (isDraggingNode) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
  }, [transform, isDraggingNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingNode) {
      const svgEl = svgRef.current;
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      const svgX = (e.clientX - rect.left - transform.x) / transform.scale;
      const svgY = (e.clientY - rect.top - transform.y) / transform.scale;
      setNodePositions(prev => ({ ...prev, [isDraggingNode]: { x: svgX, y: svgY } }));
    } else if (isPanning && panStart.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setTransform(t => ({ ...t, x: panStart.current!.tx + dx, y: panStart.current!.ty + dy }));
    }
  }, [isPanning, isDraggingNode, transform]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setIsDraggingNode(null);
    panStart.current = null;
  }, []);

  const zoomIn  = () => setTransform(t => ({ ...t, scale: Math.min(3, t.scale * 1.2) }));
  const zoomOut = () => setTransform(t => ({ ...t, scale: Math.max(0.2, t.scale * 0.8) }));
  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  // Connected edges for highlight
  const connectedEdgeIds = selectedNode
    ? new Set(edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map(e => `${e.source}-${e.target}`))
    : new Set<string>();

  // Connected node ids
  const connectedNodeIds = selectedNode
    ? new Set(edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).flatMap(e => [e.source, e.target]))
    : new Set<string>();

  return (
    <div className="p-4 sm:p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {caseIdFilter && (
            <Button variant="ghost" size="sm" onClick={() => navigate(`/cases/${caseIdFilter}`)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Case
            </Button>
          )}
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-wider">GRAPH INTELLIGENCE</h1>
            <p className="text-sm text-muted-foreground">
              {caseInfo
                ? `"${caseInfo.target}" · ${caseInfo.caseId}`
                : 'Entity relationship visualization'}
              <span className="ml-2 font-display text-xs text-primary">{nodes.length} nodes · {edges.length} edges</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 glass-panel p-1">
            <Button variant="ghost" size="sm" onClick={zoomIn}  className="h-7 w-7 p-0 hover:bg-secondary"><ZoomIn className="w-3.5 h-3.5" /></Button>
            <span className="text-xs font-display text-muted-foreground w-12 text-center">{Math.round(transform.scale * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={zoomOut} className="h-7 w-7 p-0 hover:bg-secondary"><ZoomOut className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="sm" onClick={resetView} className="h-7 w-7 p-0 hover:bg-secondary"><Maximize2 className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </div>

      {/* Canvas + panel wrapper */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Graph Canvas */}
        <div className="flex-1 glass-panel overflow-hidden relative scanline rounded-lg">
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
              <Share2 className="w-12 h-12 text-muted-foreground/20 animate-float" />
              <p className="text-muted-foreground text-sm font-display">
                {caseIdFilter ? 'No graph data for this case. Run a scan first.' : 'No graph data available.'}
              </p>
            </div>
          )}

          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ cursor: isPanning ? 'grabbing' : isDraggingNode ? 'grabbing' : 'grab' }}
            onWheel={handleWheel}
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(220, 16%, 14%)" strokeWidth="0.5" opacity="0.5" />
              </pattern>
              <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="hsl(220, 16%, 35%)" />
              </marker>
              <marker id="arrowhead-active" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="hsl(160, 80%, 45%)" />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
              {/* Edges */}
              {edges.map((edge, i) => {
                const source = nodes.find(n => n.id === edge.source);
                const target = nodes.find(n => n.id === edge.target);
                if (!source || !target) return null;
                const sp = getNodePos(source.id, source);
                const tp = getNodePos(target.id, target);
                const midX = (sp.x + tp.x) / 2;
                const midY = (sp.y + tp.y) / 2;
                const edgeKey = `${edge.source}-${edge.target}`;
                const isHighlighted = connectedEdgeIds.has(edgeKey);
                return (
                  <g key={i}>
                    <line
                      x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
                      stroke={isHighlighted ? 'hsl(160, 80%, 45%)' : 'hsl(220, 16%, 30%)'}
                      strokeWidth={isHighlighted ? 2 : 1.5}
                      markerEnd={isHighlighted ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                      strokeDasharray={isHighlighted ? 'none' : '4 2'}
                      opacity={selectedNode && !isHighlighted ? 0.25 : 0.75}
                    />
                    <text x={midX} y={midY - 6} fill={isHighlighted ? 'hsl(160, 80%, 55%)' : 'hsl(215, 15%, 45%)'} fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                      {edge.relationship}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node, i) => {
                const Icon = nodeIcons[node.type] || User;
                const color = nodeColors[node.type] ?? 'hsl(160, 80%, 45%)';
                const isSelected = selectedNode?.id === node.id;
                const isConnected = connectedNodeIds.has(node.id);
                const isDimmed = selectedNode && !isSelected && !isConnected;
                const pos = getNodePos(node.id, node);
                return (
                  <motion.g
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: isDimmed ? 0.3 : 1 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    style={{ cursor: 'grab' }}
                    onMouseDown={e => { e.stopPropagation(); setIsDraggingNode(node.id); }}
                    onClick={e => { e.stopPropagation(); setSelectedNode(isSelected ? null : node); }}
                  >
                    {isSelected && (
                      <circle cx={pos.x} cy={pos.y} r="32" fill="none" stroke={color} strokeWidth="1" opacity="0.4">
                        <animate attributeName="r" from="28" to="40" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={pos.x} cy={pos.y} r="28" fill={`${color}18`} />
                    <circle cx={pos.x} cy={pos.y} r="22"
                      fill="hsl(220, 18%, 12%)"
                      stroke={color}
                      strokeWidth={isSelected ? 3 : isConnected ? 2 : 1.5}
                    />
                    <foreignObject x={pos.x - 9} y={pos.y - 9} width="18" height="18">
                      <Icon style={{ width: 18, height: 18, color }} />
                    </foreignObject>
                    <text x={pos.x} y={pos.y + 38} fill="hsl(210, 20%, 80%)" fontSize="10" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="500">
                      {node.label.length > 18 ? node.label.slice(0, 16) + '..' : node.label}
                    </text>
                    <text x={pos.x} y={pos.y + 50} fill="hsl(215, 15%, 45%)" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                      {node.type.toUpperCase()}
                    </text>
                  </motion.g>
                );
              })}
            </g>
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 glass-panel p-3">
            <p className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-2">Entity Types</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(nodeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hint */}
          <div className="absolute bottom-4 right-4 glass-panel px-3 py-1.5">
            <p className="text-[10px] text-muted-foreground font-display">Scroll to zoom · Drag to pan · Click node to inspect</p>
          </div>
        </div>

        {/* Node Detail Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 32, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 280 }}
              exit={{ opacity: 0, x: 32, width: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="glass-panel overflow-hidden shrink-0 flex flex-col"
              style={{ minWidth: 260 }}
            >
              <div className="p-4 border-b border-border/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="font-display text-xs uppercase tracking-wider text-primary">Node Details</span>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary/50 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Node identity */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0" style={{ borderColor: nodeColors[selectedNode.type], backgroundColor: `${nodeColors[selectedNode.type]}18` }}>
                    {(() => { const Icon = nodeIcons[selectedNode.type] || User; return <Icon style={{ width: 18, height: 18, color: nodeColors[selectedNode.type] }} />; })()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{selectedNode.label}</p>
                    <span className="text-[10px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: `${nodeColors[selectedNode.type]}20`, color: nodeColors[selectedNode.type] }}>
                      {selectedNode.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Node ID */}
                <div>
                  <p className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-1">Node ID</p>
                  <p className="text-xs text-foreground font-mono bg-secondary/40 p-2 rounded border border-border/20 break-all">{selectedNode.id}</p>
                </div>

                {/* Connected edges */}
                <div>
                  <p className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-2">
                    Connections ({edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length})
                  </p>
                  <div className="space-y-1.5">
                    {edges
                      .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map((e, i) => {
                        const isOutbound = e.source === selectedNode.id;
                        const otherId = isOutbound ? e.target : e.source;
                        const other = nodes.find(n => n.id === otherId);
                        return (
                          <div key={i} className="flex items-center gap-2 p-2 rounded bg-secondary/30 border border-border/20">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: other ? nodeColors[other.type] : '#666' }} />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] text-foreground truncate">{other?.label ?? otherId}</p>
                              <p className="text-[9px] text-muted-foreground font-display">{isOutbound ? '→' : '←'} {e.relationship}</p>
                            </div>
                          </div>
                        );
                      })}
                    {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No connections</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GraphView;
