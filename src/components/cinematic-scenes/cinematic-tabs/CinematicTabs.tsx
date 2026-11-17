// ui-23 — CinematicTabs
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

type Tab = { label: string; title: string; copy: string; color: string; hue: string };

const tabs: Tab[] = [
  { label: "Strategy", title: "Position before polish", copy: "We start with the argument, not the artefact — audits, interviews and a point of view sharp enough to disagree with.", color: "#ff4d23", hue: "linear-gradient(135deg,#1a0a04,#3d1608)" },
  { label: "Identity", title: "Systems, not logos",     copy: "Wordmarks, type ramps and rules of assembly that hold together at a bus stop and inside a 16px favicon.",        color: "#2f9e7f", hue: "linear-gradient(135deg,#04211a,#0a3d31)" },
  { label: "Digital",  title: "Interfaces with tempo",  copy: "Sites and products choreographed end to end — layout, motion and copy rehearsed as one performance.",           color: "#e8a23d", hue: "linear-gradient(135deg,#1f1608,#3d2c10)" },
  { label: "Motion",   title: "Time as a material",     copy: "Title sequences, launch films and interface motion cut to the same beat as the brand's voice.",                 color: "#7b6cf6", hue: "linear-gradient(135deg,#140f24,#281c47)" },
];

export function CinematicTabs() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (n: number) => {
    if (n === i) return;
    setDir(n > i ? 1 : -1);
    setI(n);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(Math.min(i + 1, tabs.length - 1));
      if (e.key === "ArrowLeft") go(Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const t = tabs[i];

  return (
    <div className="min-h-[560px] select-none bg-ink text-bone">
      {/* tab bar */}
      <div className="flex items-center justify-between border-b border-bone/10 px-6 sm:px-10">
        <div className="flex">
          {tabs.map((tab, k) => (
            <button
              key={tab.label}
              onClick={() => go(k)}
              className={`relative px-4 py-5 font-mono-tight text-[11px] uppercase tracking-[0.24em] transition-colors sm:px-6 ${k === i ? "text-bone" : "text-bone/50 hover:text-bone/80"}`}
            >
              {tab.label}
              {k === i && (
                <motion.span
                  layoutId="cin-tab-ink"
                  className="absolute inset-x-4 bottom-0 h-px sm:inset-x-6"
                  style={{ background: t.color }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="hidden font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70 sm:block">
          <span className="text-bone">{String(i + 1).padStart(2, "0")}</span> / {String(tabs.length).padStart(2, "0")}
        </div>
      </div>

      {/* stage */}
      <div className="relative h-[492px] overflow-hidden">
        <AnimatePresence custom={dir} mode="popLayout">
          <motion.div
            key={t.label}
            initial={{ clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0 0 0)" }}
            exit={{ clipPath: dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" }}
            transition={{ duration: 0.85, ease: EASE }}
            className="absolute inset-0"
            style={{ background: t.hue }}
          >
            <div className="absolute inset-0 grain opacity-70" />
            <motion.div
              initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: "linear" }}
              className="absolute inset-0 opacity-40"
              style={{ background: `radial-gradient(ellipse at 75% 25%, ${t.color}, transparent 60%)` }}
            />

            <div className="relative flex h-full flex-col justify-end px-6 pb-12 sm:px-10">
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="font-mono-tight text-[11px] uppercase tracking-[0.24em]"
                style={{ color: t.color }}
              >
                Capability · 0{i + 1}
              </motion.div>
              <div className="mt-3 overflow-hidden">
                <motion.h2
                  initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }}
                  transition={{ duration: 0.85, ease: EASE, delay: 0.15 }}
                  className="font-display tracking-display text-[clamp(2.5rem,7vw,6rem)] leading-[0.9]"
                >
                  {t.title}
                </motion.h2>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.55, delay: 0.5 }}
                className="mt-6 max-w-md text-sm leading-relaxed text-bone/70"
              >
                {t.copy}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
