import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Users, Target, Crown, Dice5, ChevronDown, ChevronUp } from "lucide-react";

const MANZANA_RULES = (
  <div className="flex flex-col gap-5" style={{ fontSize: '16px' }}>
    <div className="flex items-start gap-3 p-3 rounded-lg border-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(91,163,206,0.5)' }}>
      <span className="text-2xl shrink-0">🍎</span>
      <div>
        <p className="font-bold mb-1" style={{ color: '#e0e6e8', fontSize: '16px' }}>La Manzana Envenenada</p>
        <p style={{ color: '#94bfd0', fontSize: '14px' }}>
          La Manzana Envenenada es un juego para 7 jugadores donde solo habrá un ganador. Cada jugador
          tiene un rol secreto y debe usar la observación, la estrategia y un poco de suerte para ganar
          manzanas y llegar primero a la meta.
        </p>
      </div>
    </div>

    {/* Objetivo */}
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-4 h-4" style={{ color: '#5ba3ce' }} />
        <h4 className="font-bold" style={{ color: '#e0e6e8', fontSize: '16px' }}>Objetivo y Victoria</h4>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: "8", label: "manzanas para ganar" },
          { icon: <Crown className="w-5 h-5 mx-auto" style={{ color: '#f59e0b' }} />, label: "Gana quien llegue primero" },
          { value: "🎲", label: "Empate = tirada de dado" },
        ].map((stat, i) => (
          <div key={i} className="rounded border-2 p-2 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}>
            {stat.value !== undefined ? (
              <p className="text-lg font-bold" style={{ color: '#e0e6e8' }}>{stat.value}</p>
            ) : stat.icon}
            <p style={{ color: '#94bfd0', fontSize: '14px', marginTop: '4px' }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Roles Secretos */}
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">🎭</span>
        <h4 className="font-bold" style={{ color: '#e0e6e8', fontSize: '16px' }}>Roles Secretos</h4>
      </div>
      <p style={{ color: '#94bfd0', fontSize: '14px', marginBottom: '8px' }}>Antes de empezar, cada jugador pasa por la nevera y recibe un objeto que indica su rol:</p>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="rounded border-2 p-2" style={{ borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.15)' }}>
          <p className="font-bold" style={{ color: '#c4b5fd', fontSize: '14px' }}>🍦 OBJETO: HELADO</p>
          <p className="font-bold" style={{ color: '#a78bfa', fontSize: '16px' }}>Bruja</p>
          <p style={{ color: '#d8b4fe', fontSize: '14px', marginTop: '4px' }}>Todas las manzanas que da son <span className="font-bold" style={{ color: '#f87171' }}>envenenadas</span>, restando manzanas al receptor.</p>
        </div>
        <div className="rounded border-2 p-2" style={{ borderColor: '#c2410c', backgroundColor: 'rgba(194,65,12,0.15)' }}>
          <p className="font-bold" style={{ color: '#fdba74', fontSize: '14px' }}>🥕 OBJETO: ZANAHORIA</p>
          <p className="font-bold" style={{ color: '#fb923c', fontSize: '16px' }}>Guerrero</p>
          <p style={{ color: '#fed7aa', fontSize: '14px', marginTop: '4px' }}>Da manzanas positivas y la primera manzana envenenada que recibe <span className="font-bold" style={{ color: '#86efac' }}>no le afecta</span>.</p>
        </div>
        <div className="rounded border-2 p-2" style={{ borderColor: '#1d4ed8', backgroundColor: 'rgba(29,78,216,0.15)' }}>
          <p className="font-bold" style={{ color: '#93c5fd', fontSize: '14px' }}>💧 OBJETO: AGUA</p>
          <p className="font-bold" style={{ color: '#60a5fa', fontSize: '16px' }}>Príncipe</p>
          <p style={{ color: '#bfdbfe', fontSize: '14px', marginTop: '4px' }}>Da manzanas positivas, <span className="font-bold" style={{ color: '#86efac' }}>sumando</span> manzanas al receptor.</p>
        </div>
      </div>
      <div className="rounded p-2 border" style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '14px' }}>
        🍎 <strong>Regla de Brujas:</strong> Siempre debe haber al menos 1 y como máximo 3 Brujas en la partida.
      </div>
    </div>

    {/* Cómo se Juega */}
    <div>
      <h4 className="font-bold mb-1" style={{ color: '#e0e6e8', fontSize: '16px' }}>Cómo se Juega</h4>
      <p style={{ color: '#94bfd0', fontSize: '14px', marginBottom: '8px' }}>El juego se desarrolla por rondas. Cada jugador juega un turno por ronda:</p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { n: 1, title: "Tira el dado", desc: "Resultado del 1 al 6" },
          { n: 2, title: "Recibe manzanas", desc: "Par = 1  |  Impar = 2" },
          { n: 3, title: "Elige jugador", desc: "A quien dar las manzanas" },
          { n: 4, title: "Observa", desc: "El host coloca manzanas" },
        ].map((step) => (
          <div key={step.n} className="flex flex-col items-center text-center gap-1">
            <div className="w-8 h-8 rounded-full text-white font-bold flex items-center justify-center" style={{ backgroundColor: '#5ba3ce', fontSize: '16px' }}>
              {step.n}
            </div>
            <p className="font-bold" style={{ color: '#e0e6e8', fontSize: '14px' }}>{step.title}</p>
            <p style={{ color: '#94bfd0', fontSize: '14px' }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Deducción */}
    <div className="rounded-lg p-3 border-2" style={{ backgroundColor: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.3)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span>🧠</span>
        <h4 className="font-bold" style={{ color: '#fde68a', fontSize: '16px' }}>Deducción y Estrategia</h4>
      </div>
      <ul className="grid grid-cols-2 gap-1" style={{ color: '#fef3c7', fontSize: '14px' }}>
        <li className="flex gap-1"><span className="shrink-0" style={{ color: '#fbbf24' }}>●</span>Aunque los roles son secretos, <strong>todas las acciones se ven</strong>: quién da manzanas, a quién y cuántas.</li>
        <li className="flex gap-1"><span className="shrink-0" style={{ color: '#fbbf24' }}>●</span>Los jugadores pueden deducir roles observando y recordando las acciones de cada turno.</li>
        <li className="flex gap-1"><span className="shrink-0" style={{ color: '#fbbf24' }}>●</span>No hay votaciones ni eliminaciones: la estrategia depende de observar, recordar y elegir bien.</li>
        <li className="flex gap-1"><span className="shrink-0" style={{ color: '#fbbf24' }}>●</span>El azar del dado y los roles añade incertidumbre. <strong>La paciencia es clave</strong>.</li>
      </ul>
    </div>

    {/* Resumen Rápido */}
    <div>
      <h4 className="font-bold text-center mb-2" style={{ color: '#e0e6e8', fontSize: '16px' }}>Resumen Rápido</h4>
      <div className="grid grid-cols-4 gap-2 text-center" style={{ color: '#94bfd0', fontSize: '14px' }}>
        {[
          { icon: <Users className="w-5 h-5 mx-auto mb-1" style={{ color: '#5ba3ce' }} />, label: "7 jugadores" },
          { icon: <span className="text-xl">🎭</span>, label: "Roles secretos" },
          { icon: <Dice5 className="w-5 h-5 mx-auto mb-1" style={{ color: '#5ba3ce' }} />, label: "Dado + estrategia" },
          { icon: <Crown className="w-5 h-5 mx-auto mb-1" style={{ color: '#f59e0b' }} />, label: "Gana con 8 manzanas" },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            {item.icon}
            <p>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const GAMES = [
  {
    id: "manzana",
    name: "La Manzana Envenenada",
    emoji: "🍎",
    subtitle: "Disponible ahora",
    description: "Juego de deducción, paciencia y estrategia para 7 jugadores. Roles secretos, manzanas envenenadas y mucha emoción.",
    players: "7 jugadores",
    active: true,
    rules: MANZANA_RULES,
  },
  { id: "coming1", name: "Próximamente", emoji: null, subtitle: "En desarrollo", description: "Nuevo juego guiado en preparación. ¡Mantente atento!", players: null, active: false, rules: null },
  { id: "coming2", name: "Próximamente", emoji: null, subtitle: "En desarrollo", description: "Nuevo juego guiado en preparación. ¡Mantente atento!", players: null, active: false, rules: null },
];

const PANEL_BG = '#1a2a32';
const RULES_BG = 'rgba(26, 42, 50, 0.5)';

export function GamesSection() {
  const [openGame, setOpenGame] = useState<string | null>(null);

  const toggleGame = (id: string) => {
    setOpenGame((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div
        className="habbo-panel p-4"
        style={{ backgroundColor: PANEL_BG }}
      >
        <div className="habbo-panel-title">
          <span className="text-xl">🎮</span>
          <div>
            <h2 style={{ fontFamily: "'Press Start 2P', system-ui", fontSize: '0.65rem', color: 'white' }}>
              Juegos Guiados
            </h2>
            <p style={{ color: '#a8d4ea', fontSize: '13px', marginTop: '2px' }}>Explora los juegos disponibles y próximos lanzamientos</p>
          </div>
        </div>

        {/* Game cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {GAMES.map((game) => (
            <div
              key={game.id}
              onClick={() => game.active && toggleGame(game.id)}
              className={`rounded-lg border-2 p-3 flex flex-col gap-2 transition-all ${
                game.active
                  ? "cursor-pointer hover:shadow-md"
                  : "opacity-60 cursor-default"
              }`}
              style={{
                borderColor: game.active ? '#5ba3ce' : 'rgba(255,255,255,0.15)',
                backgroundColor: game.active
                  ? (openGame === game.id ? 'rgba(91,163,206,0.25)' : 'rgba(91,163,206,0.12)')
                  : 'rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {game.emoji ? (
                    <span className="text-2xl">{game.emoji}</span>
                  ) : (
                    <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <Lock className="w-4 h-4" style={{ color: '#94bfd0' }} />
                    </div>
                  )}
                  <div>
                    <p className="font-bold" style={{ fontSize: '16px', color: game.active ? '#e0e6e8' : '#94bfd0' }}>{game.name}</p>
                    <p style={{ fontSize: '14px', color: game.active ? '#5ba3ce' : '#6b8a96' }}>{game.subtitle}</p>
                  </div>
                </div>
                {game.active && (
                  openGame === game.id
                    ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: '#5ba3ce' }} />
                    : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: '#5ba3ce' }} />
                )}
              </div>

              <p style={{ fontSize: '14px', color: '#94bfd0' }}>{game.description}</p>

              <div className="flex items-center justify-between mt-auto">
                {game.players && (
                  <span className="flex items-center gap-1" style={{ fontSize: '14px', color: '#94bfd0' }}>
                    <Users className="w-3 h-3" />
                    {game.players}
                  </span>
                )}
                {game.active && (
                  <span className="font-bold px-2 py-0.5 rounded-full" style={{ fontSize: '14px', backgroundColor: 'rgba(22,101,52,0.4)', color: '#86efac' }}>
                    Activo
                  </span>
                )}
                {!game.active && (
                  <span className="font-bold px-2 py-0.5 rounded-full" style={{ fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#94bfd0' }}>
                    Pronto
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules panel */}
      <AnimatePresence>
        {openGame && GAMES.find((g) => g.id === openGame)?.rules && (
          <motion.div
            key={openGame}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="habbo-panel p-4"
            style={{ backgroundColor: RULES_BG }}
          >
            {GAMES.find((g) => g.id === openGame)!.rules}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
