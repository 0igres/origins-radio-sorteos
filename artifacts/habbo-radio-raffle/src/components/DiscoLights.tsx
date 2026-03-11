import { motion } from "framer-motion";

const SPOTLIGHTS = [
  { x: 12, r: 255, g: 0,   b: 100, duration: 3.2, swing: 28 },
  { x: 30, r: 0,   g: 180, b: 255, duration: 4.1, swing: 22 },
  { x: 50, r: 255, g: 220, b: 0,   duration: 2.7, swing: 35 },
  { x: 70, r: 160, g: 0,   b: 255, duration: 3.8, swing: 22 },
  { x: 88, r: 0,   g: 255, b: 140, duration: 4.4, swing: 28 },
];

const REFLECTIONS = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  x: 4 + ((i * 11 + 3) % 92),
  y: 30 + ((i * 17 + 7) % 58),
  hue: (i * 47) % 360,
  size: 3 + (i % 4),
  delay: (i * 0.18) % 2.5,
  duration: 0.35 + (i % 8) * 0.08,
}));

export function DiscoLights({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 200 }}>

      {/* Rotating spotlight beams */}
      {SPOTLIGHTS.map((light, i) => (
        <motion.div
          key={`beam-${i}`}
          style={{
            position: "absolute",
            left: `${light.x}%`,
            top: "0%",
            width: "320px",
            height: "520px",
            marginLeft: "-160px",
            background: `linear-gradient(to bottom,
              rgba(${light.r},${light.g},${light.b}, 0.75) 0%,
              rgba(${light.r},${light.g},${light.b}, 0.25) 50%,
              transparent 100%)`,
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            transformOrigin: "50% 0%",
          }}
          animate={{
            rotate: [`-${light.swing}deg`, `${light.swing}deg`, `-${light.swing}deg`],
          }}
          transition={{
            duration: light.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floor glow where beams land */}
      {SPOTLIGHTS.map((light, i) => (
        <motion.div
          key={`glow-${i}`}
          style={{
            position: "absolute",
            left: `${light.x}%`,
            bottom: "18%",
            width: "120px",
            height: "30px",
            marginLeft: "-60px",
            borderRadius: "50%",
            background: `radial-gradient(ellipse, rgba(${light.r},${light.g},${light.b}, 0.5), transparent)`,
          }}
          animate={{
            x: [`-${light.swing * 3}px`, `${light.swing * 3}px`, `-${light.swing * 3}px`],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: light.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Disco ball reflections — small coloured flashes */}
      {REFLECTIONS.map((dot) => (
        <motion.div
          key={`dot-${dot.id}`}
          style={{
            position: "absolute",
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            borderRadius: "50%",
            backgroundColor: `hsl(${dot.hue}, 100%, 65%)`,
            boxShadow: `0 0 ${dot.size * 3}px hsl(${dot.hue}, 100%, 65%)`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.8, 0.5] }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle overall colour wash that cycles */}
      <motion.div
        style={{ position: "absolute", inset: 0 }}
        animate={{
          background: [
            "rgba(255,0,100,0.05)",
            "rgba(0,180,255,0.05)",
            "rgba(255,220,0,0.05)",
            "rgba(140,0,255,0.05)",
            "rgba(0,255,140,0.05)",
            "rgba(255,0,100,0.05)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Sharp strobe flash */}
      <motion.div
        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.12)" }}
        animate={{ opacity: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
