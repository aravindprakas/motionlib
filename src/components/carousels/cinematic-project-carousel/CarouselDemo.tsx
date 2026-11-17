// ui-20 — CinematicProjectCarousel
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Project = { title: string; client: string; year: string; discipline: string; color: string; hue: string };

const projects: Project[] = [
  { title: "Northern Signal",   client: "Aker Labs",     year: "2026", discipline: "Brand · Motion", color: "#ff4d23", hue: "linear-gradient(135deg,#1a0a04,#3d1608)" },
  { title: "Object Permanence", client: "Studio Alma",   year: "2025", discipline: "Editorial",       color: "#2f9e7f", hue: "linear-gradient(135deg,#04211a,#0a3d31)" },
  { title: "Second Nature",     client: "Foret",         year: "2025", discipline: "Digital",         color: "#e8a23d", hue: "linear-gradient(135deg,#1f1608,#3d2c10)" },
  { title: "Meridian",          client: "Halcyon Air",   year: "2024", discipline: "Identity",        color: "#7b6cf6", hue: "linear-gradient(135deg,#140f24,#281c47)" },
  { title: "Field Notes",       client: "Wren Journal",  year: "2024", discipline: "Print · Web",     color: "#ff5a3c", hue: "linear-gradient(135deg,#240d0a,#451612)" },
];

export function CarouselDemo() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0, on: false });

  const go = (n: number) => { setDir(n > i ? 1 : -1); setI((n + projects.length) % projects.length); };
  const next = () => go(i + 1); const prev = () => go(i - 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const p = projects[i];

  return (
    <div
      ref={ref}
      onMouseMove={(e) => { const r = ref.current!.getBoundingClientRect(); setCursor({ x: e.clientX - r.left, y: e.clientY - r.top, on: true }); }}
      onMouseLeave={() => setCursor((c) => ({ ...c, on: false }))}
      className="relative min-h-[560px] overflow-hidden bg-ink text-bone select-none"
    >
      <AnimatePresence custom={dir} mode="popLayout">
        <motion.div
          key={p.title} custom={dir}
          initial={{ clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0 0 0)" }}
          exit={{ clipPath: dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-0"
          style={{ background: p.hue }}
        >
          <div className="absolute inset-0 grain opacity-70" />
          <motion.div
            initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: "linear" }}
            className="absolute inset-0 opacity-40"
            style={{ background: `radial-gradient(ellipse at 70% 30%, ${p.color}, transparent 60%)` }}
          />
        </motion.div>
      </AnimatePresence>

      {/* header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">Vol.01 · Selected work</div>
        <div className="font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">
          <span className="text-bone">{String(i + 1).padStart(2, "0")}</span> / {String(projects.length).padStart(2, "0")}
        </div>
      </div>

      {/* main */}
      <div className="relative z-10 flex min-h-[440px] flex-col justify-end px-6 pb-24 sm:px-10">
        <AnimatePresence mode="wait">
          <motion.div key={p.title} className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70"
            >
              {p.client} · {p.discipline} · {p.year}
            </motion.div>
            <div className="mt-4 overflow-hidden">
              <motion.h2
                initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
                className="font-display tracking-display text-[clamp(3.5rem,11vw,10rem)] leading-[0.88]"
              >
                {p.title}
              </motion.h2>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-bone/10 px-6 py-5 sm:px-10">
        <div className="flex gap-2">
          {projects.map((_, k) => (
            <button key={k} onClick={() => go(k)} aria-label={`Slide ${k+1}`}
              className={`h-1 transition-all ${k===i? "w-10 bg-bone" : "w-5 bg-bone/30 hover:bg-bone/60"}`}/>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={prev} className="grid h-10 w-10 place-items-center rounded-full border border-bone/20 text-bone hover:bg-bone/10"><ArrowLeft className="h-4 w-4"/></button>
          <button onClick={next} className="grid h-10 w-10 place-items-center rounded-full border border-bone/20 text-bone hover:bg-bone/10"><ArrowRight className="h-4 w-4"/></button>
        </div>
      </div>

      {/* cursor index */}
      {cursor.on && (
        <motion.div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 font-mono-tight text-[10px] text-bone/80"
          style={{ left: cursor.x, top: cursor.y }}
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        >
          <div className="rounded-full border border-bone/30 bg-ink/40 px-3 py-1 backdrop-blur">drag / ← →</div>
        </motion.div>
      )}
    </div>
  );
}
