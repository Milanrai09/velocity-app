import Link from "next/link";
import { notFound } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import {
  Rocket,
  ExternalLink,
  Calendar,
  Package,
  CheckCircle2,
  ArrowRight,
  Clock,
  Globe,
  Layers,
} from "lucide-react";
import DeployedSearch from "../features/search/debounceSearch";


// ─── DATA ────────────────────────────────────────────────────────────────────

async function getLatestDeployment() {
  const session = await auth0.getSession();
  const userId = session?.user?.sub;
  if (!userId) notFound();

  const deployment = await prisma.deployment.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.deployment.count({ where: { userId } });

  return { deployment, total };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    year: 31536000, month: 2592000, week: 604800,
    day: 86400, hour: 3600, minute: 60,
  };
  for (const [unit, s] of Object.entries(intervals)) {
    const n = Math.floor(seconds / s);
    if (n >= 1) return `${n} ${unit}${n > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="bg-linear-to-br from-(--surface-accent-soft) to-(--surface-card-muted) rounded-full p-8 mb-6 shadow-inner">
        <Rocket className="w-16 h-16 text-accent" />
      </div>
      <h2 className="text-3xl font-bold text-(--text-strong) mb-3">Nothing deployed yet</h2>
      <p className="text-(--text-muted) max-w-sm mb-8 leading-relaxed">
        Launch your first project and it will appear here as your active deployment.
      </p>
      <Link
        href="/deploy"
        className="inline-flex items-center gap-2 bg-accent hover:bg-(--accent-hover) text-(--text-inverse) px-7 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
      >
        <Rocket className="w-4 h-4" />
        Create first deployment
      </Link>
    </div>
  );
}

// ─── STAT PILL ────────────────────────────────────────────────────────────────

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-[var(--surface-card)] rounded-xl border border-[var(--border-default)] px-5 py-4 shadow-sm">
      <div className="bg-(--surface-accent-soft) rounded-lg p-2">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <div>
        <p className="text-xs text-[var(--text-subtle)] font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-(--text-default) mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const { deployment, total } = await getLatestDeployment();

  return (
    <div className="min-h-screen bg-linear-to-br from-(--surface-page-from) via-(--surface-page-via) to-(--surface-page-to)">

      {/* ── Top Nav Bar ── */}
      <header className="bg-(--surface-glass) backdrop-blur border-b border-(--border-default) sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-(--text-strong) text-lg">
            <Rocket className="w-5 h-5 text-accent" />
            DeployHub
          </div>
            <DeployedSearch/>
          <div className="flex items-center gap-3">
            <Link
              href="/deployed"
              className="text-sm text-(--text-default) hover:text-(--text-strong) font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-(--surface-hover)"
            >
              All deployments
            </Link>
            <Link
              href="/deployment"
              className="inline-flex items-center gap-1.5 bg-accent hover:bg-(--accent-hover) text-(--text-inverse) text-sm px-4 py-2 rounded-lg font-semibold transition-all shadow-sm hover:shadow"
            >
              <Rocket className="w-3.5 h-3.5" />
              Deploy
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">

        {!deployment ? (
          <EmptyState />
        ) : (
          <>
            {/* ── Page heading ── */}
            <div className="mb-10">
              <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-2">
                Latest deployment
              </p>
              <h1 className="text-4xl font-extrabold text-(--text-strong) tracking-tight">
                {deployment.name}
              </h1>
              <p className="text-(--text-muted) mt-2 text-base">
                Deployed {timeAgo(deployment.createdAt)} · {formatDate(deployment.createdAt)}
              </p>
            </div>

            {/* ── Hero Card ── */}
            <div className="bg-[var(--surface-card)] rounded-2xl border-2 border-[var(--border-strong)] shadow-lg overflow-hidden mb-8">

              {/* Coloured top stripe */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent-gradient-mid)] to-[var(--accent-gradient-end)]" />

              <div className="p-8">

                {/* Status + slug row */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <span className="inline-flex items-center gap-1.5 bg-[var(--surface-success)] border border-[var(--border-success)] text-[var(--text-success)] text-xs font-semibold px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-[var(--surface-chip)] border border-[var(--border-default)] text-[var(--text-default)] text-xs font-medium px-3 py-1.5 rounded-full">
                    <Package className="w-3.5 h-3.5" />
                    {deployment.projectSlug}
                  </span>
                </div>

                {/* Live URL block */}
                <div className="mb-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-subtle)] mb-3">
                    Live URL
                  </p>
                  <a
                    href={deployment.proxyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 bg-[var(--surface-card-muted)] hover:bg-[var(--surface-accent-soft)] border border-[var(--border-default)] hover:border-[var(--border-accent)] rounded-xl px-5 py-4 transition-all"
                  >
                    <Globe className="w-5 h-5 text-[var(--text-subtle)] group-hover:text-[var(--accent)] shrink-0 transition-colors" />
                    <span className="font-mono text-[var(--accent)] group-hover:text-[var(--accent-hover)] text-sm truncate flex-1 transition-colors">
                      {deployment.proxyUrl}
                    </span>
                    <ExternalLink className="w-4 h-4 text-[var(--text-subtle)] group-hover:text-[var(--accent)] shrink-0 transition-colors" />
                  </a>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <Stat icon={Package}  label="Project slug" value={deployment.projectSlug} />
                  <Stat icon={Clock}    label="Deployed"     value={timeAgo(deployment.createdAt)} />
                  <Stat icon={Calendar} label="Date"         value={formatDate(deployment.createdAt)} />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-[var(--border-soft)]">
                  <Link
                    href={`/deployed/${deployment.id}`}
                    className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-inverse)] px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    View full details
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href={deployment.proxyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-default)] px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open live site
                  </a>
                </div>
              </div>
            </div>

            {/* ── Footer hint ── */}
            {total > 1 && (
              <div className="flex items-center justify-between bg-[var(--surface-card)] rounded-xl border border-[var(--border-default)] px-6 py-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <Layers className="w-4 h-4 text-[var(--text-subtle)]" />
                  You have{" "}
                  <span className="font-semibold text-[var(--text-strong)]">{total}</span>{" "}
                  deployments in total
                </div>
                <Link
                  href="/deployed"
                  className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
