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

// DJ position is at the center stage (higher up)
const DJ_POSITION = { x: 50, y: 35 };

// Disco room floor grid - mapped to actual floor squares in the disco
// FIX: Extended the grid to cover more positions within the room bounds.
// Using a dense 5x6 grid (30 positions) so we can support up to 31 participants
// (1 DJ + 30 floor tiles) without anyone going outside the room.
// All positions stay within x: 10-90%, y: 50-88% to stay inside the floor area.
const DISCO_FLOOR_GRID = [
  // Row 1 (back row)
  { x: 15, y: 50 }, { x: 27, y: 50 }, { x: 39, y: 50 }, { x: 51, y: 50 }, { x: 63, y: 50 }, { x: 75, y: 50 },
  // Row 2
  { x: 15, y: 59 }, { x: 27, y: 59 }, { x: 39, y: 59 }, { x: 51, y: 59 }, { x: 63, y: 59 }, { x: 75, y: 59 },
  // Row 3
  { x: 15, y: 68 }, { x: 27, y: 68 }, { x: 39, y: 68 }, { x: 51, y: 68 }, { x: 63, y: 68 }, { x: 75, y: 68 },
  // Row 4
  { x: 15, y: 77 }, { x: 27, y: 77 }, { x: 39, y: 77 }, { x: 51, y: 77 }, { x: 63, y: 77 }, { x: 75, y: 77 },
  // Row 5 (front row)
  { x: 15, y: 86 }, { x: 27, y: 86 }, { x: 39, y: 86 }, { x: 51, y: 86 }, { x: 63, y: 86 }, { x: 75, y: 86 },
];

export function HabboRoom({
  participants,
  winner,
  isRaffling,
  isRadioPlaying,
}: HabboRoomProps) {
  const placements = useMemo(() => {
    return participants.map((username, index) => {
      let position;
      if (index === 0) {
        // First participant is the DJ
        position = DJ_POSITION;
      } else {
        // Rest go to floor tiles in order
        // FIX: Use modulo so extra participants wrap back to existing tiles
        // but now we have 30 tiles so most normal groups fit without overlap
        const floorIndex = (index - 1) % DISCO_FLOOR_GRID.length;
        position = DISCO_FLOOR_GRID[floorIndex];
      }

      return {
        username,
        x: position.x,
        y: position.y,
        isDJ: index === 0,
        zIndex: index === 0 ? 900 : 100 + (DISCO_FLOOR_GRID.length - ((index - 1) % DISCO_FLOOR_GRID.length)),
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
          backgroundColor: "#008080",
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
                  transform: "translate(-50%, -50%)",
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
