import { motion } from "framer-motion";

const LIGHT_POSITIONS = [
  { x: 15, y: 8, color: "red" },
  { x: 85, y: 8, color: "blue" },
  { x: 25, y: 15, color: "yellow" },
  { x: 75, y: 15, color: "cyan" },
  { x: 50, y: 10, color: "magenta" },
];

export function DiscoLights({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 40 }}>
      {LIGHT_POSITIONS.map((light, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${light.x}%`,
            top: `${light.y}%`,
            width: "120px",
            height: "120px",
            filter: "blur(40px)",
            backgroundColor:
              light.color === "red"
                ? "rgba(239, 68, 68, 0.6)"
                : light.color === "blue"
                  ? "rgba(59, 130, 246, 0.6)"
                  : light.color === "yellow"
                    ? "rgba(234, 179, 8, 0.6)"
                    : light.color === "cyan"
                      ? "rgba(34, 211, 238, 0.6)"
                      : "rgba(236, 72, 153, 0.6)",
          }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{
            duration: 0.35 + i * 0.07,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
}
