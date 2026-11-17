// ui-108 — LiquidNavigationDock
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Home, Search, Compass, Inbox, Bell, User, Settings, Plus, MessageSquare, Bookmark, Calendar } from "lucide-react";

const items = [
  { id: "home", label: "Home", icon: Home },
  { id: "search", label: "Search", icon: Search },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "inbox", label: "Inbox", icon: Inbox, badge: 3 },
  { id: "bell", label: "Notifications", icon: Bell },
  { id: "add", label: "Create", icon: Plus, primary: true, expandable: true },
  { id: "user", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

const nested = [
  { id: "note", label: "New note", icon: Bookmark },
  { id: "msg", label: "New message", icon: MessageSquare },
  { id: "event", label: "New event", icon: Calendar },
];

function DockItem({ mouseX, item, active, onClick, onExpand, expanded }: any) {
  const ref = useRef<HTMLButtonElement>(null);
  const distance = useTransform(mouseX, (v: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return 0;
    return v - (rect.left + rect.width / 2);
  });
  const size = useTransform(distance, [-120, 0, 120], [44, 60, 44]);
  const sizeS = useSpring(size, { stiffness: 300, damping: 22 });
  const [hover, setHover] = useState(false);
  const Icon = item.icon;
  return (
    <motion.button
      ref={ref} onClick={() => { onClick(item.id); if (item.expandable) onExpand(); }}
      onHoverStart={() => setHover(true)} onHoverEnd={() => setHover(false)}
      style={{ width: sizeS, height: sizeS }}
      className={`relative grid shrink-0 place-items-center rounded-2xl transition-colors ${item.primary ? "bg-vermilion text-bone" : "bg-ink/10 text-ink hover:bg-ink/5"}`}
    >
      {active === item.id && !item.primary && (
        <motion.span layoutId="dock-pill" className="absolute inset-0 rounded-2xl ring-2 ring-vermilion" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
      )}
      <Icon className="h-5 w-5" />
      {item.badge && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-vermilion px-1 font-mono-tight text-[10px] text-bone">{item.badge}</span>}
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-full border border-ink/20 bg-bone px-2.5 py-1 text-[11px] shadow-elev-2"
          >{item.label}</motion.span>
        )}
      </AnimatePresence>
      {item.expandable && expanded && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-moss" />
      )}
    </motion.button>
  );
}

export function DockDemo() {
  const [active, setActive] = useState("home");
  const [expanded, setExpanded] = useState(false);
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="relative flex min-h-[560px] flex-col overflow-hidden bg-[radial-gradient(ellipse_at_bottom,rgba(47,158,127,0.06),transparent_60%)]">
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-2xl pt-8 text-center">
          <div className="font-mono-tight text-[11px] uppercase tracking-widest text-ink/60">Currently viewing</div>
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="font-display tracking-display mt-3 text-6xl capitalize">{active}</motion.div>
          </AnimatePresence>
          <p className="mt-4 text-sm text-ink/60">Hover the dock — the active pill flows between items with spring physics. Click the accent to expand nested actions.</p>
        </div>

        <div className="mx-auto mt-16 flex max-w-3xl flex-wrap gap-3">
          {["Editorial", "Motion", "Product", "Research"].map((t) => (
            <div key={t} className="rounded-2xl border border-ink/20 bg-ink/5 p-4">
              <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">Section</div>
              <div className="mt-1 font-display text-2xl">{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* dock */}
      <div className="pb-8">
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
              className="mx-auto mb-3 flex w-fit gap-2 rounded-2xl border border-ink/30 bg-bone/90 p-2 shadow-elev-3 backdrop-blur"
            >
              {nested.map((n) => (
                <button key={n.id} onClick={() => { setActive(n.id); setExpanded(false); }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-ink/10">
                  <n.icon className="h-4 w-4 text-ink/60"/>{n.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          onMouseMove={(e) => mouseX.set(e.clientX)} onMouseLeave={() => mouseX.set(Infinity)}
          className="mx-auto flex w-fit items-end gap-2 rounded-2xl border border-ink/30 bg-bone/90 p-2 shadow-elev-3 backdrop-blur"
        >
          {items.map((it) => <DockItem key={it.id} item={it} mouseX={mouseX} active={active} onClick={setActive} onExpand={() => setExpanded((e) => !e)} expanded={expanded} />)}
        </motion.div>
      </div>
    </div>
  );
}
