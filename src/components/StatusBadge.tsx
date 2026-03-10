interface StatusBadgeProps {
  status: string;
  variant?: 'risk' | 'status' | 'severity';
}

const StatusBadge = ({ status, variant = 'status' }: StatusBadgeProps) => {
  const getClasses = () => {
    if (variant === 'risk') {
      switch (status) {
        case 'critical': return 'bg-destructive/15 text-destructive border-destructive/30';
        case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
        case 'medium': return 'bg-warning/10 text-warning border-warning/20';
        case 'low': return 'bg-success/10 text-success border-success/20';
        default: return 'bg-muted text-muted-foreground border-border';
      }
    }
    if (variant === 'severity') {
      switch (status) {
        case 'critical': return 'bg-destructive/15 text-destructive border-destructive/30';
        case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
        case 'medium': return 'bg-warning/10 text-warning border-warning/20';
        case 'low': return 'bg-accent/10 text-accent border-accent/20';
        default: return 'bg-muted text-muted-foreground border-border';
      }
    }
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'completed': return 'bg-accent/10 text-accent border-accent/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'archived': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-display uppercase tracking-wider border ${getClasses()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
