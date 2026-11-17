// ui-27 — CinematicTracklist
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

type Track = { title: string; dur: number; color: string; hue: string };

const tracks: Track[] = [
  { title: "Night Office",  dur: 214, color: "#ff4d23", hue: "linear-gradient(135deg,#1a0a04,#3d1608)" },
  { title: "Glasshouse",    dur: 187, color: "#2f9e7f", hue: "linear-gradient(135deg,#04211a,#0a3d31)" },
  { title: "Meridian Line", dur: 243, color: "#e8a23d", hue: "linear-gradient(135deg,#1f1608,#3d2c10)" },
  { title: "Second Nature", dur: 198, color: "#7b6cf6", hue: "linear-gradient(135deg,#140f24,#281c47)" },
  { title: "Ashfall",       dur: 226, color: "#e8639c", hue: "linear-gradient(135deg,#210a14,#3d1226)" },
];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Eq({ playing, color }: { playing: boolean; color: string }) {
  return (
    <span className="flex h-4 items-end gap-[3px]">
      {[0, 1, 2, 3, 4].map((b) => (
        <motion.span
          key={b}
          className="w-[3px] origin-bottom rounded-sm"
          style={{ background: color, height: "100%" }}
          animate={playing ? { scaleY: [0.25, 1, 0.4, 0.8, 0.25] } : { scaleY: 0.25 }}
          transition={playing ? { duration: 0.9 + b * 0.13, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
        />
      ))}
    </span>
  );
}

export function CinematicTracklist() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);

  const tr = tracks[i];

  const go = (n: number, d?: number) => {
    const next = (n + tracks.length) % tracks.length;
    if (next === i) return;
    setDir(d ?? (next > i ? 1 : -1));
    setI(next);
    setT(0);
  };

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (t >= tr.dur) go(i + 1, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  return (
    <div className="flex min-h-[560px] select-none flex-col bg-ink text-bone lg:flex-row">
      {/* now playing stage */}
      <div className="relative min-h-[400px] flex-1 overflow-hidden">
        <AnimatePresence custom={dir} mode="popLayout">
          <motion.div
            key={tr.title}
            initial={{ clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0 0 0)" }}
            exit={{ clipPath: dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="absolute inset-0"
            style={{ background: tr.hue }}
          >
            <div className="absolute inset-0 grain opacity-70" />
            <motion.div
              initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: "linear" }}
              className="absolute inset-0 opacity-40"
              style={{ background: `radial-gradient(ellipse at 70% 25%, ${tr.color}, transparent 60%)` }}
            />

            <div className="relative flex h-full flex-col px-6 py-6 sm:px-10">
              <div className="flex items-center justify-between font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.35 }}>
                  Field Notes · LP 02
                </motion.span>
                <Eq playing={playing} color={tr.color} />
              </div>

              <div className="mt-auto">
                <motion.div
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="font-mono-tight text-[11px] uppercase tracking-[0.24em]"
                  style={{ color: tr.color }}
                >
                  Now playing · Track 0{i + 1}
                </motion.div>
                <div className="mt-3 overflow-hidden">
                  <motion.h2
                    initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
                    className="font-display tracking-display text-[clamp(2.5rem,7vw,6rem)] leading-[0.9]"
                  >
                    {tr.title}
                  </motion.h2>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="mt-8"
                >
                  <div className="h-px w-full bg-bone/15">
                    <div className="h-px transition-[width] duration-1000 ease-linear" style={{ width: `${Math.min((t / tr.dur) * 100, 100)}%`, background: tr.color }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono-tight tnum text-[11px] tracking-[0.24em] text-bone/70">{fmt(t)} / {fmt(tr.dur)}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => go(i - 1)} className="grid h-10 w-10 place-items-center rounded-full border border-bone/20 transition-colors hover:bg-bone/10"><SkipBack className="h-4 w-4" /></button>
                      <button
                        onClick={() => setPlaying((v) => !v)}
                        className="grid h-12 w-12 place-items-center rounded-full text-ink transition-transform hover:scale-105"
                        style={{ background: tr.color }}
                        aria-label={playing ? "Pause" : "Play"}
                      >
                        {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                      </button>
                      <button onClick={() => go(i + 1)} className="grid h-10 w-10 place-items-center rounded-full border border-bone/20 transition-colors hover:bg-bone/10"><SkipForward className="h-4 w-4" /></button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* tracklist */}
      <div className="flex flex-col border-t border-bone/10 lg:w-[360px] lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between px-6 py-6 font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">
          <span>Tracklist</span>
          <span>{tracks.length} songs · {fmt(tracks.reduce((a, b) => a + b.dur, 0))}</span>
        </div>
        <div>
          {tracks.map((track, k) => (
            <button
              key={track.title}
              onClick={() => { go(k); setPlaying(true); }}
              className={`group flex w-full items-center gap-4 border-t border-bone/10 px-6 py-4 text-left transition-colors ${k === i ? "bg-bone/5" : "hover:bg-bone/5"}`}
            >
              <span className="w-6 font-mono-tight text-[11px] tracking-[0.24em] text-bone/50">
                {k === i ? <Eq playing={playing} color={track.color} /> : `0${k + 1}`}
              </span>
              <span className={`font-display text-xl tracking-display transition-colors ${k === i ? "" : "text-bone/70 group-hover:text-bone"}`} style={{ color: k === i ? track.color : undefined }}>
                {track.title}
              </span>
              <span className="ml-auto font-mono-tight tnum text-[11px] tracking-[0.24em] text-bone/50">{fmt(track.dur)}</span>
            </button>
          ))}
        </div>
        <div className="mt-auto border-t border-bone/10 px-6 py-5 font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/50">
          Click a track to play it
        </div>
      </div>
    </div>
  );
}
