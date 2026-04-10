"use client";

import { Mail, MessageSquare, ArrowRight, CheckCircle2, Rocket, ChevronRight } from "lucide-react";
import Link from "next/link";

const REASONS = [
  { value: "general",    label: "General enquiry" },
  { value: "bug",        label: "Bug / issue report" },
  { value: "billing",    label: "Billing & plans" },
  { value: "deployment", label: "Deployment problem" },
  { value: "enterprise", label: "Enterprise sales" },
  { value: "other",      label: "Something else" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-base)]">

      {/* ── NAV ── */}
      <header className="sticky top-0 z-20 border-b border-[var(--border-default)] bg-[var(--surface-base)]/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-[var(--text-strong)]">
            <Rocket className="w-4 h-4 text-[var(--accent)]" />
            DeployHub
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">

        {/* ── HERO ── */}
        <div className="mb-16 max-w-xl">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--accent)] mb-4">
            Support
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight leading-none text-[var(--text-strong)] mb-5">
            How can we<br />
            <span className="text-[var(--accent)]">help you?</span>
          </h1>
          <p className="text-lg leading-relaxed text-[var(--text-muted)]">
            Got a question, hit a bug, or just want to say hello — reach out and we'll get back to you within one business day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">

          {/* ── EMAIL CARD ── */}
          <a
            href="mailto:memilanrai19@gmail.com"
            className="group flex flex-col gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-8 transition-all hover:border-[var(--accent)]/50 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl p-3 bg-[var(--accent)]/10">
                <Mail className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-strong)] mb-1">Send us an email</h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                For queries, bug reports, billing issues or anything else — email us and we'll reply within one business day.
              </p>
              <span className="text-sm font-semibold text-[var(--accent)] group-hover:text-[var(--accent-hover)] transition-colors">
                memilanrai19@gmail.com
              </span>
            </div>
          </a>

          {/* ── RESPONSE TIMES CARD ── */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-8">
            <div className="rounded-xl p-3 bg-[var(--accent)]/10 w-fit">
              <MessageSquare className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-strong)] mb-1">Response times</h2>
              <p className="text-sm text-[var(--text-muted)] mb-5">We prioritise based on urgency.</p>
              <ul className="space-y-3">
                {[
                  { type: "General enquiry", time: "< 24 hours" },
                  { type: "Bug report",      time: "< 12 hours" },
                  { type: "Billing",         time: "< 8 hours"  },
                  { type: "Enterprise",      time: "< 4 hours"  },
                ].map(({ type, time }) => (
                  <li key={type} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">{type}</span>
                    <span className="font-semibold text-[var(--text-strong)] tabular-nums">{time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}