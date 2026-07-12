import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { loadConfettiEngine, MAX_CONFETTI_PARTICLES } from "@/utils/wasm/confetti-particles-bytes";

interface WasmConfettiBurstProps {
  /** Increment this to fire a new rain of confetti. 0 (or unchanged) never fires. */
  triggerKey: number;
}

const POOL_SIZE = 480; // <= MAX_CONFETTI_PARTICLES, recycled as a rolling pool
const GRAVITY = 550; // px/s^2, canvas y grows downward
const RAIN_DURATION_MS = 6800; // how long new confetti keeps spawning from the top
const SPAWNS_PER_SECOND = 55;
const PARTICLE_MIN_LIFE = 2.5;
const PARTICLE_LIFE_JITTER = 1.5;
// Extra time after spawning stops, so the last drops finish falling instead
// of being cut off mid-air.
const TAIL_MS = (PARTICLE_MIN_LIFE + PARTICLE_LIFE_JITTER) * 1000;
const PARTICLE_SIZE = 6;
const COLORS = ["#1d4ed8", "#0891b2", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function WasmConfettiBurst({ triggerKey }: WasmConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef<string[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (triggerKey <= 0) return;

    const canvas = canvasRef.current;
    const engine = loadConfettiEngine();
    if (!canvas || !engine) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Full viewport, not the host card — the rain overlays the whole page
    // via a portal to <body> (see the return below).
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const poolSize = Math.min(POOL_SIZE, MAX_CONFETTI_PARTICLES);
    const colors = colorsRef.current;
    colors.length = poolSize;

    // Every slot starts inactive (life 0) so a previous rain's leftover
    // particles never flash on screen before the new one spawns its own.
    for (let i = 0; i < poolSize; i += 1) {
      engine.memory[i * 5 + 4] = 0;
      colors[i] = COLORS[i % COLORS.length];
    }

    const spawnParticle = (index: number) => {
      const offset = index * 5;
      engine.memory[offset + 0] = Math.random() * width;
      engine.memory[offset + 1] = -10 - Math.random() * 40;
      engine.memory[offset + 2] = (Math.random() - 0.5) * 60;
      engine.memory[offset + 3] = 20 + Math.random() * 40;
      engine.memory[offset + 4] = PARTICLE_MIN_LIFE + Math.random() * PARTICLE_LIFE_JITTER;
      colors[index] = COLORS[Math.floor(Math.random() * COLORS.length)];
    };

    let lastTime = performance.now();
    const spawnEndTime = lastTime + RAIN_DURATION_MS;
    const animationEndTime = spawnEndTime + TAIL_MS;
    let spawnCursor = 0;
    let spawnAccumulator = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (now < spawnEndTime) {
        spawnAccumulator += SPAWNS_PER_SECOND * dt;
        while (spawnAccumulator >= 1) {
          spawnParticle(spawnCursor);
          spawnCursor = (spawnCursor + 1) % poolSize;
          spawnAccumulator -= 1;
        }
      }

      engine.step(poolSize, dt, GRAVITY);

      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < poolSize; i += 1) {
        const offset = i * 5;
        const life = engine.memory[offset + 4];
        const y = engine.memory[offset + 1];
        if (life <= 0 || y > height) continue;

        ctx.globalAlpha = Math.max(0, Math.min(1, life));
        ctx.fillStyle = colors[i];
        ctx.fillRect(engine.memory[offset + 0], y, PARTICLE_SIZE, PARTICLE_SIZE * 1.6);
      }
      ctx.globalAlpha = 1;

      rafRef.current = now < animationEndTime ? requestAnimationFrame(frame) : null;
      if (rafRef.current === null) {
        ctx.clearRect(0, 0, width, height);
      }
    };

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [triggerKey]);

  return createPortal(
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999] h-screen w-screen"
      aria-hidden="true"
    />,
    document.body
  );
}
