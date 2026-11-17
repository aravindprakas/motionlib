// ui-116 — SpatialTestimonialConstellation
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Node = { id: string; name: string; role: string; company: string; industry: string; quote: string; x: number; y: number };

const testimonials: Node[] = [
  { id: "1", name: "Anna Kern",   role: "Design Lead",     company: "Aker Labs",    industry: "Product",  quote: "Shipped our new dashboard in 4 weeks. Motion feels intentional at every level.", x: 20, y: 30 },
  { id: "2", name: "Marc Vale",   role: "CTO",             company: "Halcyon",      industry: "SaaS",     quote: "The command layer became muscle memory for our whole engineering team.", x: 55, y: 22 },
  { id: "3", name: "Ivo Petrov",  role: "Head of Growth",  company: "Foret",        industry: "Retail",   quote: "Pricing configurator lifted conversion 22% without changing the offer.", x: 82, y: 40 },
  { id: "4", name: "Sara Chen",   role: "Principal PM",    company: "Meridian",     industry: "Fintech",  quote: "The analytics morph is the first chart people actually pay attention to.", x: 30, y: 62 },
  { id: "5", name: "Lena Ford",   role: "Creative Dir.",   company: "Studio Alma",  industry: "Agency",   quote: "The carousel finally lets our work breathe. Clients notice immediately.", x: 62, y: 70 },
  { id: "6", name: "Ravi Shah",   role: "Founder",         company: "Wren",         industry: "Media",    quote: "Story engine keeps readers on the page for 3x longer.", x: 78, y: 78 },
  { id: "7", name: "Nia Okafor",  role: "VP Design",       company: "Northern",     industry: "SaaS",     quote: "Bento workspace made everyone feel their metrics again.", x: 15, y: 82 },
];

const industries = ["All", "SaaS", "Product", "Fintech", "Retail", "Agency", "Media"];

export function ConstellationDemo() {
  const [filter, setFilter] = useState("All");
  const [focus, setFocus] = useState<Node | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const nodes = useMemo(() => filter === "All" ? testimonials : testimonials.filter((t) => t.industry === filter), [filter]);

  const focusRelated = focus ? testimonials.filter((t) => t.industry === focus.industry && t.id !== focus.id) : [];

  return (
    <div className="flex min-h-[560px] flex-col p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <div className="font-mono-tight text-[11px] uppercase tracking-widest text-ink/60">Customer stories</div>
          <div className="font-display tracking-display mt-2 text-4xl">A living constellation.</div>
        </div>
        <div className="flex flex-wrap gap-1">
          {industries.map((i) => (
            <button key={i} onClick={() => { setFilter(i); setFocus(null); }}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${filter===i?"border-ink bg-ink text-bone":"border-ink/20 text-ink/60 hover:text-ink"}`}>{i}</button>
          ))}
        </div>
      </div>

      <div
        ref={ref}
        onMouseMove={(e) => { const r = ref.current!.getBoundingClientRect(); setMouse({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
        onMouseLeave={() => setMouse(null)}
        className="relative mt-6 flex-1 overflow-hidden rounded-2xl border border-ink/20 bg-[radial-gradient(ellipse_at_center,rgba(255,77,35,0.05),transparent_70%)]"
        style={{ minHeight: 400 }}
      >
        {/* relationship lines */}
        {focus && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {focusRelated.map((r) => (
              <motion.line key={r.id}
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.4 }}
                x1={`${focus.x}%`} y1={`${focus.y}%`} x2={`${r.x}%`} y2={`${r.y}%`}
                stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 3"
              />
            ))}
          </svg>
        )}

        {nodes.map((n) => {
          const dx = mouse ? mouse.x - n.x : 0, dy = mouse ? mouse.y - n.y : 0;
          const dist = Math.hypot(dx, dy);
          const pull = mouse && dist < 20 ? (20 - dist) / 20 : 0;
          const ox = pull * dx * 0.4, oy = pull * dy * 0.4;
          const focused = focus?.id === n.id;
          return (
            <motion.button
              key={n.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              animate={{ x: ox, y: oy, scale: focused ? 1 : 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              onClick={() => setFocus(focused ? null : n)}
            >
              <div className={`grid place-items-center rounded-full border transition-all ${focused ? "h-14 w-14 border-vermilion bg-vermilion text-bone" : "h-11 w-11 border-ink/30 bg-ink/5 hover:border-vermilion"}`}>
                <span className="font-mono-tight text-[11px]">{n.name.split(" ").map((s) => s[0]).join("")}</span>
              </div>
              {focus && !focused && focusRelated.some((r) => r.id === n.id) && (
                <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-vermilion" />
              )}
            </motion.button>
          );
        })}

        <AnimatePresence>
          {focus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              className="absolute bottom-4 left-4 right-4 max-w-md rounded-2xl border border-ink/30 bg-bone p-5 shadow-elev-3"
            >
              <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">{focus.industry} · {focus.company}</div>
              <p className="font-display mt-3 text-2xl leading-snug">"{focus.quote}"</p>
              <div className="mt-3 text-sm text-ink/60">{focus.name} · {focus.role}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-3 font-mono-tight text-[11px] text-ink/60">Hover to attract nearby nodes · Click a node to reveal industry relationships.</div>
    </div>
  );
}
