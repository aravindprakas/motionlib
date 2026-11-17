// ui-24 — CinematicCaseModal
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

type Case = {
  title: string; client: string; year: string; role: string;
  color: string; hue: string; summary: string; credits: string[];
};

const cases: Case[] = [
  {
    title: "Ashfall", client: "Kilo Records", year: "2026", role: "Art direction",
    color: "#ff4d23", hue: "linear-gradient(135deg,#1a0a04,#3d1608)",
    summary: "A record sleeve system built from a single burnt-orange scan, stretched across vinyl, cassette and a 40-date tour campaign.",
    credits: ["CD — Mara Vinter", "Type — GT Flexa", "Print — Fenris Press"],
  },
  {
    title: "Low Tide", client: "Bruket", year: "2025", role: "Identity · Digital",
    color: "#2f9e7f", hue: "linear-gradient(135deg,#04211a,#0a3d31)",
    summary: "Seafood restaurant identity that reads like a shipping manifest — tabular menus, stamped marks and a booking flow with no photography at all.",
    credits: ["CD — Jonas Reyes", "Dev — Studio internal", "Signage — Nordfab"],
  },
  {
    title: "Paper Sun", client: "Foret", year: "2025", role: "Campaign",
    color: "#e8a23d", hue: "linear-gradient(135deg,#1f1608,#3d2c10)",
    summary: "Seasonal campaign for a slow-fashion house: one typeface, one pigment, twelve posters that fold out into the garment care sheet.",
    credits: ["Photo — I. Kaur", "Litho — Fenris Press", "Media — Foret in-house"],
  },
];

export function CinematicCaseModal() {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative min-h-[560px] select-none overflow-hidden bg-ink text-bone">
      <div className="absolute inset-0 grain" />

      {/* index */}
      <div className="relative flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">Case files · 2025–26</div>
        <div className="font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">{String(cases.length).padStart(2, "0")} entries</div>
      </div>

      <div className="relative grid gap-px border-y border-bone/10 bg-bone/10 sm:grid-cols-3">
        {cases.map((c, k) => (
          <button
            key={c.title}
            onClick={() => setOpen(k)}
            className="group relative flex min-h-[360px] flex-col justify-between bg-ink p-6 text-left transition-colors hover:bg-[#131118] sm:p-8"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono-tight text-[11px] tracking-[0.24em] text-bone/50">0{k + 1}</span>
              <ArrowUpRight className="h-5 w-5 -translate-x-2 translate-y-2 text-bone/0 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-bone" />
            </div>
            <div>
              <div className="font-display tracking-display text-4xl leading-none transition-transform duration-500 group-hover:-translate-y-1">{c.title}</div>
              <div className="mt-3 font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/60">{c.client} · {c.year}</div>
            </div>
            <span
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
              style={{ background: c.color }}
            />
          </button>
        ))}
      </div>

      <div className="relative px-6 py-6 font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/50 sm:px-10">
        Click a file to open it
      </div>

      {/* modal */}
      <AnimatePresence>
        {open !== null && (() => {
          const c = cases[open];
          return (
            <motion.div
              key={c.title}
              initial={{ clipPath: "inset(0 0 0 100%)" }}
              animate={{ clipPath: "inset(0 0 0 0)" }}
              exit={{ clipPath: "inset(0 0 0 100%)" }}
              transition={{ duration: 0.85, ease: EASE }}
              className="absolute inset-0 z-30"
              style={{ background: c.hue }}
            >
              <div className="absolute inset-0 grain opacity-70" />
              <motion.div
                initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: "linear" }}
                className="absolute inset-0 opacity-40"
                style={{ background: `radial-gradient(ellipse at 70% 20%, ${c.color}, transparent 60%)` }}
              />

              <div className="relative flex h-full min-h-[560px] flex-col px-6 py-6 sm:px-10">
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="flex items-center justify-between"
                >
                  <div className="font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">
                    File 0{open + 1} · {c.client}
                  </div>
                  <button
                    onClick={() => setOpen(null)}
                    className="group flex items-center gap-3 font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/80 transition-colors hover:text-bone"
                  >
                    Close
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-bone/25 transition-colors group-hover:bg-bone/10">
                      <Plus className="h-4 w-4 rotate-45" />
                    </span>
                  </button>
                </motion.div>

                <div className="mt-auto">
                  <div className="overflow-hidden">
                    <motion.h2
                      initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }}
                      transition={{ duration: 0.85, ease: EASE, delay: 0.2 }}
                      className="font-display tracking-display text-[clamp(3rem,10vw,8rem)] leading-[0.88]"
                    >
                      {c.title}
                    </motion.h2>
                  </div>

                  <div className="mt-8 grid gap-8 border-t border-bone/15 pt-6 sm:grid-cols-[1fr_auto] sm:gap-16">
                    <motion.p
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, delay: 0.5 }}
                      className="max-w-lg text-sm leading-relaxed text-bone/75"
                    >
                      {c.summary}
                    </motion.p>
                    <motion.ul
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, delay: 0.6 }}
                      className="space-y-2 font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/60"
                    >
                      <li style={{ color: c.color }}>{c.role} · {c.year}</li>
                      {c.credits.map((cr) => <li key={cr}>{cr}</li>)}
                    </motion.ul>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
