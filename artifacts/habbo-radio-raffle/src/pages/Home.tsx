import { useState, useEffect, useRef } from "react";
import { HabboRoom } from "@/components/HabboRoom";
import { RadioPlayer } from "@/components/RadioPlayer";
import { GamesSection } from "@/components/GamesSection";
import ogkLogo from "@assets/logo-ogk.png";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Users, AlertCircle, Play, RotateCcw, Trash2, X, WifiOff } from "lucide-react";
import confetti from "canvas-confetti";

const MAX_PARTICIPANTS = 100;

export default function Home() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRaffling, setIsRaffling] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [winner, setWinner] = useState<string | null>(null);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [isRadioOnline, setIsRadioOnline] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const prevWinnerRef = useRef<string | null>(null);
  const { toast } = useToast();

  // Subscribe to real-time room + raffle state via SSE
  useEffect(() => {
    const es = new EventSource("/api/room/events");

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as {
          participants: string[];
          raffle: { isRaffling: boolean; countdown: number; winner: string | null };
        };

        setParticipants(data.participants);

        if (data.raffle) {
          setIsRaffling(data.raffle.isRaffling);
          setCountdown(data.raffle.countdown);
          setWinner(data.raffle.winner);

          // Fire confetti exactly once when a winner is announced
          if (data.raffle.winner && prevWinnerRef.current !== data.raffle.winner) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#f28900", "#438eba", "#ffffff"],
            });
            toast({
              title: "¡Ganador registrado!",
              description: `¡${data.raffle.winner} ganó el sorteo!`,
            });
          }

          prevWinnerRef.current = data.raffle.winner;
        }
      } catch {
        // ignore malformed messages
      }
    };

    es.onerror = () => {
      console.error("SSE connection lost, retrying...");
    };

    return () => es.close();
  }, [toast]);

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = inputValue.trim();

    if (!name) return;
    if (isValidating) return;

    if (participants.length >= MAX_PARTICIPANTS) {
      toast({
        title: "¡Sala llena!",
        description: `La sala ya tiene ${MAX_PARTICIPANTS} participantes.`,
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      const validateRes = await fetch(`/api/validate-user/${encodeURIComponent(name)}`);
      const validateData = await validateRes.json();
      if (!validateData.valid) {
        toast({
          title: "Usuario no encontrado",
          description: `${name} no está registrado en Habbo Origins ES.`,
          variant: "destructive",
        });
        return;
      }

      const addRes = await fetch("/api/room/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name }),
      });
      const addData = await addRes.json() as { error?: string };

      if (!addRes.ok) {
        toast({
          title: "¡Ups!",
          description: addData.error ?? "No se pudo añadir el usuario.",
          variant: "destructive",
        });
        return;
      }

      setInputValue("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding participant:", error);
      toast({
        title: "Error",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const removeParticipant = async (username: string) => {
    try {
      await fetch(`/api/room/remove/${encodeURIComponent(username)}`, { method: "DELETE" });
    } catch (error) {
      console.error("Error removing participant:", error);
    }
  };

  const startRaffle = async () => {
    try {
      const res = await fetch("/api/room/raffle/start", { method: "POST" });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        toast({
          title: "¡Ups!",
          description: data.error ?? "No se pudo iniciar el sorteo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error starting raffle:", error);
    }
  };

  const resetRaffle = async () => {
    try {
      await fetch("/api/room/reset", { method: "DELETE" });
    } catch (error) {
      console.error("Error resetting room:", error);
    }
  };

  const isFull = participants.length >= MAX_PARTICIPANTS;
  const canAddUsers = isRadioOnline && !isFull && !isRaffling;
  const fillPct = Math.round((participants.length / MAX_PARTICIPANTS) * 100);

  return (
    <div className="min-h-screen py-6 px-4 sm:px-8 flex flex-col">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 rounded-xl shadow-lg border-4" style={{ backgroundColor: '#1a2a32', borderColor: '#1a2a32' }}>
          <div className="w-16 h-16 flex items-center justify-center overflow-hidden shrink-0">
            <img src={ogkLogo} alt="Radio OGK Logo" className="w-16 h-16 pixelated object-contain" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl text-white" style={{ fontFamily: "'Press Start 2P', system-ui", fontSize: '1.1rem', textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}>
              Radio OGK
            </h1>
            <p className="text-lg" style={{ color: '#5ba3ce' }}>Radio oficial de Origins Kingdom. ¡Conéctate a la disco para los sorteos!</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Room + Buttons */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="relative">
              <HabboRoom
                participants={participants}
                winner={winner}
                isRaffling={isRaffling}
                isRadioPlaying={isRadioPlaying}
              />

              <AnimatePresence>
                {winner && !isRaffling && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ zIndex: 999 }}
                  >
                    <div className="border-4 border-black rounded-xl px-8 py-4 shadow-2xl" style={{ backgroundColor: 'rgba(249, 115, 22, 0.85)', boxShadow: 'inset 2px 2px 0px 0px rgba(255,255,255,0.4), inset -2px -2px 0px 0px rgba(0,0,0,0.4), 0 8px 0 rgba(0,0,0,0.3)' }}>
                      <div className="text-2xl sm:text-3xl text-white" style={{ fontFamily: "'Press Start 2P', system-ui", fontSize: '0.9rem', textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}>
                        ¡Ganador: <span style={{ color: '#fde047' }}>{winner}</span>!
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isRaffling && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ zIndex: 300 }}
                  >
                    <div className="text-white" style={{ fontSize: '7rem', fontFamily: "'Press Start 2P', system-ui", textShadow: '0 10px 0 rgba(0,0,0,0.5)' }}>
                      {countdown}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Buttons Row */}
            <div className="flex gap-2 justify-center">
              {!isRadioOnline && (
                <div className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
                  <WifiOff className="w-3 h-3" />
                  Radio offline
                </div>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                disabled={!canAddUsers}
                className="habbo-button habbo-button-secondary px-8 py-3 flex items-center justify-center gap-2"
                title={!isRadioOnline ? "Radio offline — no se pueden añadir participantes" : isFull ? `Sala llena (${MAX_PARTICIPANTS} máx.)` : undefined}
              >
                <Users className="w-5 h-5" />
                Agregar keko
              </button>

              <button
                onClick={startRaffle}
                disabled={isRaffling || participants.length < 2}
                className="habbo-button habbo-button-secondary flex-1 flex items-center justify-center gap-2 py-3"
              >
                <Play className="w-5 h-5 fill-current" />
                {isRaffling ? `SORTEANDO... ${countdown}` : "INICIAR SORTEO"}
              </button>

              <button
                onClick={resetRaffle}
                disabled={isRaffling}
                className="habbo-button px-6 py-3"
                style={{ backgroundColor: '#f97316' }}
                title="Reiniciar Sala"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Middle: Participants */}
          <div className="w-full lg:w-64 shrink-0" style={{ height: '450px' }}>
            <div className="habbo-panel flex flex-col p-4 gap-2 h-full">
              <div className="habbo-panel-title">
                <Users className="w-4 h-4 shrink-0" />
                <h2 style={{ fontFamily: "'Press Start 2P', system-ui", fontSize: '0.6rem', color: 'white' }}>:chooser</h2>
              </div>

              <div className="habbo-panel-inner flex-1 overflow-y-auto p-3 shadow-inner" style={{ minHeight: 0 }}>
                {participants.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-50">
                    <AlertCircle className="w-10 h-10" />
                    <p className="text-sm">Ningún usuario en la sala</p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {participants.map((username, index) => (
                      <li
                        key={username}
                        className="flex items-center gap-2 p-2 border border-blue-200 rounded shadow-sm hover:bg-blue-100 transition-colors"
                        style={{ backgroundColor: '#eff6ff' }}
                      >
                        <div className="w-6 h-6 text-white font-bold rounded flex items-center justify-center border border-blue-600 shrink-0 shadow-inner text-xs" style={{ backgroundColor: '#3b82f6' }}>
                          {index + 1}
                        </div>
                        <img
                          src={`/api/avatar/${encodeURIComponent(username)}?gesture=nrm&size=s`}
                          className="w-8 h-8 pixelated object-cover object-top"
                          alt={username}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-bold leading-tight truncate" style={{ color: '#1a2a32' }}>
                            {username}
                          </span>
                        </div>
                        <button
                          onClick={() => removeParticipant(username)}
                          className="text-red-500 hover:text-red-700 shrink-0 transition-opacity"
                          style={{ opacity: 0 }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Capacity bar */}
              <div className="pt-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Participantes</span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: isFull ? '#b91c1c' : '#1d4ed8' }}
                  >
                    {participants.length}/{MAX_PARTICIPANTS}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden border border-gray-300" style={{ backgroundColor: '#e5e7eb' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: isFull ? '#ef4444' : '#3b82f6' }}
                    animate={{ width: `${fillPct}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Radio */}
          <div className="w-full lg:w-80 shrink-0">
            <RadioPlayer onPlayingChange={setIsRadioPlaying} onServerOnlineChange={setIsRadioOnline} />
          </div>
        </div>

        {/* Juegos Guiados */}
        <GamesSection />

        {/* Add User Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="habbo-panel p-4 w-96 max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4 border-b-2 border-gray-400 pb-2">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Agregar keko
                  </h3>
                  <button onClick={() => setShowAddModal(false)} className="text-gray-600 hover:text-gray-900">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {!isRadioOnline && (
                  <div className="mb-3 p-2 rounded text-sm text-center font-bold flex items-center justify-center gap-2" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                    <WifiOff className="w-4 h-4" /> Radio offline. No se pueden añadir participantes.
                  </div>
                )}
                {isFull && isRadioOnline && (
                  <div className="mb-3 p-2 rounded text-sm text-center font-bold" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                    ¡Sala llena! Máximo {MAX_PARTICIPANTS} participantes.
                  </div>
                )}

                <form onSubmit={handleAddParticipant} className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Usuario Habbo..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="habbo-input"
                    autoFocus
                    disabled={!canAddUsers}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="habbo-button habbo-button-secondary flex-1 py-2"
                      disabled={!inputValue.trim() || isValidating || !canAddUsers}
                    >
                      {isValidating ? "Validando..." : "Añadir"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="habbo-button flex-1 py-2"
                      style={{ backgroundColor: '#f97316' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="mt-8 mb-4 max-w-6xl w-full mx-auto">
        <div className="flex flex-col items-center gap-2 p-4 rounded-xl shadow-lg border-4 text-center" style={{ backgroundColor: '#1a2a32', borderColor: '#1a2a32' }}>
          <p style={{ fontSize: '11px', color: '#a8d4ea', lineHeight: '1.6' }}>
            Origins Kingdom no está afiliada a, respaldada, promocionada o aprobada específicamente por Sulake Corporation Oy o sus Afiliados. De acuerdo a la Política de Webs fans de Habbo, Origins Kingdom puede utilizar las marcas comerciales y otras propiedades intelectuales de Habbo Hotel.
          </p>
          <p style={{ fontSize: '11px', color: '#a8d4ea', lineHeight: '1.6' }}>
            Made with ❤️ from OGK team
          </p>
        </div>
      </footer>
    </div>
  );
}
