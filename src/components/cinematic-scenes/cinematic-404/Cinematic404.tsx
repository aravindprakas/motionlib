// ui-31 — Cinematic404
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const GLYPHS = "!<>-_\\/[]{}—=+*^?#";
const TARGET = "SIGNAL LOST — THIS ROUTE IS OFF THE GRID";

const links = ["Home", "Selected work", "Contact"];

export function Cinematic404() {
  const [seed, setSeed] = useState(0);
  const [line, setLine] = useState("");

  // scramble-in status line
  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      const reveal = Math.floor(frame * 1.1) - 14; // hold on noise briefly
      setLine(
        TARGET.split("")
          .map((ch, k) => {
            if (ch === " ") return " ";
            if (k < reveal) return ch;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
      if (reveal >= TARGET.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [seed]);

  return (
    <div key={seed} className="relative flex min-h-[560px] select-none flex-col overflow-hidden bg-ink text-bone">
      <div className="absolute inset-0 grain" />
      <motion.div
        initial={{ scale: 1.15, opacity: 0 }} animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 6, ease: "linear" }}
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 70% 30%, #ff4d23, transparent 60%)" }}
      />

      {/* header */}
      <div className="relative flex items-center justify-between px-6 py-6 font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70 sm:px-10">
        <span>ERR · Route not found</span>
        <span className="text-vermilion">Status 404</span>
      </div>

      {/* sliced numeral */}
      <div className="relative grid flex-1 place-items-center px-6">
        <div className="relative">
          <h2 aria-hidden className="pointer-events-none select-none font-display tracking-display text-[clamp(8rem,28vw,20rem)] leading-none opacity-0">
            404
          </h2>
          {[0, 1, 2].map((s) => (
            <motion.div
              key={s}
              initial={{ x: s % 2 ? 90 : -90, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.85, ease: EASE, delay: 0.1 + s * 0.12 }}
              className="absolute inset-0 font-display tracking-display text-[clamp(8rem,28vw,20rem)] leading-none"
              style={{ clipPath: `inset(${s * 33.4}% 0 ${(2 - s) * 33.3}% 0)` }}
            >
              404
            </motion.div>
          ))}
        </div>

        {/* status line */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }}
          className="absolute bottom-6 left-6 right-6 text-center font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70 sm:bottom-10"
        >
          {line || " "}
        </motion.div>
      </div>

      {/* exits */}
      <div className="relative flex flex-wrap items-center justify-between gap-6 border-t border-bone/10 px-6 py-6 sm:px-10">
        <nav className="flex flex-wrap gap-8">
          {links.map((l, k) => (
            <div key={l} className="overflow-hidden">
              <motion.a
                href="#"
                onClick={(e) => e.preventDefault()}
                initial={{ y: "120%" }} animate={{ y: "0%" }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.55 + k * 0.09 }}
                className="group relative block font-display text-xl tracking-display text-bone/80 transition-colors hover:text-bone"
              >
                {l}
                <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-vermilion transition-transform duration-500 ease-out group-hover:scale-x-100" />
              </motion.a>
            </div>
          ))}
        </nav>
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          onClick={() => setSeed((v) => v + 1)}
          className="group flex items-center gap-3 font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70 transition-colors hover:text-bone"
        >
          Replay
          <span className="grid h-9 w-9 place-items-center rounded-full border border-bone/25 transition-all group-hover:rotate-[-120deg] group-hover:bg-bone/10">
            <RotateCcw className="h-4 w-4" />
          </span>
        </motion.button>
      </div>
    </div>
  );
}
