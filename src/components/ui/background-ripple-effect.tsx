import { useMemo } from "react";
import { motion } from "framer-motion";

type LayerConfig = {
  size: number;
  top: string;
  left: string;
  color: string;
  duration: number;
  delay?: number;
  opacity?: number[];
};

export function BackgroundRippleEffect() {
  const glowLayers = useMemo<LayerConfig[]>(
    () => [
      { size: 520, top: "20%", left: "22%", color: "rgba(52, 211, 153, 0.18)", duration: 18, opacity: [0.15, 0.32, 0.18] },
      { size: 680, top: "18%", left: "78%", color: "rgba(59, 130, 246, 0.16)", duration: 22, delay: 1.2, opacity: [0.1, 0.24, 0.12] },
      { size: 820, top: "78%", left: "50%", color: "rgba(16, 185, 129, 0.14)", duration: 26, delay: 2, opacity: [0.08, 0.2, 0.1] },
    ],
    [],
  );

  const rippleRings = useMemo<LayerConfig[]>(
    () => [
      { size: 880, top: "52%", left: "50%", color: "rgba(255,255,255,0.12)", duration: 24 },
      { size: 1120, top: "48%", left: "52%", color: "rgba(52, 211, 153, 0.12)", duration: 28, delay: 1.4 },
      { size: 1320, top: "58%", left: "48%", color: "rgba(56, 189, 248, 0.1)", duration: 32, delay: 2.6 },
    ],
    [],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b13] via-[#0a111b] to-[#05070c]" />

      <div className="absolute inset-0 opacity-90 [mask-image:radial-gradient(circle_at_center,rgba(0,0,0,0.75),transparent_68%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_80%_14%,rgba(56,189,248,0.14),transparent_38%),radial-gradient(circle_at_50%_82%,rgba(59,130,246,0.12),transparent_42%)] blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_35%,transparent_55%)]" />
      </div>

      {glowLayers.map((layer, idx) => (
        <motion.div
          key={`glow-${idx}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
          style={{
            width: layer.size,
            height: layer.size,
            top: layer.top,
            left: layer.left,
            background: layer.color,
          }}
          animate={{ scale: [0.92, 1.14, 0.96], opacity: layer.opacity ?? [0.12, 0.28, 0.14] }}
          transition={{
            duration: layer.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: layer.delay ?? 0,
          }}
        />
      ))}

      {rippleRings.map((layer, idx) => (
        <motion.div
          key={`ring-${idx}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8 [box-shadow:0_0_200px_80px_rgba(16,185,129,0.08)]"
          style={{
            width: layer.size,
            height: layer.size,
            top: layer.top,
            left: layer.left,
          }}
          animate={{ scale: [0.88, 1.12, 0.94], opacity: [0.06, 0.18, 0.1] }}
          transition={{
            duration: layer.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: layer.delay ?? 0,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
    </div>
  );
}
