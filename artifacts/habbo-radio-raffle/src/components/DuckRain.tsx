import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import elephantImg from "@assets/image_1773232381373.png";

interface FallingItem {
  id: number;
  x: number;
  delay: number;
  duration: number;
  swayAmount: number;
}

export function DuckRain({ active }: { active: boolean }) {
  const [items, setItems] = useState<FallingItem[]>([]);

  useEffect(() => {
    if (!active) {
      setItems([]);
      return;
    }

    const generateItems = () => {
      const newItems = Array.from({ length: 12 }).map((_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2.5 + Math.random() * 1.5,
        swayAmount: (Math.random() - 0.5) * 20,
      }));
      setItems((prev) => [...prev.slice(-40), ...newItems]);
    };

    generateItems();
    const interval = setInterval(generateItems, 1200);

    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 200 }}>
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute"
          style={{
            left: `${item.x}%`,
            top: "-40px",
            width: "40px",
            height: "40px",
            backgroundImage: `url('${elephantImg}')`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))",
          }}
          initial={{ y: 0, x: 0, opacity: 1 }}
          animate={{ y: "130vh", x: item.swayAmount, opacity: 0.9 }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}
