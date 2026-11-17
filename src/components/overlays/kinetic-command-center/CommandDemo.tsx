// ui-109 — KineticCommandCenter
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import Fuse from "fuse.js";
import { Command as CommandIcon, Search, ArrowRight, FileText, Users, Settings, Zap, LineChart, Calendar, Mail, GitBranch, Terminal, ArrowUp, ArrowDown, CornerDownLeft } from "lucide-react";
import { spring } from "@/lib/motion";

type Item = { id: string; group: string; title: string; sub: string; icon: any; meta: string; preview: { title: string; body: string; kbd?: string[] } };

const items: Item[] = [
  { id: "new-doc", group: "Create", title: "New document", sub: "Blank canvas", icon: FileText, meta: "⌘N", preview: { title: "Blank document", body: "Start with a clean editor pre-configured with your team's style and typography defaults.", kbd: ["⌘","N"] } },
  { id: "invite", group: "Create", title: "Invite teammate", sub: "Send an email invite", icon: Users, meta: "⌘⇧I", preview: { title: "Invite by email", body: "Invitees join the current workspace with member permissions. Roles can be edited later." } },
  { id: "run", group: "Actions", title: "Run workflow", sub: "Trigger the deploy pipeline", icon: Zap, meta: "⌘R", preview: { title: "Deploy pipeline", body: "Executes lint → test → build → deploy across production and preview environments." } },
  { id: "analytics", group: "Actions", title: "Open analytics", sub: "This week's metrics", icon: LineChart, meta: "⌘A", preview: { title: "Weekly analytics", body: "Sessions +12.4% · Conversion 3.8% · P75 latency 148ms · New signups 214." } },
  { id: "schedule", group: "Actions", title: "Schedule review", sub: "Book a design review", icon: Calendar, meta: "", preview: { title: "Design review", body: "Suggests 30-min slots based on your calendar and reviewer availability." } },
  { id: "settings", group: "Preferences", title: "Workspace settings", sub: "Members, billing, integrations", icon: Settings, meta: "⌘,", preview: { title: "Workspace settings", body: "Manage roles, billing seats, connected services and organization-wide defaults." } },
  { id: "inbox", group: "Navigate", title: "Go to inbox", sub: "12 unread threads", icon: Mail, meta: "G I", preview: { title: "Inbox · 12 unread", body: "Threads are grouped by project. Unread reviews and mentions appear first." } },
  { id: "branch", group: "Navigate", title: "Switch branch", sub: "main · staging · feat/*", icon: GitBranch, meta: "⌘B", preview: { title: "Switch branch", body: "Fuzzy-search across 18 branches. Recent branches surface first." } },
  { id: "term", group: "Navigate", title: "Open terminal", sub: "Persistent workspace shell", icon: Terminal, meta: "⌘`", preview: { title: "Terminal", body: "Session persists across reloads. Environment variables are auto-injected." } },
];

const recent = ["run", "analytics", "invite"];

export function CommandDemo() {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const fuse = useMemo(() => new Fuse(items, { keys: ["title", "sub", "group"], threshold: 0.4 }), []);
  const results = useMemo(() => {
    if (!query.trim()) {
      const ordered = [...recent.map((id) => items.find((i) => i.id === id)!), ...items.filter((i) => !recent.includes(i.id))];
      return ordered;
    }
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (!open) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results.length]);

  const current = results[active];
  const grouped = results.reduce<Record<string, Item[]>>((acc, it) => { (acc[it.group] ||= []).push(it); return acc; }, {});

  return (
    <div className="relative grid min-h-[560px] place-items-center bg-[radial-gradient(ellipse_at_top,rgba(255,77,35,0.06),transparent_60%)] p-6">
      {!open && (
        <button onClick={() => setOpen(true)} className="flex items-center gap-3 rounded-full border border-ink/30 bg-ink/5 px-5 py-3 text-sm text-ink/60 shadow-elev-2 hover:bg-ink/10">
          <CommandIcon className="h-4 w-4" /> Press <kbd className="rounded bg-ink/10 px-1.5 py-0.5 font-mono-tight text-xs">⌘ K</kbd> to open
        </button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={spring.snappy}
            className="w-full max-w-[860px] overflow-hidden rounded-2xl border border-ink/30 bg-bone/95 shadow-elev-3 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-ink/20 px-5 py-4">
              <Search className="h-4 w-4 text-ink/60" />
              <motion.input
                autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, projects, people…"
                className="flex-1 bg-transparent text-lg outline-none placeholder:text-ink/60"
              />
              <div className="hidden gap-1 font-mono-tight text-[10px] text-ink/60 sm:flex">
                <kbd className="rounded bg-ink/10 px-1.5 py-0.5">ESC</kbd> close
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr]">
              <div className="max-h-[420px] overflow-y-auto py-2 no-scrollbar">
                <LayoutGroup>
                  {Object.entries(grouped).length === 0 ? (
                    <div className="p-8 text-center text-sm text-ink/60">
                      <div className="font-display text-2xl text-ink">No matches</div>
                      <div className="mt-2">Try <span className="text-vermilion">"invite"</span> or <span className="text-vermilion">"deploy"</span></div>
                    </div>
                  ) : Object.entries(grouped).map(([group, arr]) => (
                    <div key={group} className="mb-1">
                      <div className="px-4 pt-2 pb-1 font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">
                        {group}
                      </div>
                      {arr.map((it) => {
                        const idx = results.indexOf(it);
                        const isActive = idx === active;
                        const Icon = it.icon;
                        return (
                          <button
                            key={it.id} onMouseEnter={() => setActive(idx)} onClick={() => setActive(idx)}
                            className="relative flex w-full items-center gap-3 px-3 py-2.5"
                          >
                            {isActive && <motion.div layoutId="cmd-active" className="absolute inset-x-2 inset-y-0 rounded-lg bg-ink/10 ring-1 ring-ink/20" transition={spring.snappy} />}
                            <div className="relative grid h-8 w-8 place-items-center rounded-md border border-ink/20 bg-ink/5">
                              <Icon className="h-4 w-4 text-ink/60" />
                            </div>
                            <div className="relative min-w-0 flex-1 text-left">
                              <div className="truncate text-sm">{it.title}</div>
                              <div className="truncate text-xs text-ink/60">{it.sub}</div>
                            </div>
                            <div className="relative font-mono-tight text-[10px] text-ink/60">{it.meta}</div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </LayoutGroup>
              </div>

              <div className="hidden border-l border-ink/20 md:block">
                <AnimatePresence mode="wait">
                  {current && (
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="flex h-full flex-col p-6"
                    >
                      <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">Preview · {current.group}</div>
                      <div className="mt-3 font-display tracking-display text-3xl leading-tight">{current.preview.title}</div>
                      <p className="mt-3 text-sm text-ink/60">{current.preview.body}</p>
                      <div className="mt-6 rounded-lg border border-ink/20 bg-ink/5 p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-ink/60">Estimated action</span>
                          <span className="font-mono-tight text-moss">ready</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                            <motion.span initial={{ width: 0 }} animate={{ width: "62%" }} transition={{ duration: 0.6 }} className="block h-full bg-vermilion" />
                          </span>
                          <span className="font-mono-tight text-[11px] tnum text-ink/60">62%</span>
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-6">
                        <div className="flex items-center gap-2 font-mono-tight text-[11px] text-ink/60">
                          <ArrowUp className="h-3 w-3"/><ArrowDown className="h-3 w-3"/> navigate <span className="mx-2">·</span> <CornerDownLeft className="h-3 w-3"/> select
                        </div>
                        <button className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs text-bone">Run <ArrowRight className="h-3.5 w-3.5" /></button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
