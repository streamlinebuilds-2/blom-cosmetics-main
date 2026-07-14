import React, { useEffect, useState } from 'react';

interface CountdownProps {
  /** ISO target the countdown runs to, e.g. '2026-07-16T00:00:00+02:00'. */
  target: string;
  /** Text shown once the target has passed. */
  endedLabel?: string;
  className?: string;
  /** Fired once when the countdown reaches zero. */
  onEnd?: () => void;
}

function format(msLeft: number): string {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return d > 0
    ? `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`
    : `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

/**
 * Live HH:MM:SS-style countdown to an ISO target. Text-only so it can sit inside
 * the hero chip and the promo popup alike. Updates once per second and cleans up.
 */
export const Countdown: React.FC<CountdownProps> = ({ target, endedLabel = 'Offer ended', className, onEnd }) => {
  const targetMs = new Date(target).getTime();
  const [now, setNow] = useState(() => Date.now());
  const endedRef = React.useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = targetMs - now;

  useEffect(() => {
    if (diff <= 0 && !endedRef.current) {
      endedRef.current = true;
      onEnd?.();
    }
  }, [diff, onEnd]);

  return (
    <span className={className} aria-live="off">
      {diff <= 0 ? endedLabel : format(diff)}
    </span>
  );
};
