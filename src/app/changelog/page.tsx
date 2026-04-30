import AppLayout from "@/components/AppLayout";
import {appVersion} from "@/lib/version";
import {CalendarDays, CheckCircle2, Sparkles} from "lucide-react";

const changes = [
  {
    version: appVersion,
    date: "April 29, 2026",
    title: "Responsive blog and navigation refresh",
    items: [
      "Expanded page layouts so content scales cleanly from mobile to large desktop screens.",
      "Added blog post views, richer post metadata, and a comments section.",
      "Improved the navbar with a Blog CTA and a mobile sidebar menu.",
    ],
  },
  {
    version: "0.26.0",
    date: "April 2026",
    title: "Blog foundation",
    items: [
      "Introduced markdown-powered posts with related articles and search.",
      "Added reading progress, table of contents, RSS support, and SEO metadata.",
      "Improved code block rendering for technical articles.",
    ],
  },
  {
    version: "0.25.x",
    date: "Early 2026",
    title: "Repository tools experience",
    items: [
      "Refined repository analysis, tool discovery, and GitHub utility surfaces.",
      "Added rate-limit awareness and authenticated GitHub flows.",
      "Improved responsive cards and repository metadata displays.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <AppLayout>
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-10 lg:py-14">
        <div className="max-w-4xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-github-blue dark:text-blue-400 mb-3">
            <Sparkles size={13} />
            Product Updates
          </p>
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight mb-4">
            Changelog
          </h1>
          <p className="text-sm sm:text-base xl:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            A running record of product improvements, interface updates, and platform changes across
            iLoveGithub.
          </p>
        </div>

        <div className="mt-12 max-w-5xl">
          <div className="relative border-l border-border pl-5 sm:pl-8 space-y-8">
            {changes.map((change) => (
              <article
                key={`${change.version}-${change.title}`}
                className="relative rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm"
              >
                <span className="absolute -left-[31px] sm:-left-[43px] top-6 flex h-4 w-4 items-center justify-center rounded-full bg-github-blue ring-4 ring-background" />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-xs text-github-blue font-semibold mb-1">
                      v{change.version}
                    </p>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      {change.title}
                    </h2>
                  </div>
                  <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <CalendarDays size={13} />
                    {change.date}
                  </p>
                </div>

                <ul className="mt-5 space-y-3">
                  {change.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm sm:text-base text-muted-foreground"
                    >
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-github-green" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
