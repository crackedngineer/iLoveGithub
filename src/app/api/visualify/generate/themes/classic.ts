import {BaseCardGenerator, BaseSVGDetails} from "./base";
import {escapeXml, formatNumber} from "./utils";
import {newGithubClient} from "@/lib/utils";
import {CardGeneratorGitRepo} from "@/lib/types";

type ElementKey =
  | "stars"
  | "forks"
  | "language"
  | "description"
  | "watchers"
  | "contributors"
  | "issues";

/**
 * A single language segment for the bottom strip.
 * `pct` is the share of the codebase (0–100). All entries must sum to ≤ 100;
 * any remainder is rendered as a neutral "other" segment automatically.
 * Min 1 entry, max 3 entries enforced at runtime.
 */
export interface LanguageSegment {
  language: string;
  pct: number; // 0–100
}

interface ClassicSVGConfig extends BaseSVGDetails {
  //   description: string;
  //   height: number;
  //   width: number;
  //   stars: number;
  //   forks: number;
  //   language: string; // primary language (used for lang dot + fallback strip)
  //   logo_url?: string;
  elements: string[];

  //   /**
  //    * Language breakdown for the bottom color strip.
  //    * 1–3 entries. If omitted, the strip falls back to the single primary language
  //    * at 100 %.
  //    */
  //   languageBreakdown?: LanguageSegment[];
}

interface ThemeTokens {
  backgroundColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
}

interface Layout {
  cardW: number;
  cardH: number;
  padding: number;
  avatarW: number;
  avatarH: number;
  avatarX: number;
  avatarY: number;
  // Top-anchored
  titleY: number;
  descY: number | null;
  // Bottom-anchored (placed working upward from the strip)
  statsY: number | null;
  langY: number | null;
  stripH: number;
  stripY: number;
  activeStats: ElementKey[];
  statXPositions: number[];
  maxDescChars: number;
}

// Card structure
const PADDING = 40; // outer padding on all sides

// Avatar
const AVATAR_W = 120;
const AVATAR_H = 80;
const AVATAR_MARGIN = 20;

// Typography
const TITLE_FONT_SIZE = 42;
const TITLE_H = TITLE_FONT_SIZE + 10; // ascent + breathing room
const DESC_FONT_SIZE = 16;
const DESC_GAP = 16; // gap between title baseline and desc top
const DESC_TRAIL = 8; // space below desc baseline

// Stats row (bottom block)
const STAT_SECTION_H = 48; // icon 20px + value 14px + label 12px + internal gaps

// Language dot row (bottom block)
const LANG_STATS_GAP = 14; // gap between stats row and language row

// Strip
const STRIP_H = 15;

// Content
const CHAR_PX = 2.5; // approximate px per char at DESC_FONT_SIZE

const STAT_KEYS: ElementKey[] = ["contributors", "issues", "stars", "forks", "watchers"];

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#ce422b",
  "C++": "#f34b7d",
  "C#": "#239120",
  Ruby: "#cc342d",
  PHP: "#777bb4",
  Swift: "#FA7343",
  Kotlin: "#7F52FF",
  Lua: "#000080",
  R: "#198CE7",
  Scala: "#DC322F",
};

export class ClassicCardGenerator extends BaseCardGenerator {
  defaultColors: ThemeTokens;

  constructor() {
    super();
    this.defaultColors = {
      backgroundColor: "#0d1117",
      titleColor: "#c9d1d9",
      textColor: "#8b949e",
      accentColor: "#58a6ff",
      borderColor: "#30363d",
    };
  }

  _setConfig(params: URLSearchParams): void {
    this.config = {
      ...this.config,
      elements: params.get("elements")?.split(","),
    } as ClassicSVGConfig;
  }

  getLangColor(lang: string): string {
    return LANG_COLORS[lang] ?? "#858585";
  }

  /**
   * Two-pass layout engine.
   *
   * Pass 1 — TOP-DOWN: measures the title + description block to find the
   *   lowest y-coordinate owned by top content.
   *
   * Pass 2 — BOTTOM-UP: places the bottom block (language row → stats row →
   *   padding → strip) relative to a fixed card bottom, working upward.
   *   The card height is the greater of:
   *     a) the minimum height needed to hold the top block without collision, or
   *     b) a designer-chosen MIN_CARD_H constant that ensures the card never
   *        looks too squat even when top content is minimal.
   *
   * All downstream renderers read only from the returned Layout object.
   */
  computeLayout(config: ClassicSVGConfig): Layout {
    const has = (k: ElementKey) => config.elements?.includes(k) ?? true;

    // ── Dimensions come directly from config ──────────────────────────────────
    const cardW = this.config.width;
    const cardH = this.config.height;

    // ── Horizontal ────────────────────────────────────────────────────────────
    const activeStats = STAT_KEYS.filter(has);
    const statCount = activeStats.length;

    const avatarX = cardW - PADDING - AVATAR_W;
    const avatarY = PADDING + 20;

    // Text area: full width minus both paddings
    const textW = cardW - PADDING * 2;

    const maxDescChars = Math.floor((textW - AVATAR_MARGIN - AVATAR_W) / CHAR_PX);

    const statSlotW = statCount > 0 ? Math.floor(textW / statCount) : 0;
    const statXPositions = activeStats.map((_, i) => PADDING + i * statSlotW);

    // ── Pass 1: top-down — measure top block ──────────────────────────────────
    let topY = PADDING;

    topY += TITLE_H;
    const titleY = topY; // text baseline

    let descY: number | null = null;
    if (has("description")) {
      topY += DESC_GAP;
      descY = topY + DESC_FONT_SIZE; // baseline
      topY = descY + DESC_TRAIL;
    }

    // ── Pass 2: bottom-up — anchor bottom block to card bottom ────────────────
    //
    // cardH is fixed (from config). We resolve positions by working upward
    // from the strip, which is always pinned to the bottom edge.
    //
    //   cardH
    //   − STRIP_H             → stripY
    //   − PADDING             → base of language row
    //   − LANG_ROW_H          → langY baseline   (if visible)
    //   − LANG_STATS_GAP      (if both visible)
    //   − STAT_SECTION_H      → statsY            (if visible)
    //
    // No collision guard is needed here — that responsibility belongs to the
    // caller: config.height must be tall enough for the chosen elements.

    const stripY = cardH - STRIP_H;

    const langRelY = 0; // distance above stripY to lang baseline
    const langY = langRelY;
    let statsRelY = 0; // distance above stripY to stats top

    // if (has("language")) {
    //   langRelY = PADDING + LANG_ROW_H - 20;
    // }

    if (statCount > 0) {
      const gapAboveLang = has("language") ? LANG_STATS_GAP : 0;
      //   statsRelY = langRelY + gapAboveLang + STAT_SECTION_H;
      statsRelY = gapAboveLang + STAT_SECTION_H + 15;
    }

    const statsY = statCount > 0 ? stripY - statsRelY : null;
    // const langY = has("language") ? stripY - langRelY : null;

    return {
      cardW,
      cardH,
      padding: PADDING,
      avatarW: AVATAR_W,
      avatarH: AVATAR_H,
      avatarX,
      avatarY,
      titleY,
      descY,
      statsY,
      langY,
      stripH: STRIP_H,
      stripY,
      activeStats,
      statXPositions,
      maxDescChars,
    };
  }

  buildTitle(owner: string, repo: string, y: number, color: string): string {
    return `
  <text x="${PADDING}" y="${y}"
    font-family="'Inter',-apple-system,BlinkMacSystemFont,sans-serif"
    font-size="${TITLE_FONT_SIZE}" font-weight="700" fill="${color}">
    <tspan>${escapeXml(owner)}/</tspan><tspan font-weight="900">${escapeXml(repo)}</tspan>
  </text>`;
  }

  buildDescription(text: string, y: number, maxDescChars: number, color: string): string {
    const maxChars = Math.floor((maxDescChars - PADDING) / CHAR_PX);
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if ((currentLine + word).length <= maxChars) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = DESC_FONT_SIZE + 4;
    const tspans = lines
      .map(
        (line, index) =>
          `<tspan x="${PADDING}" y="${y + index * lineHeight}">${escapeXml(line)}</tspan>`,
      )
      .join("");

    return `
        <text font-family="'Inter',-apple-system,BlinkMacSystemFont,sans-serif"
            font-size="${DESC_FONT_SIZE}" fill="${color}">
            ${tspans}
        </text>`;
  }

  /** Inline SVG icon paths for each stat type. Origin = (x, y). */
  buildStatIcon(key: ElementKey, x: number, y: number, color: string): string {
    const cx = x + 10,
      cy = y + 10;
    switch (key) {
      case "contributors":
        return `
        <circle cx="${cx}" cy="${cy}" r="8" stroke="${color}" stroke-width="1.5" fill="none"/>
        <circle cx="${x + 6}" cy="${cy}" r="2" fill="${color}"/>
        <circle cx="${x + 14}" cy="${cy}" r="2" fill="${color}"/>`;
      case "issues":
        return `
        <circle cx="${cx}" cy="${cy}" r="8" stroke="${color}" stroke-width="1.5" fill="none"/>
        <circle cx="${cx}" cy="${cy}" r="2" fill="${color}"/>`;
      case "watchers":
        return `
        <rect x="${x + 2}" y="${y + 2}" width="16" height="12" rx="3"
          stroke="${color}" fill="none" stroke-width="1.5"/>
        <polygon points="${x + 6},${y + 14} ${x + 10},${y + 18} ${x + 12},${y + 14}"
          fill="${color}"/>`;
      case "stars":
        return `
        <polygon
          points="${cx},${y + 2} ${x + 12},${y + 8} ${x + 18},${y + 8}
                  ${x + 13},${y + 12} ${x + 15},${y + 18} ${cx},${y + 14}
                  ${x + 5},${y + 18} ${x + 7},${y + 12} ${x + 2},${y + 8} ${x + 8},${y + 8}"
          fill="none" stroke="${color}" stroke-width="1.5"/>`;
      case "forks":
        return `
        <circle cx="${cx}" cy="${y + 5}"  r="3" fill="${color}"/>
        <circle cx="${x + 5}"  cy="${y + 18}" r="3" fill="${color}"/>
        <circle cx="${x + 15}" cy="${y + 18}" r="3" fill="${color}"/>
        <line x1="${cx}" y1="${y + 8}" x2="${x + 5}"  y2="${y + 15}"
          stroke="${color}" stroke-width="1.5"/>
        <line x1="${cx}" y1="${y + 8}" x2="${x + 15}" y2="${y + 15}"
          stroke="${color}" stroke-width="1.5"/>`;
      default:
        return "";
    }
  }

  buildStats(
    contributor_count: number,
    watcher_count: number,
    star_count: number,
    issue_count: number,
    fork_count: number,
    layout: Layout,
    textColor: string,
  ): string {
    if (layout.statsY === null) return "";

    const valueMap: Record<ElementKey, string> = {
      contributors: formatNumber(contributor_count),
      watchers: formatNumber(watcher_count),
      issues: formatNumber(issue_count),
      stars: formatNumber(star_count),
      forks: formatNumber(fork_count),
      description: "",
      language: "",
    };
    const labelMap: Record<ElementKey, string> = {
      contributors: "Contributors",
      issues: "Issues",
      watchers: "Watchers",
      stars: "Stars",
      forks: "Forks",
      description: "",
      language: "",
    };

    return layout.activeStats
      .map((key, i) => {
        const sx = layout.statXPositions[i];
        const sy = layout.statsY!;
        return `
  <g font-family="Arial,Helvetica,sans-serif" fill="${textColor}" font-size="14">
    ${this.buildStatIcon(key, sx, sy, textColor)}
    <text x="${sx + 25}" y="${sy + 14}">${valueMap[key]}</text>
    <text x="${sx + 25}" y="${sy + 33}" font-size="12" fill="${textColor}">${labelMap[key]}</text>
  </g>`;
      })
      .join("");
  }

  buildLanguage(lang: string, y: number, langColor: string, textColor: string): string {
    return `
  <circle cx="${PADDING + 5}" cy="${y}" r="5" fill="${langColor}"/>
  <text x="${PADDING + 16}" y="${y + 5}"
    font-family="'Inter',-apple-system,BlinkMacSystemFont,sans-serif"
    font-size="14" fill="${textColor}">${escapeXml(lang)}</text>`;
  }

  buildAvatar(url: string | undefined, layout: Layout, borderColor: string): string {
    const {avatarX, avatarY, avatarW, avatarH} = layout;
    if (url) {
      return `
  <image href="${escapeXml(url)}"
    x="${avatarX}" y="${avatarY}"
    width="${avatarW}" height="${avatarH}"
    preserveAspectRatio="xMidYMid meet"
    clip-path="inset(0 round 8px)"/>`;
    }
    // Fallback placeholder
    return `
  <rect x="${avatarX}" y="${avatarY}" width="${avatarW}" height="${avatarH}"
    rx="8" fill="${borderColor}" opacity="0.4"/>`;
  }

  /**
   * Normalises caller-supplied breakdown into 1–3 entries whose pcts sum to 100.
   *
   * Rules:
   *  1. Clamp to max 3 user segments (extras are silently dropped).
   *  2. If the user percentages don't sum to 100, a remainder "Other" segment is
   *     appended (as long as that doesn't push us past 3 total).
   *  3. If even after 3 user segments the sum < 100, the last segment absorbs the
   *     remainder so the bar always fills the full card width.
   */
  normaliseBreakdown(
    raw: LanguageSegment[] | undefined,
    primaryLang: string,
  ): Array<{language: string; pct: number; color: string}> {
    // Fallback: primary language fills 100 %
    const source: LanguageSegment[] =
      !raw || raw.length === 0 ? [{language: primaryLang, pct: 100}] : raw.slice(0, 3); // hard cap at 3

    // Normalise pcts so they are positive integers
    const clamped = source.map((s) => ({
      language: s.language,
      pct: Math.max(0, Math.round(s.pct)),
    }));

    const total = clamped.reduce((sum, s) => sum + s.pct, 0);
    const remainder = 100 - total;

    let segments = [...clamped];

    if (remainder > 0) {
      if (segments.length < 3) {
        // There is room for an "Other" segment
        segments.push({language: "Other", pct: remainder});
      } else {
        // No room — absorb remainder into the last user segment
        segments[segments.length - 1].pct += remainder;
      }
    } else if (remainder < 0) {
      // User pcts exceed 100 — scale them down proportionally
      segments = segments.map((s) => ({
        ...s,
        pct: Math.round((s.pct / total) * 100),
      }));
      // Fix rounding drift on the last segment
      const fixedTotal = segments.reduce((sum, s) => sum + s.pct, 0);
      segments[segments.length - 1].pct += 100 - fixedTotal;
    }

    return segments.map((s) => ({
      language: s.language,
      pct: s.pct,
      color:
        s.language === "Other" ? this.defaultColors.accentColor : this.getLangColor(s.language),
    }));
  }

  /**
   * Converts normalised percentage segments into pixel-width SVG rects.
   * The final segment always absorbs any sub-pixel rounding so rects exactly
   * fill `cardW` with no gap or overflow.
   */
  buildColorStrips(
    layout: Layout,
    breakdown: Array<{language: string; pct: number; color: string}>,
  ): string {
    const {cardW, stripY, stripH} = layout;

    let x = 0;
    const rects: string[] = [];

    breakdown.forEach((seg, i) => {
      const isLast = i === breakdown.length - 1;
      // Last segment fills whatever pixels remain to avoid rounding gaps
      const w = isLast ? cardW - x : Math.round((seg.pct / 100) * cardW);

      rects.push(
        `  <rect x="${x}" y="${stripY}" width="${w}" height="${stripH}" fill="${seg.color}"/>`,
      );
      x += w;
    });

    return rects.join("\n");
  }

  async generateCard(repoDetails: CardGeneratorGitRepo): Promise<string> {
    const config = this.config as ClassicSVGConfig;
    const layout = this.computeLayout(config);
    const langColor = this.getLangColor(repoDetails.language);

    const has = (k: ElementKey) => config.elements?.includes(k) ?? true;

    const descSection =
      has("description") && layout.descY !== null
        ? this.buildDescription(
            repoDetails.description,
            layout.descY,
            layout.maxDescChars,
            this.defaultColors.textColor,
          )
        : "";

    // Fetch Github Repo Stats
    const githubClient = newGithubClient(process.env.GITHUB_TOKEN || "");
    const contributorPromise = has("contributors")
      ? githubClient
          .get(`/repos/${repoDetails.full_name}/contributors`)
          .then((res) => res.data.length)
          .catch(() => 0)
      : Promise.resolve(0);
    const watcherPromise = has("watchers")
      ? githubClient
          .get(`/repos/${repoDetails.full_name}/subscribers`)
          .then((res) => res.data.length)
          .catch(() => 0)
      : Promise.resolve(0);
    const languagesPromise = has("language")
      ? githubClient
          .get<Record<string, number>>(`/repos/${repoDetails.full_name}/languages`)
          .then((res) => res.data)
          .catch(() => null)
      : Promise.resolve<Record<string, number> | null>(null);

    const [contributors_count, watchers_count, languagesBreakdown] = await Promise.all([
      contributorPromise,
      watcherPromise,
      languagesPromise,
    ]);
    const fork_count = has("forks") ? repoDetails.forks_count : 0;
    const star_count = has("stars") ? repoDetails.stargazers_count : 0;
    const totalLinesbyLanguage = Object.values(languagesBreakdown ?? {}).reduce<number>(
      (sum, val) => sum + val,
      0,
    );
    const languageBreakdownPercentage = Object.entries(languagesBreakdown || {}).reduce(
      (acc, [lang, linesCount]) => {
        const percentage = Math.round((linesCount / totalLinesbyLanguage) * 100);
        acc.push({language: lang, pct: percentage});
        return acc;
      },
      [] as Array<{language: string; pct: number}>,
    );

    const statsSection = this.buildStats(
      contributors_count,
      watchers_count,
      star_count,
      repoDetails.open_issues,
      fork_count,
      layout,
      this.defaultColors.textColor,
    );

    const langSection =
      has("language") && layout.langY !== null
        ? this.buildLanguage(
            repoDetails.language,
            layout.langY,
            langColor,
            this.defaultColors.textColor,
          )
        : "";

    // Normalise breakdown (1–3 segments, pcts sum to 100)

    const breakdown = this.normaliseBreakdown(languageBreakdownPercentage, repoDetails.language);

    return `<svg
  width="${layout.cardW}"
  height="${layout.cardH}"
  viewBox="0 0 ${layout.cardW} ${layout.cardH}"
  xmlns="http://www.w3.org/2000/svg">
 
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap');
    </style>
  </defs>
 
  <!-- Background -->
  <rect width="${layout.cardW}" height="${layout.cardH}" fill="${this.defaultColors.backgroundColor}"/>
  <rect width="${layout.cardW}" height="1" y="${layout.cardH - 1}" fill="${this.defaultColors.borderColor}"/>
 
  <!-- Title -->
  ${this.buildTitle(repoDetails.owner.login, repoDetails.name, layout.titleY, this.defaultColors.titleColor)}
 
  <!-- Description -->
  ${descSection}
 
  <!-- Stats -->
  ${statsSection}
 
  <!-- Language -->
  ${langSection}
 
  <!-- Avatar -->
  ${this.buildAvatar(repoDetails.owner.avatar_url, layout, this.defaultColors.borderColor)}
 
  <!-- Language breakdown strip -->
  ${this.buildColorStrips(layout, breakdown)}
</svg>`;
  }
}

export class LightClassicCardGenerator extends ClassicCardGenerator {
  static themeIdentifier = "light-classic";
  static themeName = "Light Classic";

  constructor() {
    super();
    this.defaultColors = {
      backgroundColor: "#f8f8f8",
      titleColor: "#2d3748",
      textColor: "#4a5568",
      accentColor: "#2563eb",
      borderColor: "#e2e8f0",
    };
  }
}

export class DarkClassicCardGenerator extends ClassicCardGenerator {
  static themeName = "Dark Classic";
  static themeIdentifier = "dark-classic";
  constructor() {
    super();
    this.defaultColors = {
      backgroundColor: "#0d1117",
      titleColor: "#c9d1d9",
      textColor: "#8b949e",
      accentColor: "#586069",
      borderColor: "#373e47",
    };
  }
}
