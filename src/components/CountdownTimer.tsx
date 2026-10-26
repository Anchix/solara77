import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

const DAY = 86400000;

const compute = (end: Date, noLoop = false) => {
  // Loops every 24 hours once the end time passes, so the offer timer never shows "ended".
  // noLoop keeps a fixed deadline (used by the flash-sale countdown).
  let diff = end.getTime() - Date.now();
  if (diff <= 0 && !noLoop) diff = DAY - ((-diff) % DAY);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, ended: diff <= 0 };
};

const CountdownTimer = ({ end, compact = false, noLoop = false }: { end: Date; compact?: boolean; noLoop?: boolean }) => {
  const [t, setT] = useState(() => compute(end, noLoop));

  useEffect(() => {
    const id = setInterval(() => setT(compute(end, noLoop)), 1000);
    return () => clearInterval(id);
  }, [end, noLoop]);

  if (t.ended) return <span className="font-semibold">Offer ended</span>;

  if (compact) {
    return (
      <span className="font-mono font-semibold tabular-nums">
        {t.days}d {pad(t.hours)}:{pad(t.minutes)}:{pad(t.seconds)}
      </span>
    );
  }

  const Cell = ({ v, l }: { v: number; l: string }) => (
    <div className="flex flex-col items-center bg-background/20 backdrop-blur-sm rounded-md px-2.5 py-1.5 min-w-[46px]">
      <span className="font-mono font-bold text-base leading-none tabular-nums">{pad(v)}</span>
      <span className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">{l}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-1.5">
      <Cell v={t.days} l="Days" />
      <Cell v={t.hours} l="Hrs" />
      <Cell v={t.minutes} l="Min" />
      <Cell v={t.seconds} l="Sec" />
    </div>
  );
};

export default CountdownTimer;
