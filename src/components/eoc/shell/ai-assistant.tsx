"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";
import { aiInsights } from "@/lib/eoc/data";
import { EButton } from "../page-header";

interface Msg {
  role: "user" | "ai";
  text: string;
}

const SUGGESTIONS = [
  "Summarize platform health",
  "What needs my attention today?",
  "Where can I reduce cost?",
  "Any security risks right now?",
];

function reply(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("cost") || p.includes("save"))
    return "I found 2 cost optimizations worth ~₹2,080/mo: right-size 60 idle CRM seats (~₹840) and move 2 idle AI agents to on-demand (~₹1,240). Want me to draft the changes?";
  if (p.includes("security") || p.includes("risk"))
    return "1 critical threat was auto-mitigated (brute-force on API key). 1 high-severity storage misconfiguration is under investigation. Overall security score is 94/100 — trending up 2.1%.";
  if (p.includes("attention") || p.includes("today"))
    return "3 items: Beacon Marketing memory at 81% (scale-out recommended), Servora ITSM patch 6.1.0 rolling out, and invoice INV-2026-0588 is overdue.";
  return "Platform health is 98.4% with 42 apps running and availability at 99.98%. 7 apps have updates available and 12 maintenance tasks are scheduled. Everything is within healthy thresholds.";
}

export function AIAssistant() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      role: "ai",
      text: "Hi Riya — I'm your Operations copilot. Ask me about health, security, cost, or maintenance across your workspace.",
    },
  ]);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: reply(text) }]);
    }, 500);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-eoc-accent to-[#7C3AED] px-4 py-3 text-sm font-medium text-white shadow-[0_8px_30px_-6px_rgba(79,124,255,0.7)]"
      >
        <Sparkles className="h-5 w-5" />
        <span className="hidden sm:block">Ask AI</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed bottom-0 right-0 top-0 z-[91] flex w-full max-w-md flex-col border-l border-eoc-border bg-eoc-surface"
            >
              <div className="flex items-center gap-3 border-b border-eoc-border px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-eoc-accent to-[#7C3AED] text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-eoc-fg">Operations Copilot</p>
                  <p className="text-[11px] text-eoc-success">● Online · context-aware</p>
                </div>
                <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-eoc-muted hover:bg-white/5 hover:text-eoc-fg">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5 [scrollbar-width:thin]">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                  >
                    <div
                      className={
                        m.role === "user"
                          ? "max-w-[80%] rounded-2xl rounded-br-sm bg-eoc-accent px-3.5 py-2.5 text-sm text-white"
                          : "max-w-[85%] rounded-2xl rounded-bl-sm border border-eoc-border bg-eoc-card px-3.5 py-2.5 text-sm text-eoc-fg2"
                      }
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}

                {messages.length <= 1 && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-eoc-muted">Top recommendation</p>
                    <div className="rounded-xl border border-eoc-accent/30 bg-eoc-accent/[0.06] p-3">
                      <p className="text-sm font-medium text-eoc-fg">{aiInsights[0].title}</p>
                      <p className="mt-1 text-xs text-eoc-fg2">{aiInsights[0].detail}</p>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              <div className="border-t border-eoc-border p-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-eoc-border bg-white/[0.03] px-3 py-1 text-xs text-eoc-fg2 transition-colors hover:bg-white/[0.07] hover:text-eoc-fg"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-eoc-border bg-eoc-card px-3 py-1.5">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send(input)}
                    placeholder="Ask anything about your operations…"
                    className="flex-1 bg-transparent py-1.5 text-sm text-eoc-fg outline-none placeholder:text-eoc-muted"
                  />
                  <EButton size="icon" variant="primary" className="h-8 w-8" onClick={() => send(input)}>
                    <Send className="h-4 w-4" />
                  </EButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
