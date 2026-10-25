import { useEffect, useRef } from "react";
import { isDiwaliTheme } from "@/lib/diwali";

/**
 * Canvas fireworks bursting over the hero while the Diwali theme window
 * (src/lib/diwali.ts) is active. Purely decorative: pointer-events-none,
 * paused when off-screen, and disabled for prefers-reduced-motion.
 */

type Particle = {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
};

type Rocket = {
  x: number; y: number; vy: number; targetY: number; color: string;
};

// Brand-adjacent festive palette: gold, ember, rose, warm amber, spark red
const PALETTE = ["#f2c14e", "#ffa94d", "#f78fb3", "#ffd977", "#ff7b6b", "#ffe8a3"];

const DiwaliFireworks = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isDiwaliTheme()) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    let raf = 0;
    let lastSpawn = performance.now();
    let visible = true;
    let stopped = false;

    const io = new IntersectionObserver(
      (entries) => { visible = entries.some((e) => e.isIntersecting); },
      { threshold: 0.15 }
    );
    io.observe(canvas);

    const onVisibility = () => { visible = visible && !document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    const spawnRocket = (now: number) => {
      const count = Math.random() < 0.25 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const x = width * (0.12 + Math.random() * 0.76);
        const targetY = height * (0.08 + Math.random() * 0.3);
        rockets.push({
          x,
          y: height + 10,
          vy: -(height / 90 + Math.random() * (height / 110)),
          targetY,
          color: PALETTE[(Math.random() * PALETTE.length) | 0],
        });
      }
      lastSpawn = now + (Math.random() - 0.5) * 400;
    };

    const explode = (r: Rocket) => {
      const n = 46 + ((Math.random() * 24) | 0);
      const speed = height / 150;
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2 + Math.random() * 0.3;
        const v = speed * (0.5 + Math.random() * 0.85);
        particles.push({
          x: r.x,
          y: r.y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: 0,
          maxLife: 70 + Math.random() * 35,
          color: Math.random() < 0.75 ? r.color : PALETTE[(Math.random() * PALETTE.length) | 0],
          size: 1.4 + Math.random() * 1.6,
        });
      }
    };

    const tick = (now: number) => {
      if (stopped) return;
      raf = requestAnimationFrame(tick);

      ctx.clearRect(0, 0, width, height);
      if (!visible) return;

      if (now - lastSpawn > 1050) spawnRocket(now);

      // rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy += height / 3200; // slight gravity
        // sparkle trail
        if (Math.random() < 0.6) {
          particles.push({
            x: r.x + (Math.random() - 0.5) * 3,
            y: r.y,
            vx: (Math.random() - 0.5) * 0.6,
            vy: 0.6 + Math.random() * 0.6,
            life: 0,
            maxLife: 18 + Math.random() * 10,
            color: "#ffe8a3",
            size: 0.9,
          });
        }
        if (r.y <= r.targetY || r.vy > -1) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      // particles
      ctx.globalCompositeOperation = "lighter";
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += height / 3600; // gravity
        p.vx *= 0.985;
        p.vy *= 0.985;
        const t = 1 - p.life / p.maxLife;
        if (t <= 0 || p.y > height + 20) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.min(1, t * 1.3) * 0.35;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = Math.min(1, t * 1.3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // keep memory bounded
      if (particles.length > 900) particles.splice(0, particles.length - 900);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (!isDiwaliTheme()) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[15] h-full w-full"
    />
  );
};

export default DiwaliFireworks;
