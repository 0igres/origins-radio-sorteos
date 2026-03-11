import { useState, useEffect, useRef } from "react";
import { HabboRoom } from "@/components/HabboRoom";
import { RadioPlayer } from "@/components/RadioPlayer";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, AlertCircle, Play, RotateCcw, Trash2, X } from "lucide-react";
import confetti from "canvas-confetti";

export default function Home() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRaffling, setIsRaffling] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [winner, setWinner] = useState<string | null>(null);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  // FIX #1: Track when we're in the middle of validating to prevent multiple submissions
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = inputValue.trim();

    if (!name) return;

    // FIX #1: If already validating, ignore additional button clicks
    if (isValidating) return;

    if (participants.some((p) => p.toLowerCase() === name.toLowerCase())) {
      toast({
        title: "¡Ups!",
        description: "Este Habbo ya está en la sala.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      const response = await fetch(`/api/validate-user/${encodeURIComponent(name)}`);
      const data = await response.json();
      if (!data.valid) {
        toast({
          title: "Usuario no encontrado",
          description: `${name} no está registrado en Habbo Origins ES.`,
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error("Error validating username:", error);
      toast({
        title: "Error al validar",
        description: "No se pudo validar el usuario.",
        variant: "destructive",
      });
      return;
    } finally {
      setIsValidating(false);
    }

    // FIX #1: Re-check for duplicates after async validation completes
    // (in case the user was added from another quick submission while validating)
    setParticipants((prev) => {
      if (prev.some((p) => p.toLowerCase() === name.toLowerCase())) {
        return prev;
      }
      return [...prev, name];
    });
    setInputValue("");
    setWinner(null);
    setShowAddModal(false);
  };

  const startRaffle = () => {
    if (participants.length < 2) {
      toast({
        title: "¡Necesitas más Habbos!",
        description: "Añade al menos 2 participantes para iniciar el sorteo.",
        variant: "destructive",
      });
      return;
    }

    setIsRaffling(true);
    setWinner(null);
    setCountdown(5);
  };

  const resetRaffle = () => {
    setParticipants([]);
    setWinner(null);
    setIsRaffling(false);
    setCountdown(5);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRaffling && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isRaffling && countdown === 0) {
      setIsRaffling(false);

      const winningIndex = Math.floor(Math.random() * participants.length);
      const winningUser = participants[winningIndex];
      setWinner(winningUser);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f28900", "#438eba", "#ffffff"],
      });

      toast({
        title: "¡Ganador registrado!",
        description: `¡${winningUser} ganó el sorteo!`,
      });
    }

    return () => clearInterval(timer);
  }, [isRaffling, countdown, participants, toast]);

  return (
    <div className="min-h-screen py-6 px-4 sm:px-8" style={{ backgroundColor: '#72a1b1' }}>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 rounded-xl shadow-lg border-4" style={{ backgroundColor: '#1a2a32', borderColor: '#1a2a32' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-black overflow-hidden shadow-inner" style={{ backgroundColor: '#e0e6e8' }}>
            <img
              src="https://habboxwiki.com/wiki/images/4/4a/RUBBERDUCK.png"
              alt="Logo"
              className="w-10 h-10 pixelated"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl text-white" style={{ fontFamily: "'Press Start 2P', system-ui", fontSize: '1.1rem', textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}>
              Radio OGK
            </h1>
            <p className="text-lg" style={{ color: '#5ba3ce' }}>Generador oficial de sorteos Habbo</p>
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
                    style={{ zIndex: 200 }}
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
              <button
                onClick={() => setShowAddModal(true)}
                disabled={isRaffling}
                className="habbo-button habbo-button-secondary px-8 py-3 flex items-center justify-center gap-2"
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
                INICIAR SORTEO
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
            <div className="habbo-panel flex flex-col p-4 gap-4 h-full">
              <div className="flex items-center justify-between border-b-2 border-gray-400 pb-2 mb-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  :chooser
                </h2>
              </div>

              <div className="bg-white border-2 border-black flex-1 overflow-y-auto p-3 shadow-inner" style={{ minHeight: 0 }}>
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
                          onClick={() => setParticipants((prev) => prev.filter((x) => x !== username))}
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
            </div>
          </div>

          {/* Right: Radio */}
          <div className="w-full lg:w-80 shrink-0">
            <RadioPlayer onPlayingChange={setIsRadioPlaying} />
          </div>
        </div>

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

                <form onSubmit={handleAddParticipant} className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Usuario Habbo..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="habbo-input"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    {/* FIX #1: Disable button while validating to prevent repeated clicks */}
                    <button
                      type="submit"
                      className="habbo-button habbo-button-secondary flex-1 py-2"
                      disabled={!inputValue.trim() || isValidating}
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
    </div>
  );
}
