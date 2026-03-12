import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import discoRoom from "@assets/image_1773231905539.png";
import { DuckRain } from "./DuckRain";
import { DiscoLights } from "./DiscoLights";

interface HabboRoomProps {
  participants: string[];
  winner: string | null;
  isRaffling: boolean;
  isRadioPlaying?: boolean;
}

// Isometric grid parameters:
// The room's floor is a classic Habbo isometric grid.
// Origin at back-center V-tip of the floor (cx=50%, cy=36%).
// Moving right in room:    cx += TILE_HALF_W, cy += TILE_HALF_H
// Moving forward/left:     cx -= TILE_HALF_W, cy += TILE_HALF_H
//
// Tile position formula: cx = 50 + (gx - gy) * TILE_HALF_W
//                        cy = 36 + (gx + gy) * TILE_HALF_H
//
// Tiles are ordered back-to-front so that front tiles (higher cy)
// are rendered on top via their z-index = 100 + Math.round(cy).

const DISCO_FLOOR_GRID: { x: number; y: number }[] = [
  // Depth 2 — back row (cy ≈ 43%)
  { x: 37.2, y: 43 }, { x: 50,   y: 43 }, { x: 62.8, y: 43 },

  // Depth 3 (cy ≈ 46.5%)
  { x: 30.8, y: 46.5 }, { x: 43.6, y: 46.5 }, { x: 56.4, y: 46.5 }, { x: 69.2, y: 46.5 },

  // Depth 4 (cy ≈ 50%)
  { x: 24.4, y: 50 }, { x: 37.2, y: 50 }, { x: 50,   y: 50 }, { x: 62.8, y: 50 }, { x: 75.6, y: 50 },

  // Depth 5 (cy ≈ 53.5%)
  { x: 18,   y: 53.5 }, { x: 30.8, y: 53.5 }, { x: 43.6, y: 53.5 },
  { x: 56.4, y: 53.5 }, { x: 69.2, y: 53.5 }, { x: 82,   y: 53.5 },

  // Depth 6 (cy ≈ 57%)
  { x: 24.4, y: 57 }, { x: 37.2, y: 57 }, { x: 50,   y: 57 }, { x: 62.8, y: 57 }, { x: 75.6, y: 57 },

  // Depth 7 (cy ≈ 60.5%)
  { x: 18,   y: 60.5 }, { x: 30.8, y: 60.5 }, { x: 43.6, y: 60.5 },
  { x: 56.4, y: 60.5 }, { x: 69.2, y: 60.5 }, { x: 82,   y: 60.5 },

  // Depth 8 (cy ≈ 64%)
  { x: 24.4, y: 64 }, { x: 37.2, y: 64 }, { x: 50,   y: 64 }, { x: 62.8, y: 64 }, { x: 75.6, y: 64 },

  // Depth 9 — front row, just above stage (cy ≈ 67.5%)
  { x: 30.8, y: 67.5 }, { x: 43.6, y: 67.5 }, { x: 56.4, y: 67.5 }, { x: 69.2, y: 67.5 },
];

export function HabboRoom({
  participants,
  winner,
  isRaffling,
  isRadioPlaying,
}: HabboRoomProps) {
  const placements = useMemo(() => {
    return participants.map((username, index) => {
      const tileIndex = index % DISCO_FLOOR_GRID.length;
      const tile = DISCO_FLOOR_GRID[tileIndex];
      return {
        username,
        x: tile.x,
        y: tile.y,
        // Front tiles (higher y) rendered on top of back tiles.
        zIndex: 100 + Math.round(tile.y),
      };
    });
  }, [participants]);

  return (
    <div className="w-full flex justify-center">
      <div
        className="habbo-panel relative overflow-hidden"
        style={{
          width: "100%",
          maxWidth: "600px",
          aspectRatio: "4 / 3",
          backgroundColor: "#1a2a32",
        }}
      >
        {/* Background Room */}
        <img
          src={discoRoom}
          alt="Disco Room"
          className="absolute inset-0 w-full h-full pixelated pointer-events-none"
          style={{ objectFit: "cover" }}
        />

        {/* Disco Lights */}
        <DiscoLights active={isRadioPlaying || false} />

        {/* Avatars */}
        <AnimatePresence>
          {placements.map((p) => {
            const isWinner = winner === p.username;
            return (
              <motion.div
                key={p.username}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: isWinner ? 1.15 : 1,
                  filter: isWinner
                    ? "drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))"
                    : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="absolute pointer-events-none"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  zIndex: p.zIndex,
                  transform: "translate(-50%, -90%)",
                }}
              >
                <img
                  src={`/api/avatar/${encodeURIComponent(p.username)}?gesture=${isWinner ? "wav" : "nrm"}&size=s`}
                  alt={p.username}
                  className="pixelated"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Rain Effect */}
        <DuckRain active={isRaffling} />
      </div>
    </div>
  );
}
