"use client";

import React, {useState, useMemo} from "react";
import Image from "next/image";
import {ArrowUpRight, BrainCircuit, Search, X, ExternalLink} from "lucide-react";
import {Tool} from "@/lib/types";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";

function isNew(createdAt: string): boolean {
  return (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 3600 * 24) <= 15;
}

function getDomain(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/* Deterministic accent colour per category ─────────────────── */
const ACCENTS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-indigo-500",
];

function categoryAccent(category: string): string {
  let h = 0;
  for (let i = 0; i < category.length; i++) h = (h * 31 + category.charCodeAt(i)) % ACCENTS.length;
  return ACCENTS[h];
}

/* ── Tool description with stop-propagation expand ─────────── */
function ToolDescription({description}: {description: string}) {
  const [expanded, setExpanded] = useState(false);
  const max = 120;
  const isTruncated = description.length > max;
  const text = isTruncated && !expanded ? description.slice(0, max) + "…" : description;

  return (
    <p className="text-sm text-muted-foreground leading-relaxed">
      {text}
      {isTruncated && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="ml-1 text-github-blue dark:text-blue-400 hover:underline font-medium text-xs"
        >
          {expanded ? "less" : "more"}
        </button>
      )}
    </p>
  );
}

/* ── Tool card ──────────────────────────────────────────────── */
function ToolCard({tool, accent}: {tool: Tool; accent: string}) {
  const domain = getDomain(tool.link || tool.url || tool.homepage);
  const hasIcon = tool.icon && /\.(png|jpe?g|gif|svg|webp|bmp|ico)$/i.test(tool.icon);
  const href = tool.link || tool.url || tool.homepage;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800
                 bg-white dark:bg-gray-900 overflow-hidden
                 transition-all duration-200
                 hover:border-github-blue/40 hover:shadow-xl hover:shadow-github-blue/8
                 hover:-translate-y-1
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-github-blue/40"
    >
      {/* Accent stripe */}
      <div className={cn("h-1 w-full", accent)} />

      <div className="flex flex-col gap-4 p-5 flex-1">
        {/* Top row: icon + NEW badge */}
        <div className="flex items-start justify-between">
          <div
            className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800
                          border border-gray-100 dark:border-gray-700/50
                          flex items-center justify-center shrink-0
                          group-hover:border-github-blue/20 transition-colors"
          >
            {hasIcon ? (
              <Image
                alt={`${tool.name} icon`}
                src={tool.icon!}
                width={26}
                height={26}
                className="rounded-sm dark:invert dark:hue-rotate-15"
              />
            ) : (
              <BrainCircuit size={22} className="text-muted-foreground" />
            )}
          </div>

          {tool.created_at && isNew(tool.created_at) && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full
                             text-[10px] font-bold tracking-wide uppercase
                             bg-github-green/10 text-github-green border border-github-green/20"
            >
              New
            </span>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2 flex-1">
          <h3
            className="text-base font-semibold text-foreground leading-snug
                         group-hover:text-github-blue dark:group-hover:text-blue-400
                         transition-colors duration-150"
          >
            {tool.title}
          </h3>
          <ToolDescription description={tool.description} />
        </div>

        {/* Footer: domain + arrow */}
        <div
          className="flex items-center justify-between pt-3
                        border-t border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <ExternalLink size={11} className="shrink-0 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground truncate">{domain}</span>
          </div>
          <ArrowUpRight
            size={15}
            className="shrink-0 text-muted-foreground/60
                       group-hover:text-github-blue dark:group-hover:text-blue-400
                       transition-all duration-150
                       group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>
    </a>
  );
}

/* ── Main component ─────────────────────────────────────────── */
const GitHubTools = ({tools}: {tools: Tool[]}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTools = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return tools;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    );
  }, [tools, searchTerm]);

  const toolsByCategory = useMemo(
    () =>
      filteredTools.reduce(
        (acc, tool) => {
          if (!acc[tool.category]) acc[tool.category] = [];
          acc[tool.category].push(tool);
          return acc;
        },
        {} as Record<string, Tool[]>,
      ),
    [filteredTools],
  );

  const categories = Object.entries(toolsByCategory);

  return (
    <div className="w-full mt-12 animate-fade-in">
      {/* Section header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
          Popular GitHub Tools
        </h2>
        <p className="text-sm text-muted-foreground">
          {tools.length} curated integrations for your repository
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-10">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          type="text"
          placeholder="Search tools by name or description…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 h-11 focus-visible:ring-github-blue/40"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2
                       text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={15} />
          </button>
        )}
        {searchTerm && (
          <p className="absolute -bottom-5 right-0 text-[11px] text-muted-foreground">
            {filteredTools.length} of {tools.length} results
          </p>
        )}
      </div>

      {/* Empty state */}
      {categories.length === 0 ? (
        <div className="text-center py-20">
          <Search size={36} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium text-foreground mb-1">No tools found</p>
          <p className="text-xs text-muted-foreground">
            Try a different keyword or{" "}
            <button onClick={() => setSearchTerm("")} className="text-github-blue hover:underline">
              clear the search
            </button>
          </p>
        </div>
      ) : (
        <div className="space-y-14">
          {categories.map(([category, categoryTools]) => {
            const accent = categoryAccent(category);
            return (
              <section key={category}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-6">
                  {/* Coloured dot matching card accent */}
                  <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", accent)} />
                  <span className="text-sm font-semibold text-foreground">{category}</span>
                  <span className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {categoryTools.length} {categoryTools.length === 1 ? "tool" : "tools"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {categoryTools.map((tool) => (
                    <ToolCard key={tool.name} tool={tool} accent={accent} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GitHubTools;
