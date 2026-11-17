// ui-125 — IntelligentPricingConfigurator
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Check, Sparkles, ChevronDown } from "lucide-react";

type Plan = { id: "solo" | "team" | "scale" | "enterprise"; name: string; base: number; perSeat: number; usageIncluded: number; features: string[]; };

const plans: Plan[] = [
  { id: "solo",       name: "Solo",       base: 12,  perSeat: 0,  usageIncluded: 20,   features: ["1 workspace", "Community support", "Basic analytics"] },
  { id: "team",       name: "Team",       base: 39,  perSeat: 9,  usageIncluded: 100,  features: ["Unlimited workspaces", "Priority support", "Advanced analytics", "SSO (Google)"] },
  { id: "scale",      name: "Scale",      base: 149, perSeat: 14, usageIncluded: 500,  features: ["Everything in Team", "Audit log", "Custom roles", "SOC2 report"] },
  { id: "enterprise", name: "Enterprise", base: 0,   perSeat: 0,  usageIncluded: 0,    features: ["Everything in Scale", "Dedicated support", "Custom SLA", "On-prem option"] },
];

function AnimatedNumber({ value, prefix = "$" }: { value: number; prefix?: string }) {
  const mv = useMotionValue(value);
  const spr = useSpring(mv, { stiffness: 90, damping: 20 });
  const t = useTransform(spr, (v) => `${prefix}${Math.round(v).toLocaleString()}`);
  useEffect(() => { mv.set(value); }, [value, mv]);
  return <motion.span className="tnum">{t}</motion.span>;
}

export function PricingDemo() {
  const [yearly, setYearly] = useState(true);
  const [seats, setSeats] = useState(6);
  const [usage, setUsage] = useState(80);
  const [wantsSSO, setWantsSSO] = useState(false);
  const [wantsAudit, setWantsAudit] = useState(false);
  const [expand, setExpand] = useState<string | null>(null);

  const recommended = useMemo<Plan["id"]>(() => {
    if (seats > 50 || wantsAudit) return "enterprise";
    if (seats > 20 || wantsAudit) return "scale";
    if (seats >= 3 || wantsSSO || usage > 100) return "team";
    return "solo";
  }, [seats, usage, wantsSSO, wantsAudit]);

  const [reason, setReason] = useState("Best starter plan");
  useEffect(() => {
    if (recommended === "enterprise") setReason("Team size crosses the enterprise threshold");
    else if (recommended === "scale") setReason("Audit log or > 20 seats requires Scale");
    else if (recommended === "team") setReason(wantsSSO ? "SSO available from Team" : usage > 100 ? "Usage above Solo cap" : "Multi-seat plan fits your team");
    else setReason("Best starter plan");
  }, [recommended, wantsSSO, usage]);

  const priceFor = (p: Plan) => {
    if (p.id === "enterprise") return null;
    const monthly = p.base + p.perSeat * Math.max(0, seats - 1);
    return yearly ? Math.round(monthly * 12 * 0.8) : monthly;
  };

  return (
    <div className="grid min-h-[560px] grid-cols-1 gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      {/* configurator */}
      <div className="space-y-6">
        <div>
          <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">Configure</div>
          <div className="font-display tracking-display mt-2 text-4xl">Shape the plan to your team.</div>
        </div>

        <div className="rounded-2xl border border-ink/20 bg-ink/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm">Billing</span>
            <div className="flex gap-1 rounded-full border border-ink/20 p-1">
              {[["Monthly", false], ["Yearly · −20%", true]].map(([l, v]) => (
                <button key={String(v)} onClick={() => setYearly(v as boolean)}
                  className={`relative rounded-full px-3 py-1 text-xs ${yearly === v ? "text-bone" : "text-ink/60"}`}>
                  {yearly === v && <motion.span layoutId="bill-pill" className="absolute inset-0 rounded-full bg-ink"/>}
                  <span className="relative">{l as string}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-ink/20 bg-ink/5 p-5 space-y-5">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm">Team size</span>
              <span className="font-mono-tight tnum text-sm">{seats} {seats === 1 ? "seat" : "seats"}</span>
            </div>
            <input type="range" min={1} max={80} value={seats} onChange={(e) => setSeats(+e.target.value)}
              className="mt-3 w-full accent-accent" />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm">Monthly requests</span>
              <span className="font-mono-tight tnum text-sm">{usage}k</span>
            </div>
            <input type="range" min={10} max={2000} step={10} value={usage} onChange={(e) => setUsage(+e.target.value)}
              className="mt-3 w-full accent-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${wantsSSO?"border-vermilion bg-vermilion/10":"border-ink/20"}`}>
              <input type="checkbox" checked={wantsSSO} onChange={(e) => setWantsSSO(e.target.checked)} className="accent-accent"/>SSO
            </label>
            <label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${wantsAudit?"border-vermilion bg-vermilion/10":"border-ink/20"}`}>
              <input type="checkbox" checked={wantsAudit} onChange={(e) => setWantsAudit(e.target.checked)} className="accent-accent"/>Audit log
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-vermilion/50 bg-vermilion/5 p-5">
          <div className="flex items-center gap-2 font-mono-tight text-[11px] uppercase tracking-widest text-vermilion">
            <Sparkles className="h-3.5 w-3.5"/> Recommendation
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={recommended} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <div className="font-display tracking-display mt-2 text-3xl">{plans.find((p) => p.id === recommended)!.name}</div>
              <div className="mt-1 text-sm text-ink/60">{reason}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* plans */}
      <div className="space-y-3">
        {plans.map((p) => {
          const price = priceFor(p);
          const isRec = recommended === p.id;
          const open = expand === p.id;
          return (
            <motion.div key={p.id} layout
              className={`overflow-hidden rounded-2xl border p-5 transition-colors ${isRec ? "border-vermilion bg-vermilion/5" : "border-ink/20 bg-ink/5"}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-display text-2xl">{p.name}</div>
                    {isRec && <span className="rounded-full bg-vermilion px-2 py-0.5 font-mono-tight text-[10px] text-bone">Recommended</span>}
                  </div>
                  <div className="mt-1 text-xs text-ink/60">{p.id === "enterprise" ? "Custom pricing" : p.perSeat ? `Base + $${p.perSeat}/seat` : "Flat rate"}</div>
                </div>
                <div className="text-right">
                  {price !== null ? (
                    <div className="font-display text-3xl"><AnimatedNumber value={price} />
                      <span className="ml-1 text-sm text-ink/60">/{yearly ? "yr" : "mo"}</span></div>
                  ) : (
                    <div className="font-display text-3xl">Talk to us</div>
                  )}
                </div>
              </div>
              <button onClick={() => setExpand(open ? null : p.id)} className="mt-3 flex items-center gap-1 text-xs text-ink/60 hover:text-ink">
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open?"rotate-180":""}`}/> {open ? "Hide" : "See"} what's included
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="mt-3 space-y-2 overflow-hidden">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-ink/60"><Check className="h-3.5 w-3.5 text-moss"/>{f}</li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
