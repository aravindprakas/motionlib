// ui-115 — MorphingAnalyticsExplorer
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

type View = "line" | "bar" | "radial";
const data = [12, 18, 14, 22, 30, 26, 34, 28, 38, 32, 42, 46, 52, 48, 58, 64, 60, 72];

const W = 640, H = 260, PAD = 24;

function toPoints(vals: number[]) {
  const max = Math.max(...vals), min = 0;
  return vals.map((v, i) => ({
    x: PAD + (i * (W - PAD * 2)) / (vals.length - 1),
    y: H - PAD - ((v - min) / (max - min)) * (H - PAD * 2),
    v,
  }));
}

function radialPoints(vals: number[]) {
  const max = Math.max(...vals);
  const cx = W / 2, cy = H / 2, R = 100;
  return vals.map((v, i) => {
    const a = (i / vals.length) * Math.PI * 2 - Math.PI / 2;
    const r = 20 + (v / max) * R;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, v };
  });
}

export function AnalyticsDemo() {
  const [view, setView] = useState<View>("line");
  const [hover, setHover] = useState<number | null>(null);
  const [compare, setCompare] = useState(false);
  const secondary = useMemo(() => data.map((v) => Math.max(4, Math.round(v * 0.7 + (Math.random() - 0.5) * 6))), []);

  const primaryPts = view === "radial" ? radialPoints(data) : toPoints(data);
  const secPts = view === "radial" ? radialPoints(secondary) : toPoints(secondary);

  return (
    <div className="flex min-h-[560px] flex-col p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">Revenue · 18 weeks</div>
          <div className="font-display tracking-display mt-2 text-5xl tnum">$284,310</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-moss"><TrendingUp className="h-3 w-3"/> +18.4% vs previous period</div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex gap-1 rounded-full border border-ink/20 p-1">
            {(["line","bar","radial"] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`relative rounded-full px-3 py-1.5 text-xs capitalize transition-colors ${view===v?"text-bone":"text-ink/60 hover:text-ink"}`}>
                {view === v && <motion.span layoutId="chart-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">{v}</span>
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-ink/60">
            <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="accent-accent"/>
            Compare vs previous
          </label>
        </div>
      </div>

      <div className="mt-6 flex-1 rounded-xl border border-ink/20 bg-ink/5/60 p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="none"
          onMouseLeave={() => setHover(null)}
        >
          {/* grid */}
          {view !== "radial" && [0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={PAD} x2={W - PAD} y1={H - PAD - (H - PAD * 2) * f} y2={H - PAD - (H - PAD * 2) * f} stroke="currentColor" className="text-ink/25" strokeDasharray="2 4" />
          ))}

          {compare && secPts.map((p, i) => (
            <motion.circle key={`s-${i}`} cx={p.x} cy={p.y} r={3.5} initial={false}
              animate={{ cx: p.x, cy: p.y }} transition={{ type: "spring", stiffness: 200, damping: 26 }}
              fill="var(--color-muted-foreground)" opacity={0.5} />
          ))}
          {primaryPts.map((p, i) => (
            <motion.circle key={`p-${i}`} cx={p.x} cy={p.y} r={hover === i ? 7 : 4.5} initial={false}
              animate={{ cx: p.x, cy: p.y, r: hover === i ? 7 : 4.5 }} transition={{ type: "spring", stiffness: 200, damping: 26 }}
              fill="var(--color-accent)" onMouseEnter={() => setHover(i)} />
          ))}

          {view === "line" && (
            <motion.path fill="none" stroke="var(--color-accent)" strokeWidth="1.5" initial={false}
              animate={{ d: `M ${primaryPts.map((p) => `${p.x},${p.y}`).join(" L ")}` }}
              transition={{ type: "spring", stiffness: 160, damping: 24 }}
            />
          )}
          {view === "bar" && primaryPts.map((p, i) => (
            <motion.rect key={i} initial={false}
              animate={{ x: p.x - 8, y: p.y, width: 16, height: H - PAD - p.y }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
              rx="2" fill="var(--color-accent)" opacity={0.9}
            />
          ))}

          {hover !== null && (
            <>
              <line x1={primaryPts[hover].x} x2={primaryPts[hover].x} y1={PAD} y2={H - PAD} stroke="currentColor" className="text-ink/30" />
              <g>
                <rect x={primaryPts[hover].x - 40} y={primaryPts[hover].y - 44} width={80} height={30} rx={6} fill="var(--color-popover)" stroke="var(--color-border-strong)"/>
                <text x={primaryPts[hover].x} y={primaryPts[hover].y - 26} textAnchor="middle" className="font-mono-tight tnum" fontSize="11" fill="currentColor">${(data[hover] * 1000).toLocaleString()}</text>
              </g>
            </>
          )}
        </svg>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Sessions","24,180","+12%"],["Conversion","3.8%","+0.4pp"],["ARPU","$41","+$3"],["Churn","1.9%","-0.3pp"]].map(([l,v,d]) => (
          <div key={l} className="rounded-xl border border-ink/20 p-4">
            <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">{l}</div>
            <div className="mt-1 text-2xl tnum">{v}</div>
            <div className="mt-1 text-[11px] text-moss">{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
