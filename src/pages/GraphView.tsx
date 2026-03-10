import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockGraphNodes, mockGraphEdges, type GraphNode } from '@/lib/mock-data';
import { User, Mail, Phone, Building2, Globe, Wifi, Share2, Image } from 'lucide-react';

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

const GraphView = () => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [nodes] = useState(mockGraphNodes);
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div className="p-8 h-[calc(100vh)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">GRAPH INTELLIGENCE</h1>
          <p className="text-sm text-muted-foreground">Entity relationship visualization</p>
        </div>
        {selectedNode && (
          <div className="glass-panel px-4 py-2 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: nodeColors[selectedNode.type] }} />
            <span className="font-display text-sm text-foreground">{selectedNode.label}</span>
            <span className="text-xs text-muted-foreground uppercase">{selectedNode.type}</span>
          </div>
        )}
      </div>

      <div className="flex-1 glass-panel overflow-hidden relative scanline">
        <svg ref={svgRef} className="w-full h-full" viewBox="0 0 700 600">
          {/* Grid pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(220, 16%, 14%)" strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="700" height="600" fill="url(#grid)" />

          {/* Edges */}
          {mockGraphEdges.map((edge, i) => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            if (!source || !target) return null;
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            return (
              <g key={i}>
                <motion.line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="hsl(220, 16%, 25%)"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                />
                <text x={midX} y={midY - 6} fill="hsl(215, 15%, 50%)" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono">
                  {edge.relationship}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => {
            const Icon = nodeIcons[node.type] || User;
            const color = nodeColors[node.type];
            const isSelected = selectedNode?.id === node.id;
            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onClick={() => setSelectedNode(isSelected ? null : node)}
                className="cursor-pointer"
              >
                {isSelected && (
                  <circle cx={node.x} cy={node.y} r="30" fill="none" stroke={color} strokeWidth="1" opacity="0.3">
                    <animate attributeName="r" from="28" to="36" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={node.x} cy={node.y} r="22" fill="hsl(220, 18%, 12%)" stroke={color} strokeWidth={isSelected ? 2 : 1} />
                <foreignObject x={node.x - 8} y={node.y - 8} width="16" height="16">
                  <Icon style={{ width: 16, height: 16, color }} />
                </foreignObject>
                <text x={node.x} y={node.y + 38} fill="hsl(210, 20%, 80%)" fontSize="10" textAnchor="middle" fontFamily="Inter">
                  {node.label}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* Legend */}
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
      </div>
    </div>
  );
};

export default GraphView;
