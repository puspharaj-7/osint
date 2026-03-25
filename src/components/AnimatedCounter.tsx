import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

const AnimatedCounter = ({ value, duration = 900, className = '', suffix = '' }: AnimatedCounterProps) => {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const animate = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {display}{suffix}
    </span>
  );
};

export default AnimatedCounter;
