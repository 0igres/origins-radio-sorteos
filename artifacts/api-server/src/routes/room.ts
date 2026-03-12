import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const MAX_PARTICIPANTS = 100;
const RAFFLE_COUNTDOWN_START = 5;

let participants: string[] = [];
const clients = new Set<Response>();

interface RaffleState {
  isRaffling: boolean;
  countdown: number;
  winner: string | null;
}

let raffleState: RaffleState = {
  isRaffling: false,
  countdown: RAFFLE_COUNTDOWN_START,
  winner: null,
};

let raffleTimer: ReturnType<typeof setInterval> | null = null;

function buildPayload() {
  return JSON.stringify({
    participants,
    count: participants.length,
    max: MAX_PARTICIPANTS,
    raffle: raffleState,
  });
}

function broadcast() {
  const data = buildPayload();
  for (const client of clients) {
    client.write(`data: ${data}\n\n`);
  }
}

router.get("/room/events", (req: Request, res: Response) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  res.write(`data: ${buildPayload()}\n\n`);

  clients.add(res);

  req.on("close", () => {
    clients.delete(res);
  });
});

router.get("/room/state", (_req: Request, res: Response) => {
  res.json({ participants, count: participants.length, max: MAX_PARTICIPANTS, raffle: raffleState });
});

router.post("/room/add", (req: Request, res: Response) => {
  const { username } = req.body as { username?: string };

  if (!username || typeof username !== "string" || !username.trim()) {
    return res.status(400).json({ error: "Username is required" });
  }

  const name = username.trim();

  if (participants.some((p) => p.toLowerCase() === name.toLowerCase())) {
    return res.status(409).json({ error: "Este Habbo ya está en la sala." });
  }

  if (participants.length >= MAX_PARTICIPANTS) {
    return res.status(403).json({ error: `La sala está llena (máximo ${MAX_PARTICIPANTS} participantes).` });
  }

  participants.push(name);
  broadcast();

  res.json({ success: true, participants, count: participants.length });
});

router.delete("/room/remove/:username", (req: Request, res: Response) => {
  const username = req.params.username;
  const before = participants.length;
  participants = participants.filter((p) => p.toLowerCase() !== username.toLowerCase());

  if (participants.length !== before) {
    broadcast();
  }

  res.json({ success: true, participants, count: participants.length });
});

router.post("/room/raffle/start", (_req: Request, res: Response) => {
  if (participants.length < 2) {
    return res.status(400).json({ error: "Se necesitan al menos 2 participantes." });
  }

  if (raffleState.isRaffling) {
    return res.status(409).json({ error: "El sorteo ya está en curso." });
  }

  if (raffleTimer) {
    clearInterval(raffleTimer);
    raffleTimer = null;
  }

  raffleState = { isRaffling: true, countdown: RAFFLE_COUNTDOWN_START, winner: null };
  broadcast();

  raffleTimer = setInterval(() => {
    raffleState.countdown -= 1;

    if (raffleState.countdown <= 0) {
      clearInterval(raffleTimer!);
      raffleTimer = null;

      const winnerIndex = Math.floor(Math.random() * participants.length);
      raffleState = {
        isRaffling: false,
        countdown: RAFFLE_COUNTDOWN_START,
        winner: participants[winnerIndex],
      };
    }

    broadcast();
  }, 1000);

  res.json({ success: true });
});

router.delete("/room/reset", (_req: Request, res: Response) => {
  if (raffleTimer) {
    clearInterval(raffleTimer);
    raffleTimer = null;
  }

  participants = [];
  raffleState = { isRaffling: false, countdown: RAFFLE_COUNTDOWN_START, winner: null };
  broadcast();

  res.json({ success: true });
});

export default router;
