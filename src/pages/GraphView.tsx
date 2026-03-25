import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { User, Mail, Phone, Building2, Globe, Wifi, Share2, Image, ZoomIn, ZoomOut, Maximize2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GraphNode } from '@/lib/mock-data';
import type { TaggedGraphNode, TaggedGraphEdge } from '@/lib/store-context';

const nodeIcons: Record<string, typeof User> = {
  person: User,
  email: Mail,
  phone: Phone,
  company: Building2,
  domain: Globe,
  ip: Wifi,
  social: Share2,
  image: Image,
};

const nodeColors: Record<string, string> = {
  person: 'hsl(160, 80%, 45%)',
  email: 'hsl(200, 70%, 50%)',
  phone: 'hsl(38, 92%, 50%)',
  company: 'hsl(280, 60%, 55%)',
  domain: 'hsl(0, 72%, 51%)',
  ip: 'hsl(330, 70%, 50%)',
  social: 'hsl(210, 70%, 60%)',
  image: 'hsl(150, 50%, 50%)',
};

interface ViewTransform {
  x: number;
  y: number;
  scale: number;
}

const GraphView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const caseIdFilter = searchParams.get('case');
  const { state: { graphNodes, graphEdges, investigations } } = useStore();

  // Per-case filtering
  const nodes: TaggedGraphNode[] = caseIdFilter
    ? graphNodes.filter(n => n.caseId === caseIdFilter)
    : graphNodes;
  const edges: TaggedGraphEdge[] = caseIdFilter
    ? graphEdges.filter(e => e.caseId === caseIdFilter)
    : graphEdges;

  const caseInfo = caseIdFilter
    ? investigations.find(i => i.id === caseIdFilter)
    : null;

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Pan/zoom state
  const [transform, setTransform] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Sync node positions from store into local state when nodes change
  useEffect(() => {
    setNodePositions(prev => {
      const next = { ...prev };
      nodes.forEach(n => {
        if (!(n.id in next)) {
          next[n.id] = { x: n.x, y: n.y };
        }
      });
      return next;
    });
  }, [nodes]);

  const getNodePos = (id: string, fallback: { x: number; y: number }) =>
    nodePositions[id] ?? fallback;

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({
      ...t,
      scale: Math.min(3, Math.max(0.2, t.scale * delta)),
    }));
  }, []);

  // Pan start
  const handleSvgMouseDown = useCallback((e: React.MouseEvent) => {
    if (isDraggingNode) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
  }, [transform, isDraggingNode]);

  // Mouse move — pan or drag node
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

  const zoomIn = () => setTransform(t => ({ ...t, scale: Math.min(3, t.scale * 1.2) }));
  const zoomOut = () => setTransform(t => ({ ...t, scale: Math.max(0.2, t.scale * 0.8) }));
  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  return (
    <div className="p-4 sm:p-8 h-screen flex flex-col">
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
                ? `Showing ${nodes.length} entities for "${caseInfo.target}" · ${caseInfo.caseId}`
                : `Entity relationship visualization · ${nodes.length} nodes`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedNode && (
            <div className="glass-panel px-3 py-1.5 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nodeColors[selectedNode.type] }} />
              <span className="font-display text-sm text-foreground">{selectedNode.label}</span>
              <span className="text-xs text-muted-foreground uppercase">{selectedNode.type}</span>
            </div>
          )}
          {/* Zoom controls */}
          <div className="flex items-center gap-1 glass-panel p-1">
            <Button variant="ghost" size="sm" onClick={zoomIn} className="h-7 w-7 p-0 hover:bg-secondary">
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs font-display text-muted-foreground w-12 text-center">
              {Math.round(transform.scale * 100)}%
            </span>
            <Button variant="ghost" size="sm" onClick={zoomOut} className="h-7 w-7 p-0 hover:bg-secondary">
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={resetView} className="h-7 w-7 p-0 hover:bg-secondary">
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1 glass-panel overflow-hidden relative scanline rounded-lg">
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
            <Share2 className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm font-display">
              {caseIdFilter ? 'No graph data for this case yet. Run a scan first.' : 'No graph data available.'}
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
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Pannable/Zoomable group */}
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
              return (
                <g key={i}>
                  <line
                    x1={sp.x} y1={sp.y}
                    x2={tp.x} y2={tp.y}
                    stroke="hsl(220, 16%, 30%)"
                    strokeWidth="1.5"
                    markerEnd="url(#arrowhead)"
                    strokeDasharray="4 2"
                    opacity="0.7"
                  />
                  <text x={midX} y={midY - 6} fill="hsl(215, 15%, 45%)" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
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
              const pos = getNodePos(node.id, node);

              return (
                <motion.g
                  key={node.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  style={{ cursor: 'grab' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDraggingNode(node.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(isSelected ? null : node);
                  }}
                >
                  {/* Selection pulse ring */}
                  {isSelected && (
                    <circle cx={pos.x} cy={pos.y} r="32" fill="none" stroke={color} strokeWidth="1" opacity="0.4">
                      <animate attributeName="r" from="28" to="38" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Node glow */}
                  <circle cx={pos.x} cy={pos.y} r="24" fill={`${color}22`} />
                  {/* Node body */}
                  <circle
                    cx={pos.x} cy={pos.y} r="22"
                    fill="hsl(220, 18%, 12%)"
                    stroke={color}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  <foreignObject x={pos.x - 9} y={pos.y - 9} width="18" height="18">
                    <Icon style={{ width: 18, height: 18, color }} />
                  </foreignObject>
                  {/* Label */}
                  <text
                    x={pos.x} y={pos.y + 38}
                    fill="hsl(210, 20%, 80%)"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                  >
                    {node.label.length > 18 ? node.label.slice(0, 16) + '..' : node.label}
                  </text>
                  <text
                    x={pos.x} y={pos.y + 50}
                    fill="hsl(215, 15%, 45%)"
                    fontSize="8"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {node.type.toUpperCase()}
                  </text>
                </motion.g>
              );
            })}
          </g>
        </svg>

        {/* Entity type legend */}
        <div className="absolute bottom-4 left-4 glass-panel p-3">
          <p className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mb-2">Entity Types</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(nodeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pan/Zoom help hint */}
        <div className="absolute bottom-4 right-4 glass-panel px-3 py-1.5">
          <p className="text-[10px] text-muted-foreground font-display">Scroll to zoom · Drag to pan · Drag nodes to move</p>
        </div>
      </div>
    </div>
  );
};

export default GraphView;
