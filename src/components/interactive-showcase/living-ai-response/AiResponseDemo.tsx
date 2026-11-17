// ui-126 — LivingAiResponse
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wrench, FileText, Copy, RefreshCw, GitBranch, Check, ChevronRight, ArrowUp } from "lucide-react";

type Stage = "idle" | "thinking" | "tools" | "answer" | "artifacts" | "done";

const suggestions = [
  "Summarize this week's active users",
  "Draft a launch note for v2",
  "Find blocked PRs across the org",
];

const answerText = "Weekly actives climbed 12.4% to 24,180 with the strongest gains from the /projects surface after the bento redesign. Retention held steady at 68% (week 4). Recommend doubling down on onboarding for the Team plan segment where signup-to-active conversion still lags.";

export function AiResponseDemo() {
  const [stage, setStage] = useState<Stage>("idle");
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const run = (q: string) => {
    setPrompt(q); setText(""); setStage("thinking");
    setTimeout(() => setStage("tools"), 900);
    setTimeout(() => setStage("answer"), 2100);
  };

  useEffect(() => {
    if (stage !== "answer") return;
    let i = 0; const id = setInterval(() => {
      i += 3; setText(answerText.slice(0, i));
      if (i >= answerText.length) { clearInterval(id); setStage("artifacts"); setTimeout(() => setStage("done"), 700); }
    }, 22);
    return () => clearInterval(id);
  }, [stage]);

  const reset = () => { setStage("idle"); setText(""); setPrompt(""); };

  return (
    <div className="flex min-h-[560px] flex-col p-6 sm:p-8">
      <div className="flex items-center gap-2 font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-ink/10"><Sparkles className="h-3 w-3 text-vermilion"/></span> Assistant · v2
      </div>

      <AnimatePresence mode="wait">
        {stage === "idle" ? (
          <motion.div key="idle" exit={{ opacity: 0 }} className="mt-8 flex-1">
            <div className="font-display tracking-display text-4xl">What should we look at?</div>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {suggestions.map((s) => (
                <button key={s} onClick={() => run(s)} className="group rounded-xl border border-ink/20 bg-ink/5 p-4 text-left text-sm hover:border-vermilion">
                  <div className="text-ink/60 group-hover:text-ink">{s}</div>
                  <div className="mt-4 flex items-center gap-1 font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">Run <ChevronRight className="h-3 w-3"/></div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="resp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex flex-1 flex-col gap-4">
            <div className="rounded-xl border border-ink/20 bg-ink/5 px-4 py-3 text-sm">
              <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">You</div>
              <div className="mt-1">{prompt}</div>
            </div>

            {/* thinking */}
            <AnimatePresence>
              {(stage === "thinking" || stage === "tools" || stage === "answer" || stage === "artifacts" || stage === "done") && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-ink/20 p-4"
                >
                  <button onClick={() => setReasoningOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
                    <div className="flex items-center gap-2 font-mono-tight text-[11px] uppercase tracking-widest text-ink/60">
                      {stage === "thinking" ? (
                        <span className="flex gap-1">
                          {[0,1,2].map((i) => <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-vermilion" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.1, delay: i * 0.15, repeat: Infinity }} />)}
                        </span>
                      ) : <Check className="h-3 w-3 text-moss"/>} Reasoning
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 text-ink/60 transition-transform ${reasoningOpen ? "rotate-90" : ""}`}/>
                  </button>
                  <AnimatePresence>
                    {reasoningOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="mt-3 overflow-hidden font-mono-tight text-xs text-ink/60">
                        <div>1. Retrieve weekly-actives series for the last 4 weeks.</div>
                        <div>2. Segment by surface and cohort.</div>
                        <div>3. Compare against retention curve, flag anomalies.</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* tools */}
            <AnimatePresence>
              {(stage === "tools" || stage === "answer" || stage === "artifacts" || stage === "done") && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
                  {[["query_metrics","reading analytics"],["segment_users","segmenting cohorts"],["analyze_retention","computing retention"]].map(([name, sub], i) => (
                    <motion.div key={name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                      className="flex items-center gap-2 rounded-full border border-ink/20 bg-ink/5 px-3 py-1.5 text-xs">
                      <Wrench className="h-3 w-3 text-vermilion"/>
                      <span className="font-mono-tight">{name}</span>
                      <span className="text-ink/60">· {sub}</span>
                      {stage !== "tools" && <Check className="h-3 w-3 text-moss"/>}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* answer */}
            {(stage === "answer" || stage === "artifacts" || stage === "done") && (
              <div className="rounded-xl border border-ink/20 bg-ink/5 p-5">
                <div className="font-mono-tight text-[10px] uppercase tracking-widest text-ink/60">Answer</div>
                <p className="mt-2 text-[15px] leading-relaxed">{text}<motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.7, repeat: Infinity }}>▍</motion.span></p>
              </div>
            )}

            {/* artifacts */}
            <AnimatePresence>
              {(stage === "artifacts" || stage === "done") && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-ink/20 bg-ink/5 p-4">
                    <div className="flex items-center gap-2 font-mono-tight text-[10px] uppercase tracking-widest text-ink/60"><FileText className="h-3 w-3"/> weekly.sql</div>
                    <pre className="mt-2 overflow-x-auto font-mono-tight text-[11px] leading-relaxed text-ink/90">
{`SELECT surface, count(distinct user_id) AS wau
FROM events WHERE ts > now() - interval '7 days'
GROUP BY surface ORDER BY wau DESC;`}
                    </pre>
                  </div>
                  <div className="rounded-xl border border-ink/20 bg-ink/5 p-4">
                    <div className="flex items-center gap-2 font-mono-tight text-[10px] uppercase tracking-widest text-ink/60"><FileText className="h-3 w-3"/> segments.csv</div>
                    <table className="mt-2 w-full text-xs">
                      <thead className="text-ink/60"><tr><th className="text-left font-normal">Surface</th><th className="text-right font-normal">WAU</th><th className="text-right font-normal">Δ</th></tr></thead>
                      <tbody className="tnum">
                        {[["/projects","8,412","+18%"],["/inbox","5,120","+6%"],["/analytics","3,880","+2%"]].map((r) => (
                          <tr key={r[0]} className="border-t border-ink/20"><td className="py-1">{r[0]}</td><td className="text-right">{r[1]}</td><td className="text-right text-moss">{r[2]}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* actions */}
            {stage === "done" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex flex-wrap items-center gap-2">
                <div className="mr-auto flex flex-wrap gap-2">
                  {["Drill into onboarding gap", "Draft launch note", "Compare with last month"].map((s) => (
                    <button key={s} onClick={() => run(s)} className="rounded-full border border-ink/20 px-3 py-1 text-xs hover:border-vermilion">{s}</button>
                  ))}
                </div>
                <button onClick={() => { navigator.clipboard?.writeText(answerText); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
                  className="grid h-8 w-8 place-items-center rounded-full border border-ink/20 hover:bg-ink/10">{copied ? <Check className="h-3.5 w-3.5 text-moss"/> : <Copy className="h-3.5 w-3.5"/>}</button>
                <button onClick={() => run(prompt)} className="grid h-8 w-8 place-items-center rounded-full border border-ink/20 hover:bg-ink/10"><RefreshCw className="h-3.5 w-3.5"/></button>
                <button className="grid h-8 w-8 place-items-center rounded-full border border-ink/20 hover:bg-ink/10"><GitBranch className="h-3.5 w-3.5"/></button>
                <button onClick={reset} className="rounded-full bg-ink px-3 py-1 text-xs text-bone">New</button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {stage === "idle" && (
        <form onSubmit={(e) => { e.preventDefault(); if (prompt.trim()) run(prompt); }}
          className="mt-6 flex items-center gap-2 rounded-2xl border border-ink/20 bg-ink/5 p-2">
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything about your workspace…"
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-ink/60"/>
          <button className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-bone disabled:opacity-40" disabled={!prompt.trim()}><ArrowUp className="h-4 w-4"/></button>
        </form>
      )}
    </div>
  );
}
