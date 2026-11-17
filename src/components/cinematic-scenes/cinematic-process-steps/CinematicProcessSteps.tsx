// ui-25 — CinematicProcessSteps
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

type Step = { n: string; name: string; span: string; copy: string; color: string; hue: string };

const steps: Step[] = [
  { n: "01", name: "Discover", span: "Weeks 1–2", copy: "Stakeholder interviews, audits and field notes. We leave with a thesis about why the work should exist.", color: "#ff4d23", hue: "linear-gradient(135deg,#1a0a04,#3d1608)" },
  { n: "02", name: "Define",   span: "Weeks 3–4", copy: "The thesis becomes a brief: principles, tone, a named enemy and the one metric the work answers to.",   color: "#e8a23d", hue: "linear-gradient(135deg,#1f1608,#3d2c10)" },
  { n: "03", name: "Design",   span: "Weeks 5–8", copy: "Identity, interface and motion built in the open — weekly crits in the real medium, never in decks.",    color: "#2f9e7f", hue: "linear-gradient(135deg,#04211a,#0a3d31)" },
  { n: "04", name: "Deliver",  span: "Weeks 9–10", copy: "Guidelines, tooling and a handover sprint with your team shipping alongside ours until it holds.",      color: "#7b6cf6", hue: "linear-gradient(135deg,#140f24,#281c47)" },
];

export function CinematicProcessSteps() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (n: number) => {
    if (n === i || n < 0 || n >= steps.length) return;
    setDir(n > i ? 1 : -1);
    setI(n);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") go(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const s = steps[i];

  return (
    <div className="flex min-h-[560px] select-none flex-col bg-ink text-bone sm:flex-row">
      {/* rail */}
      <div className="flex shrink-0 flex-col border-b border-bone/10 px-6 py-6 sm:w-64 sm:border-b-0 sm:border-r sm:px-8">
        <div className="font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">Process · 10 weeks</div>
        <div className="mt-8 flex gap-6 sm:flex-col sm:gap-0">
          {steps.map((st, k) => (
            <button
              key={st.n}
              onClick={() => go(k)}
              className={`group flex items-baseline gap-3 py-2 text-left transition-colors sm:py-3 ${k === i ? "text-bone" : "text-bone/40 hover:text-bone/75"}`}
            >
              <span className="font-mono-tight text-[11px] tracking-[0.24em]" style={{ color: k === i ? st.color : undefined }}>{st.n}</span>
              <span className="hidden font-display text-lg tracking-display sm:block">{st.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-auto hidden h-40 w-px bg-bone/15 sm:block">
          <motion.div
            className="w-px origin-top"
            style={{ background: s.color }}
            animate={{ height: `${((i + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.85, ease: EASE }}
          />
        </div>
      </div>

      {/* stage */}
      <div className="relative min-h-[460px] flex-1 overflow-hidden">
        <AnimatePresence custom={dir} mode="popLayout">
          <motion.div
            key={s.n}
            initial={{ clipPath: dir > 0 ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0 0)" }}
            exit={{ clipPath: dir > 0 ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)" }}
            transition={{ duration: 0.85, ease: EASE }}
            className="absolute inset-0"
            style={{ background: s.hue }}
          >
            <div className="absolute inset-0 grain opacity-70" />
            <motion.div
              initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: "linear" }}
              className="absolute inset-0 opacity-40"
              style={{ background: `radial-gradient(ellipse at 30% 80%, ${s.color}, transparent 60%)` }}
            />

            {/* ghost numeral */}
            <div className="absolute -right-4 -top-10 overflow-hidden sm:right-4">
              <motion.div
                initial={{ y: "30%", opacity: 0 }} animate={{ y: "0%", opacity: 0.12 }} exit={{ y: "-30%", opacity: 0 }}
                transition={{ duration: 0.85, ease: EASE, delay: 0.1 }}
                className="font-display text-[16rem] leading-none tracking-display"
              >
                {s.n}
              </motion.div>
            </div>

            <div className="relative flex h-full flex-col justify-end px-6 pb-20 sm:px-10">
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="font-mono-tight text-[11px] uppercase tracking-[0.24em]"
                style={{ color: s.color }}
              >
                Phase {s.n} · {s.span}
              </motion.div>
              <div className="mt-3 overflow-hidden">
                <motion.h2
                  initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }}
                  transition={{ duration: 0.85, ease: EASE, delay: 0.15 }}
                  className="font-display tracking-display text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.9]"
                >
                  {s.name}
                </motion.h2>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.55, delay: 0.5 }}
                className="mt-6 max-w-md text-sm leading-relaxed text-bone/75"
              >
                {s.copy}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* controls */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-bone/10 px-6 py-4 sm:px-10">
          <div className="font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">
            <span className="text-bone">{s.n}</span> / {String(steps.length).padStart(2, "0")}
          </div>
          <div className="flex gap-2">
            <button onClick={() => go(i - 1)} disabled={i === 0} className="grid h-10 w-10 place-items-center rounded-full border border-bone/20 text-bone transition-colors hover:bg-bone/10 disabled:opacity-30 disabled:hover:bg-transparent"><ArrowUp className="h-4 w-4" /></button>
            <button onClick={() => go(i + 1)} disabled={i === steps.length - 1} className="grid h-10 w-10 place-items-center rounded-full border border-bone/20 text-bone transition-colors hover:bg-bone/10 disabled:opacity-30 disabled:hover:bg-transparent"><ArrowDown className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
