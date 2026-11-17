// ui-30 — CinematicScheduleBoard
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

type Slot = { time: string; act: string; venue: string };
type Day = { key: string; label: string; color: string; slots: Slot[] };

const days: Day[] = [
  {
    key: "fri", label: "Fri 12", color: "#ff4d23",
    slots: [
      { time: "18:30", act: "Aker Falls",   venue: "North Hall" },
      { time: "19:45", act: "Glasshouse",   venue: "Main Stage" },
      { time: "21:00", act: "Meridian",     venue: "Main Stage" },
      { time: "22:30", act: "Paper Sun",    venue: "Annex" },
      { time: "00:15", act: "Night Office", venue: "Basement" },
    ],
  },
  {
    key: "sat", label: "Sat 13", color: "#2f9e7f",
    slots: [
      { time: "17:00", act: "Field Notes",    venue: "Courtyard" },
      { time: "18:15", act: "Low Tide",       venue: "North Hall" },
      { time: "20:00", act: "Second Nature",  venue: "Main Stage" },
      { time: "21:45", act: "Ashfall",        venue: "Main Stage" },
      { time: "23:30", act: "Vitrum",         venue: "Basement" },
    ],
  },
  {
    key: "sun", label: "Sun 14", color: "#7b6cf6",
    slots: [
      { time: "16:30", act: "Helios",            venue: "Courtyard" },
      { time: "18:00", act: "Object Permanence", venue: "North Hall" },
      { time: "19:30", act: "Northern Signal",   venue: "Main Stage" },
      { time: "21:00", act: "Aetheris",          venue: "Main Stage" },
    ],
  },
];

export function CinematicScheduleBoard() {
  const [d, setD] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setD((v) => Math.min(v + 1, days.length - 1));
      if (e.key === "ArrowLeft") setD((v) => Math.max(v - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const day = days[d];

  return (
    <div className="relative min-h-[560px] select-none overflow-hidden bg-ink text-bone">
      <div className="absolute inset-0 grain" />

      {/* ambient wash keyed to day */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={day.key}
          initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 85% 0%, ${day.color}, transparent 55%)` }}
        />
      </AnimatePresence>

      {/* header */}
      <div className="relative flex flex-wrap items-end justify-between gap-4 px-6 pb-6 pt-6 sm:px-10">
        <div>
          <div className="font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">Signal Festival · Program</div>
          <h2 className="mt-2 font-display tracking-display text-4xl leading-none sm:text-5xl">Set times</h2>
        </div>
        <div className="flex">
          {days.map((dy, k) => (
            <button
              key={dy.key}
              onClick={() => setD(k)}
              className={`relative px-4 py-3 font-mono-tight text-[11px] uppercase tracking-[0.24em] transition-colors ${k === d ? "text-bone" : "text-bone/50 hover:text-bone/80"}`}
            >
              {dy.label}
              {k === d && (
                <motion.span layoutId="cin-day-ink" className="absolute inset-x-4 bottom-0 h-px" style={{ background: dy.color }} transition={{ duration: 0.5, ease: EASE }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* board */}
      <div className="relative border-t border-bone/10 px-6 sm:px-10">
        <AnimatePresence mode="wait">
          <motion.div key={day.key} exit={{ opacity: 0, transition: { duration: 0.25 } }}>
            {day.slots.map((s, k) => (
              <motion.a
                key={s.act}
                href="#"
                onClick={(e) => e.preventDefault()}
                initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
                animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.08 + k * 0.07 }}
                className="group grid grid-cols-[64px_1fr_auto] items-baseline gap-4 border-b border-bone/10 py-5 transition-colors hover:bg-bone/5 sm:grid-cols-[90px_1fr_160px_auto] sm:px-2"
              >
                <span className="font-mono-tight tnum text-[12px] tracking-[0.2em] text-bone/60 transition-colors group-hover:text-bone" style={{ color: undefined }}>
                  {s.time}
                </span>
                <span className="font-display tracking-display text-2xl leading-none transition-transform duration-500 group-hover:translate-x-2 sm:text-3xl">
                  {s.act}
                </span>
                <span className="hidden font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/50 sm:block">{s.venue}</span>
                <ArrowUpRight className="h-4 w-4 justify-self-end text-bone/0 transition-colors duration-300 group-hover:text-bone" style={{ color: undefined }} />
              </motion.a>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* footer */}
      <div className="relative flex items-center justify-between px-6 py-6 font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/50 sm:px-10">
        <span>{day.slots.length} sets · {day.label}</span>
        <span>← → to change day</span>
      </div>
    </div>
  );
}
