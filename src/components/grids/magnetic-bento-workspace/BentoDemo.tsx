// ui-78 — MagneticBentoWorkspace
import { useState, type PointerEvent } from "react";
import { motion, AnimatePresence, LayoutGroup, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, TrendingUp, Users, Zap, Sparkles, X } from "lucide-react";
import { spring } from "@/lib/motion";

type Panel = { id: string; span: string; kind: "metric" | "activity" | "chart" | "team" | "prompt" };

const panels: Panel[] = [
  { id: "revenue", span: "col-span-2 row-span-2", kind: "chart" },
  { id: "mrr", span: "col-span-1 row-span-1", kind: "metric" },
  { id: "users", span: "col-span-1 row-span-1", kind: "metric" },
  { id: "activity", span: "col-span-2 row-span-1", kind: "activity" },
  { id: "team", span: "col-span-1 row-span-1", kind: "team" },
  { id: "ai", span: "col-span-1 row-span-1", kind: "prompt" },
];

function useTilt() {
  const rx = useSpring(0, { stiffness: 260, damping: 22 });
  const ry = useSpring(0, { stiffness: 260, damping: 22 });
  const mx = useSpring(0, { stiffness: 260, damping: 22 });
  const my = useSpring(0, { stiffness: 260, damping: 22 });
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    rx.set(-y * 6); ry.set(x * 6); mx.set(x * 8); my.set(y * 8);
  };
  const onLeave = () => { rx.set(0); ry.set(0); mx.set(0); my.set(0); };
  return { rx, ry, mx, my, onMove, onLeave };
}

function Panel({ p, onOpen }: { p: Panel; onOpen: (id: string) => void }) {
  const t = useTilt();
  return (
    <motion.div
      layoutId={`panel-${p.id}`} onClick={() => onOpen(p.id)}
      onPointerMove={t.onMove} onPointerLeave={t.onLeave}
      style={{ transformPerspective: 1000, rotateX: t.rx, rotateY: t.ry }}
      className={`${p.span} group relative cursor-pointer overflow-hidden rounded-2xl border border-ink/20 bg-bone p-5 shadow-elev-2 transition-colors hover:border-ink/30`}
      transition={spring.soft}
    >
      <motion.div style={{ x: t.mx, y: t.my }} className="relative z-10 flex h-full flex-col">
        <PanelContent kind={p.kind} id={p.id} />
        <ArrowUpRight className="absolute right-0 top-0 h-4 w-4 text-ink/60 opacity-0 transition-opacity group-hover:opacity-100" />
      </motion.div>
    </motion.div>
  );
}

function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const mv = useMotionValue(0);
  const spr = useSpring(mv, { stiffness: 60, damping: 20 });
  const rounded = useTransform(spr, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);
  useState(() => { setTimeout(() => mv.set(to), 100); return null; });
  return <motion.span className="tnum">{rounded}</motion.span>;
}

function Sparkline({ data, color = "var(--color-accent)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / (max - min)) * 100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
      <motion.polyline initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: [0.22,1,0.36,1] }}
        fill="none" stroke={color} strokeWidth="1.2" points={pts} vectorEffect="non-scaling-stroke" />
      <polyline fill="url(#g)" stroke="none" points={`0,100 ${pts} 100,100`} opacity="0.15" />
      <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color}/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>
    </svg>
  );
}

function PanelContent({ kind, id }: { kind: Panel["kind"]; id: string }) {
  if (kind === "chart" && id === "revenue") return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">Revenue · 30d</div>
          <div className="font-display tracking-display mt-1 text-5xl"><Counter to={284310} prefix="$"/></div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-moss"><TrendingUp className="h-3 w-3"/> +18.4% vs prev.</div>
        </div>
        <div className="rounded-full border border-ink/20 px-2 py-1 font-mono-tight text-[10px] text-ink/60">USD</div>
      </div>
      <div className="mt-6 flex-1"><Sparkline data={[8,14,10,16,22,18,26,20,28,24,32,30,38,36,44]} /></div>
    </>
  );
  if (kind === "metric" && id === "mrr") return (
    <>
      <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">MRR</div>
      <div className="font-display tracking-display mt-2 text-4xl"><Counter to={48200} prefix="$"/></div>
      <div className="mt-auto flex items-center gap-2 text-xs text-ink/60"><Zap className="h-3 w-3 text-vermilion"/> 12 new plans</div>
    </>
  );
  if (kind === "metric" && id === "users") return (
    <>
      <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">Active users</div>
      <div className="font-display tracking-display mt-2 text-4xl"><Counter to={12480}/></div>
      <div className="mt-auto flex items-center gap-2 text-xs text-moss"><Users className="h-3 w-3"/> +214 today</div>
    </>
  );
  if (kind === "activity") return (
    <>
      <div className="flex items-center justify-between">
        <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">Live activity</div>
        <div className="flex items-center gap-1.5 text-xs text-moss"><span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping rounded-full bg-moss opacity-60"/><span className="relative h-2 w-2 rounded-full bg-moss"/></span> live</div>
      </div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {[["Anna Kern","deployed staging","2s"],["Marc Vale","closed issue #482","1m"],["Ivo Petrov","reviewed PR #199","3m"],["Sara Chen","invited 2 members","6m"]].map(([who,what,when]) => (
          <li key={who} className="flex items-center gap-3">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-ink/10 font-mono-tight text-[10px]">{who.split(" ").map(s=>s[0]).join("")}</div>
            <div className="min-w-0 flex-1 truncate"><span className="text-ink">{who}</span> <span className="text-ink/60">{what}</span></div>
            <div className="font-mono-tight text-[10px] text-ink/60">{when}</div>
          </li>
        ))}
      </ul>
    </>
  );
  if (kind === "team") return (
    <>
      <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">Team</div>
      <div className="mt-4 flex -space-x-2">
        {["AK","MV","IP","SC","+8"].map((s,i) => (
          <div key={s} className={`grid h-9 w-9 place-items-center rounded-full border-2 border-ink/20 font-mono-tight text-[11px] ${i===4?"bg-ink/10 text-ink/60":"bg-vermilion text-bone"}`}>{s}</div>
        ))}
      </div>
      <div className="mt-auto text-xs text-ink/60">12 members · 3 online</div>
    </>
  );
  return (
    <>
      <div className="flex items-center gap-2 font-mono-tight text-[10px] uppercase tracking-widest text-ink/60"><Sparkles className="h-3 w-3 text-vermilion"/> Assistant</div>
      <div className="mt-3 text-sm">Summarize last week's shipping cadence and flag blocked PRs.</div>
      <button className="mt-auto flex w-full items-center justify-between rounded-lg border border-ink/20 px-3 py-2 text-xs hover:bg-ink/10">Run summary <ArrowUpRight className="h-3.5 w-3.5"/></button>
    </>
  );
}

export function BentoDemo() {
  const [focused, setFocused] = useState<string | null>(null);
  return (
    <div className="relative min-h-[560px] p-4 sm:p-6">
      <LayoutGroup>
        <div className="grid auto-rows-[130px] grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {panels.map((p) => <Panel key={p.id} p={p} onOpen={setFocused} />)}
        </div>
        <AnimatePresence>
          {focused && (
            <motion.div
              key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setFocused(null)}
              className="absolute inset-0 z-10 bg-bone/60 backdrop-blur-md"
            />
          )}
          {focused && (
            <motion.div
              key={focused} layoutId={`panel-${focused}`}
              className="absolute inset-4 z-20 overflow-hidden rounded-2xl border border-ink/30 bg-bone p-8 shadow-elev-3 sm:inset-10"
              transition={spring.soft}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">Focused panel</div>
                  <div className="font-display tracking-display mt-2 text-5xl capitalize">{focused}</div>
                </div>
                <button onClick={() => setFocused(null)} className="grid h-9 w-9 place-items-center rounded-full border border-ink/20 hover:bg-ink/10"><X className="h-4 w-4"/></button>
              </div>
              <div className="mt-8 h-64"><Sparkline data={[4,10,7,14,20,16,22,18,26,22,30,28,36,32,42,38,48]} /></div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[["Sessions","24,180"],["Conversion","3.8%"],["P75 latency","148ms"]].map(([l,v]) => (
                  <div key={l} className="rounded-xl border border-ink/20 p-4">
                    <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">{l}</div>
                    <div className="mt-1 text-2xl tnum">{v}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
