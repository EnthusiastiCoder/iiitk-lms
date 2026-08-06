"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Star } from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  angle: number;
  distance: number;
}

const PARTICLE_COLORS = [
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f43f5e", // rose
  "#3b82f6", // blue
  "#ec4899", // pink
  "#eab308", // yellow
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 10,
    y: 50 + (Math.random() - 0.5) * 10,
    size: Math.random() * 8 + 4,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    delay: Math.random() * 0.3,
    angle: (360 / count) * i + Math.random() * 30,
    distance: Math.random() * 150 + 80,
  }));
}

interface XpCelebrationProps {
  xp: number;
  leveledUp?: boolean;
  newLevel?: number;
  onDismiss: () => void;
}

export function XpCelebration({
  xp,
  leveledUp = false,
  newLevel,
  onDismiss,
}: XpCelebrationProps) {
  const [particles] = useState(() => generateParticles(24));
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(dismiss, 2500);
    return () => clearTimeout(timer);
  }, [dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={dismiss}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Content */}
          <div className="relative flex flex-col items-center">
            {/* Particles */}
            {particles.map((p) => {
              const rad = (p.angle * Math.PI) / 180;
              const tx = Math.cos(rad) * p.distance;
              const ty = Math.sin(rad) * p.distance;
              return (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                  }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: tx,
                    y: ty,
                    scale: [0, 1.2, 0.8],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: p.delay,
                    ease: "easeOut",
                  }}
                />
              );
            })}

            {/* XP Text */}
            <motion.div
              className="flex flex-col items-center gap-3 relative z-10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 12,
                delay: 0.1,
              }}
            >
              <motion.div
                className="rounded-full bg-amber-500/20 p-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Zap className="h-10 w-10 text-amber-400 fill-amber-400" />
              </motion.div>

              <motion.span
                className="text-5xl sm:text-6xl font-black text-white tracking-tight"
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1.15, 1] }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                +{xp} XP
              </motion.span>

              {leveledUp && (
                <motion.div
                  className="flex items-center gap-2 mt-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="text-xl font-bold text-amber-300">
                    Level Up! Level {newLevel}
                  </span>
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                </motion.div>
              )}

              <motion.span
                className="text-sm text-white/60 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Tap anywhere to dismiss
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
