// ui-29 — CinematicVariantStage
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

type Variant = {
  name: string; hex: string; deep: string; hue: string;
  material: string; finish: string; weight: string;
};

const variants: Variant[] = [
  { name: "Ember",       hex: "#ff4d23", deep: "#7a1f06", hue: "linear-gradient(135deg,#1a0a04,#3d1608)", material: "Powder-coated steel", finish: "Matte",   weight: "1.4 kg" },
  { name: "Moss",        hex: "#2f9e7f", deep: "#0d4234", hue: "linear-gradient(135deg,#04211a,#0a3d31)", material: "Recycled aluminium",  finish: "Brushed", weight: "1.3 kg" },
  { name: "Ochre",       hex: "#e8a23d", deep: "#6e4713", hue: "linear-gradient(135deg,#1f1608,#3d2c10)", material: "Powder-coated steel", finish: "Matte",   weight: "1.4 kg" },
  { name: "Ultraviolet", hex: "#7b6cf6", deep: "#2c2371", hue: "linear-gradient(135deg,#140f24,#281c47)", material: "Anodised aluminium",  finish: "Satin",   weight: "1.3 kg" },
];

export function CinematicVariantStage() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (n: number) => {
    if (n === i) return;
    setDir(n > i ? 1 : -1);
    setI(n);
  };

  const v = variants[i];

  return (
    <div className="flex min-h-[560px] select-none flex-col bg-ink text-bone lg:flex-row">
      {/* stage */}
      <div className="relative min-h-[420px] flex-1 overflow-hidden">
        <AnimatePresence custom={dir} mode="popLayout">
          <motion.div
            key={v.name}
            initial={{ clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0 0 0)" }}
            exit={{ clipPath: dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="absolute inset-0"
            style={{ background: v.hue }}
          >
            <div className="absolute inset-0 grain opacity-70" />
            <motion.div
              initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: "linear" }}
              className="absolute inset-0 opacity-35"
              style={{ background: `radial-gradient(ellipse at 50% 20%, ${v.hex}, transparent 62%)` }}
            />

            {/* product object */}
            <div className="absolute inset-0 grid place-items-center">
              <motion.div
                initial={{ scale: 0.92, y: 24, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: -16, opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
                className="relative h-64 w-52 rounded-[2.5rem] shadow-elev-3"
                style={{ background: `linear-gradient(160deg, ${v.hex}, ${v.deep})` }}
              >
                {/* grille */}
                <div
                  className="absolute inset-6 rounded-[1.75rem]"
                  style={{
                    backgroundImage: "radial-gradient(rgba(12,11,14,0.5) 1.5px, transparent 1.5px)",
                    backgroundSize: "11px 11px",
                  }}
                />
                {/* knob */}
                <div className="absolute bottom-5 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full border-2 border-ink/50" />
                {/* sheen */}
                <div className="absolute inset-0 rounded-[2.5rem]" style={{ background: "linear-gradient(120deg, rgba(236,230,216,0.28), transparent 40%)" }} />
              </motion.div>
            </div>

            <div className="relative flex h-full flex-col justify-between px-6 py-6 sm:px-10">
              <div className="flex items-center justify-between font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.35 }}>
                  AUR·1 — Desk speaker
                </motion.span>
                <span><span className="text-bone">{String(i + 1).padStart(2, "0")}</span> / {String(variants.length).padStart(2, "0")}</span>
              </div>
              <div className="overflow-hidden self-start">
                <motion.div
                  initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                  className="font-display tracking-display text-[clamp(2.25rem,6vw,4.5rem)] leading-none"
                  style={{ color: v.hex }}
                >
                  {v.name}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* spec panel */}
      <div className="flex flex-col border-t border-bone/10 lg:w-[340px] lg:border-l lg:border-t-0">
        <div className="px-6 py-6 font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">Configure</div>

        <AnimatePresence mode="wait">
          <motion.div key={v.name} className="px-6">
            {[
              ["Colourway", v.name],
              ["Material", v.material],
              ["Finish", v.finish],
              ["Weight", v.weight],
              ["Ships", "3–5 days"],
            ].map(([label, value], k) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, delay: 0.1 + k * 0.06, ease: EASE }}
                className="flex items-baseline justify-between border-t border-bone/10 py-3"
              >
                <span className="font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/50">{label}</span>
                <span className="font-display text-base tracking-display">{value}</span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* swatches */}
        <div className="mt-auto border-t border-bone/10 px-6 py-6">
          <div className="flex items-center gap-3">
            {variants.map((va, k) => (
              <button
                key={va.name}
                onClick={() => go(k)}
                aria-label={va.name}
                className={`h-8 w-8 rounded-full transition-transform ${k === i ? "scale-110 ring-2 ring-bone ring-offset-2 ring-offset-ink" : "hover:scale-105"}`}
                style={{ background: va.hex }}
              />
            ))}
            <span className="ml-auto font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/60">$249</span>
          </div>
          <button
            className="mt-6 w-full border border-bone/25 py-3 font-mono-tight text-[11px] uppercase tracking-[0.24em] transition-colors hover:text-ink"
            style={{ ["--sw" as string]: v.hex }}
            onMouseEnter={(e) => { e.currentTarget.style.background = v.hex; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            Add to order — {v.name}
          </button>
        </div>
      </div>
    </div>
  );
}
