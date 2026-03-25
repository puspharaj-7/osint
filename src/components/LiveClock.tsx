import { useEffect, useState } from 'react';

const LiveClock = ({ className = '' }: { className?: string }) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const h = pad(time.getUTCHours());
  const m = pad(time.getUTCMinutes());
  const s = pad(time.getUTCSeconds());
  const date = time.toUTCString().slice(0, 16);

  return (
    <div className={`font-display text-[10px] text-muted-foreground tracking-widest ${className}`}>
      <div className="text-primary/80">{h}:{m}:{s} UTC</div>
      <div className="opacity-60 mt-0.5">{date}</div>
    </div>
  );
};

export default LiveClock;
