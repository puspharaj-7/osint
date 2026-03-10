import { motion } from 'framer-motion';

interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const RiskGauge = ({ score, size = 'md', label }: RiskGaugeProps) => {
  const getColor = () => {
    if (score >= 80) return 'text-destructive';
    if (score >= 60) return 'text-warning';
    if (score >= 40) return 'text-accent';
    return 'text-success';
  };

  const getBgColor = () => {
    if (score >= 80) return 'stroke-destructive';
    if (score >= 60) return 'stroke-warning';
    if (score >= 40) return 'stroke-accent';
    return 'stroke-success';
  };

  const dimensions = { sm: 80, md: 120, lg: 160 };
  const dim = dimensions[size];
  const strokeWidth = size === 'sm' ? 4 : 6;
  const radius = (dim - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            className="stroke-secondary"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            className={getBgColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-display font-bold ${getColor()} ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-4xl'}`}>
            {score}
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>}
    </div>
  );
};

export default RiskGauge;
