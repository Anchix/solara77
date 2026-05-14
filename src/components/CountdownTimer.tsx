import { useEffect, useState } from "react";
import { formatTimeLeft, BOGO_END } from "@/lib/bogo";

interface Props {
  variant?: "light" | "dark" | "inline";
  className?: string;
}

const Box = ({ value, label, dark }: { value: number; label: string; dark: boolean }) => (
  <div className={`flex flex-col items-center justify-center rounded-md px-2 py-1 min-w-[44px] ${dark ? "bg-foreground text-background" : "bg-background text-foreground"} shadow-sm`}>
    <span className="font-display text-lg md:text-xl font-semibold leading-none tabular-nums">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[9px] uppercase tracking-wider opacity-70 mt-0.5">{label}</span>
  </div>
);

const CountdownTimer = ({ variant = "light", className = "" }: Props) => {
  const [t, setT] = useState(() => formatTimeLeft(BOGO_END));
  useEffect(() => {
    const id = setInterval(() => setT(formatTimeLeft(BOGO_END)), 1000);
    return () => clearInterval(id);
  }, []);

  if (t.ended) return null;
  const dark = variant === "dark";

  if (variant === "inline") {
    return (
      <span className={`inline-flex items-center gap-1 font-medium tabular-nums ${className}`}>
        <span>{t.days}d</span>:<span>{String(t.hours).padStart(2, "0")}h</span>:
        <span>{String(t.minutes).padStart(2, "0")}m</span>:
        <span>{String(t.seconds).padStart(2, "0")}s</span>
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Box value={t.days} label="Days" dark={dark} />
      <Box value={t.hours} label="Hrs" dark={dark} />
      <Box value={t.minutes} label="Min" dark={dark} />
      <Box value={t.seconds} label="Sec" dark={dark} />
    </div>
  );
};

export default CountdownTimer;
