// ui-26 — CinematicTeamRoster
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

type Person = { name: string; role: string; place: string; since: string; color: string; hue: string };

const people: Person[] = [
  { name: "Mara Vinter",   role: "Creative Director", place: "Oslo",      since: "2019", color: "#ff4d23", hue: "linear-gradient(135deg,#1a0a04,#3d1608)" },
  { name: "Jonas Reyes",   role: "Design Lead",       place: "Lisbon",    since: "2021", color: "#2f9e7f", hue: "linear-gradient(135deg,#04211a,#0a3d31)" },
  { name: "Aya Lindqvist", role: "Motion Designer",   place: "Stockholm", since: "2022", color: "#e8a23d", hue: "linear-gradient(135deg,#1f1608,#3d2c10)" },
  { name: "Teo Marchetti", role: "Developer",         place: "Turin",     since: "2020", color: "#7b6cf6", hue: "linear-gradient(135deg,#140f24,#281c47)" },
  { name: "Ines Kaur",     role: "Producer",          place: "Berlin",    since: "2023", color: "#e8639c", hue: "linear-gradient(135deg,#210a14,#3d1226)" },
];

const initials = (name: string) => name.split(" ").map((w) => w.charAt(0)).join("");

export function CinematicTeamRoster() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (n: number) => {
    if (n === i) return;
    setDir(n > i ? 1 : -1);
    setI(n);
  };

  const p = people[i];

  return (
    <div className="flex min-h-[560px] select-none flex-col bg-ink text-bone lg:flex-row">
      {/* roster */}
      <div className="flex flex-1 flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">
          <span>The studio · Roster</span>
          <span><span className="text-bone">{String(i + 1).padStart(2, "0")}</span> / {String(people.length).padStart(2, "0")}</span>
        </div>

        <div className="mt-8">
          {people.map((per, k) => (
            <button
              key={per.name}
              onMouseEnter={() => go(k)}
              onClick={() => go(k)}
              className={`group flex w-full items-baseline gap-4 border-b border-bone/10 py-4 text-left transition-all duration-500 ${k === i ? "pl-3" : "pl-0"}`}
            >
              <span className="font-mono-tight text-[11px] tracking-[0.24em] text-bone/50">0{k + 1}</span>
              <span
                className={`font-display tracking-display text-[clamp(1.75rem,4vw,3rem)] leading-none transition-colors duration-300 ${k === i ? "" : "text-bone/45 group-hover:text-bone/80"}`}
                style={{ color: k === i ? per.color : undefined }}
              >
                {per.name}
              </span>
              <span className={`ml-auto hidden font-mono-tight text-[11px] uppercase tracking-[0.24em] transition-opacity duration-300 sm:block ${k === i ? "text-bone/80 opacity-100" : "opacity-0"}`}>
                {per.role}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-8 font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/50">
          Hover a name to meet them
        </div>
      </div>

      {/* portrait stage */}
      <div className="relative min-h-[320px] overflow-hidden border-t border-bone/10 lg:min-h-0 lg:w-[42%] lg:border-l lg:border-t-0">
        <AnimatePresence custom={dir} mode="popLayout">
          <motion.div
            key={p.name}
            initial={{ clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0 0 0)" }}
            exit={{ clipPath: dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" }}
            transition={{ duration: 0.75, ease: EASE }}
            className="absolute inset-0"
            style={{ background: p.hue }}
          >
            <div className="absolute inset-0 grain opacity-70" />
            <motion.div
              initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: "linear" }}
              className="absolute inset-0 opacity-45"
              style={{ background: `radial-gradient(ellipse at 50% 30%, ${p.color}, transparent 65%)` }}
            />

            {/* monogram plate */}
            <div className="absolute inset-0 grid place-items-center">
              <div className="overflow-hidden">
                <motion.div
                  initial={{ y: "60%", opacity: 0 }} animate={{ y: "0%", opacity: 1 }} exit={{ y: "-60%", opacity: 0 }}
                  transition={{ duration: 0.75, ease: EASE, delay: 0.1 }}
                  className="font-display text-[clamp(6rem,14vw,11rem)] leading-none tracking-display text-bone/90"
                >
                  {initials(p.name)}
                </motion.div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 px-6 pb-6 sm:px-8">
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex items-end justify-between gap-4"
              >
                <div>
                  <div className="font-mono-tight text-[11px] uppercase tracking-[0.24em]" style={{ color: p.color }}>{p.role}</div>
                  <div className="mt-1 font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/60">{p.place} · Since {p.since}</div>
                </div>
                <div className="font-mono-tight text-[11px] tracking-[0.24em] text-bone/50">0{i + 1}</div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
