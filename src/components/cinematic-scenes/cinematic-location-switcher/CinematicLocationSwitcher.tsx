// ui-28 — CinematicLocationSwitcher
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

type City = { city: string; country: string; offset: number; lat: string; lng: string; color: string; hue: string };

const cities: City[] = [
  { city: "Oslo",     country: "Norway",    offset: 120,  lat: "59.91° N", lng: "10.75° E",  color: "#ff4d23", hue: "linear-gradient(135deg,#1a0a04,#3d1608)" },
  { city: "Lisbon",   country: "Portugal",  offset: 60,   lat: "38.72° N", lng: "9.14° W",   color: "#2f9e7f", hue: "linear-gradient(135deg,#04211a,#0a3d31)" },
  { city: "New York", country: "USA",       offset: -240, lat: "40.71° N", lng: "74.01° W",  color: "#e8a23d", hue: "linear-gradient(135deg,#1f1608,#3d2c10)" },
  { city: "Tokyo",    country: "Japan",     offset: 540,  lat: "35.68° N", lng: "139.69° E", color: "#7b6cf6", hue: "linear-gradient(135deg,#140f24,#281c47)" },
];

const utcLabel = (offset: number) => {
  const h = offset / 60;
  return `UTC${h >= 0 ? "+" : "−"}${Math.abs(h)}`;
};

function timeFor(now: Date, offset: number, withSeconds = true) {
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const d = new Date(utc + offset * 60000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return withSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
}

export function CinematicLocationSwitcher() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const go = (n: number) => {
    if (n === i) return;
    setDir(n > i ? 1 : -1);
    setI(n);
  };

  const c = cities[i];

  return (
    <div className="flex min-h-[560px] select-none flex-col bg-ink text-bone">
      {/* stage */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence custom={dir} mode="popLayout">
          <motion.div
            key={c.city}
            initial={{ clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0 0 0)" }}
            exit={{ clipPath: dir > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" }}
            transition={{ duration: 0.85, ease: EASE }}
            className="absolute inset-0"
            style={{ background: c.hue }}
          >
            <div className="absolute inset-0 grain opacity-70" />
            <motion.div
              initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: "linear" }}
              className="absolute inset-0 opacity-40"
              style={{ background: `radial-gradient(ellipse at 25% 25%, ${c.color}, transparent 60%)` }}
            />

            <div className="relative flex h-full min-h-[440px] flex-col px-6 py-6 sm:px-10">
              <div className="flex items-center justify-between font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/70">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.35 }}>
                  Studios · Worldwide
                </motion.span>
                <span><span className="text-bone">{String(i + 1).padStart(2, "0")}</span> / {String(cities.length).padStart(2, "0")}</span>
              </div>

              <div className="mt-auto">
                <motion.div
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="font-mono-tight text-[11px] uppercase tracking-[0.24em]"
                  style={{ color: c.color }}
                >
                  {c.country} · {utcLabel(c.offset)}
                </motion.div>
                <div className="mt-3 overflow-hidden">
                  <motion.h2
                    initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }}
                    transition={{ duration: 0.85, ease: EASE, delay: 0.15 }}
                    className="font-display tracking-display text-[clamp(3rem,10vw,8.5rem)] leading-[0.88]"
                  >
                    {c.city}
                  </motion.h2>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, delay: 0.5 }}
                  className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-bone/15 pt-6"
                >
                  <div className="font-mono-tight tnum text-4xl tracking-tight sm:text-5xl">{timeFor(now, c.offset)}</div>
                  <div className="font-mono-tight text-[11px] uppercase tracking-[0.24em] text-bone/60">
                    {c.lat} · {c.lng} · Local time
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* city rail */}
      <div className="grid grid-cols-2 border-t border-bone/10 sm:grid-cols-4">
        {cities.map((city, k) => (
          <button
            key={city.city}
            onClick={() => go(k)}
            className={`relative flex flex-col gap-1 px-6 py-5 text-left transition-colors ${k === i ? "" : "hover:bg-bone/5"}`}
          >
            {k === i && (
              <motion.span layoutId="cin-city-ink" className="absolute inset-x-0 top-0 h-0.5" style={{ background: city.color }} transition={{ duration: 0.5, ease: EASE }} />
            )}
            <span className={`font-display text-lg tracking-display ${k === i ? "text-bone" : "text-bone/50"}`}>{city.city}</span>
            <span className="font-mono-tight tnum text-[11px] tracking-[0.24em] text-bone/50">{timeFor(now, city.offset, false)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
