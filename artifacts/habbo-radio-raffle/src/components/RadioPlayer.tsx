import { useState, useRef, useEffect } from "react";
import { Music, Play, Pause, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RadioPlayerProps {
  onPlayingChange?: (isPlaying: boolean) => void;
}

export function RadioPlayer({ onPlayingChange }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestSong, setRequestSong] = useState("");
  const [listeners, setListeners] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchListeners = async () => {
      try {
        const response = await fetch("/api/listeners");
        if (response.ok) {
          const data = await response.json();
          setListeners(data.listeners || 0);
        }
      } catch (error) {
        console.error("Failed to fetch listener count:", error);
      }
    };

    fetchListeners();
    const interval = setInterval(fetchListeners, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    onPlayingChange?.(newState);

    if (newState) {
      audioRef.current?.play().catch((err) => {
        console.error("Failed to play audio:", err);
      });
    } else {
      audioRef.current?.pause();
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const [isSending, setIsSending] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;
    setIsSending(true);

    const webhookUrl =
      "https://discord.com/api/webhooks/1430524848374812802/-vROqJyF57dbLOS4eylAo9gIooYQ7lMlq4bdZZrfRZF6KM3obhngA82P6yzaX1HU2UMU";

    try {
      const now = new Date();
      const timestamp = now.toLocaleString("es-ES", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: "🎵 Nueva Petición de Canción",
              description: `**${requestSong}**`,
              color: 0x5ba3ce,
              fields: [
                {
                  name: "Solicitado por",
                  value: requestName,
                  inline: true,
                },
                {
                  name: "Hora",
                  value: timestamp,
                  inline: true,
                },
              ],
              footer: {
                text: "Origins Kingdom Radio",
              },
            },
          ],
        }),
      });
    } catch (err) {
      console.error("Error sending song request:", err);
    } finally {
      setIsSending(false);
    }

    setRequestName("");
    setRequestSong("");
    setShowRequestModal(false);
  };

  return (
    <div className="habbo-panel flex flex-col gap-4 p-4 w-full">
      <div className="flex items-center gap-3 border-b-2 border-gray-400 pb-3">
        <Music className="w-6 h-6" />
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Press Start 2P', system-ui", fontSize: '0.75rem' }}>Origins Kingdom Radio</h2>
          <p className="text-sm text-gray-600">DJ Colorinsiyo</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          {isPlaying && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="w-2 h-2 bg-red-600 rounded-full"
            />
          )}
          <span className="text-red-600 font-bold text-sm">
            {isPlaying ? "EN VIVO" : "DESCONECTADO"}
          </span>
        </div>
        <p className="text-white text-sm font-bold">Origins Kingdom Radio</p>
        <p className="text-gray-400 text-xs mt-1">
          {isPlaying
            ? `▶ Play'EM Sessions #85 ▶ Latin Hous... • ${listeners} oyentes`
            : "Esperando conexión..."}
        </p>

        <div className="flex justify-center gap-1 mt-3 h-6">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={
                isPlaying
                  ? { height: [6, 16, 10, 20, 12] }
                  : { height: 6 }
              }
              transition={{
                duration: 0.4,
                repeat: isPlaying ? Infinity : 0,
                delay: i * 0.04,
              }}
              className="w-1 bg-cyan-500 rounded-sm"
            />
          ))}
        </div>
      </div>

      <button
        onClick={handlePlayPause}
        className="habbo-button habbo-button-secondary w-full py-3 flex items-center justify-center gap-2"
      >
        {isPlaying ? (
          <>
            <Pause className="w-5 h-5 fill-current" />
            PAUSA
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" />
            REPRODUCIR
          </>
        )}
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm">🔊</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full cursor-pointer"
        />
        <span className="text-sm w-8 text-right">{volume}%</span>
      </div>

      <div className="bg-white border border-gray-300 rounded px-3 py-2 text-center">
        <p className="text-sm font-bold">👥 {listeners} oyentes</p>
      </div>

      <button
        onClick={() => setShowRequestModal(true)}
        className="habbo-button habbo-button-secondary w-full py-3 flex items-center justify-center gap-2"
      >
        <Music className="w-5 h-5" />
        PIDE TU CANCIÓN
      </button>

      <audio
        ref={audioRef}
        src="https://s5.myradiostream.com/44728/listen.mp3"
        crossOrigin="anonymous"
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="habbo-panel p-4 w-96 max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 border-b-2 border-gray-400 pb-2">
                <h3 className="text-lg font-bold">🎵 Solicitar canción</h3>
                <button onClick={() => setShowRequestModal(false)} className="text-gray-600 hover:text-gray-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRequestSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Tu nombre..."
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  className="habbo-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Nombre de la canción..."
                  value={requestSong}
                  onChange={(e) => setRequestSong(e.target.value)}
                  className="habbo-input"
                  required
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={isSending} className="habbo-button habbo-button-secondary flex-1 py-2">
                    <Send className="w-4 h-4 inline mr-1" />
                    {isSending ? "Enviando..." : "Enviar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="habbo-button flex-1 py-2"
                    style={{ backgroundColor: '#4b5563' }}
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
  );
}
