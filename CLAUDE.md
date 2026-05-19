# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overvi**iLoveGithub** is a curated collection of tools and visualizations built around GitHub:

- Repository analytics and visualization (SVG cards)
- QR code generation
- Integration with 100+ external GitHub tools
- Hugo blog (proxied to Netlify at `/blog/*`)

**Version**: 0.25.0 | **Deployment**: Vercel

---

## Tech Stack

- **Framework**: Next.js 16+ (App Router, React 19)
- **Language**: TypeScript (strict mode, `@/*` → `./src/*`)
- **Styling**: Tailwind CSS 4, Radix UI, Lucide icons, Motion
- **Database/Cache**: Upstash Redis (KV storage)
- **Authentication**: Supabase
- **API Client**: Axios
- **SVG Rendering**: `@resvg/resvg-js` (server external package)

---

## Common Development Commands

```bash
npm run dev          # Dev server with Turbopack (http://localhost:3000)
npm run build        # Production build (postbuild: next-sitemap)
npm run lint         # ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Prettier (entire project)
npm run commit       # Commitizen interactive commit CLI
npm run hugo:serve   # Hugo blog dev server (in /blog dir)
```

There are no automated tests; quality is enforced via TypeScript strict mode and pre-commit hooks (Husky + lint-staged runs Prettier on staged files).

---

## API Routes

All routes are in `src/app/api/`:

| Route                         | Description                             |
| ----------------------------- | --------------------------------------- |
| `GET /api/repo`               | Repo JSON data (cached, circuit-broken) |
| `GET /api/repo/trending`      | Trending repos                          |
| `GET /api/visualify/generate` | SVG card generation                     |
| `GET /api/qrcode/generate`    | QR code generation                      |
| `GET /api/tools`              | Tools directory (from `tools.json`)     |
| `GET /api/healthz`            | Health check                            |
| `GET /api/readyz`             | Readiness probe                         |

---

## Key Architecture Patterns

### 1. GitHub API Client

`src/lib/utils.ts` exports two functions:

```typescript
export function newGithubClient(token: string); // Returns axios instance
export async function getRepoDetails(token: string, owner: string, repo: string);
```

`getRepoDetails` fetches `GET /repos/{owner}/{repo}` only. Additional data (contributors, watchers, languages) is fetched by individual card generators using `newGithubClient` directly with `process.env.GITHUB_TOKEN`.

### 2. Redis + Circuit Breaker

Redis cache wraps all external calls via two circuit breaker singletons from `src/lib/circuit-breaker.ts`:

```typescript
import {redisCircuit, supabaseCircuit} from "@/lib/circuit-breaker";

const cachedData = await redisCircuit.execute(() => redis.get(cacheKey));
```

Circuit breaker states: CLOSED → OPEN (after 5 failures) → HALF_OPEN (after 60s) → CLOSED (after 2 successes). Check state with `circuitBreaker.getStats()`.

Cache keys: `github:repo:${owner}/${repo}`. TTL: 3600s (1 hour).

### 3. Visualify SVG Card Generation

`/api/visualify/generate` uses an OOP factory pattern in `src/app/api/visualify/generate/themes/`:

- `base.ts` — Abstract `BaseCardGenerator` with `generateCard(repoDetails)` and `setConfig(params)`
- `classic.ts` — Concrete `ClassicCardGenerator` with `LightClassicCardGenerator` and `DarkClassicCardGenerator` subclasses
- `factory.ts` — `getCardGeneratorFactory(theme)` maps theme identifier strings to generator instances
- `utils.ts` — Shared helpers: `formatNumber`, `escapeXml`, `truncateText`

**Query params for `/api/visualify/generate`:**

- `owner`, `repo` (required)
- `theme`: `light-classic` | `dark-classic`
- `width`, `height`: Card dimensions in px (defaults: 400×200)
- `elements`: Comma-separated list to control visible stats — `contributors,issues,stars,forks,watchers,description,language` (all shown by default)

**Adding a new theme:** Create a class extending `ClassicCardGenerator` or `BaseCardGenerator`, set a static `themeIdentifier`, and register it in `factory.ts`.

The classic generator uses a two-pass layout engine: top-down for title/description, bottom-up for stats/language/strip anchored to card bottom.

### 4. Standard API Route Pattern

```typescript
// 1. Extract & validate params
const owner = searchParams.get("owner");
if (!owner || !repo) return NextResponse.json({error: "..."}, {status: 400});

// 2. Cache lookup (circuit-broken)
const cached = await redisCircuit.execute(() => redis.get(cacheKey));
if (cached) return NextResponse.json(cached);

// 3. Fetch from GitHub, cache result
const data = await getRepoDetails(token, owner, repo);
await redisCircuit.execute(() => redis.set(cacheKey, data, {ex: 3600}));

// 4. Return with headers
return new NextResponse(svg, {
  headers: {"Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600"},
});
```

For SVG endpoints, always use `escapeXml()` from `src/app/api/visualify/generate/themes/utils.ts` on all user-derived content (owner, repo, description).

### 5. Tools Directory

`tools.json` at the project root is the source of truth for all external tools. It also drives `next.config.ts` to dynamically build allowed iframe origins (`https://{tool.name}.{rootDomain}`).

---

## Environment Variables

```
KV_REST_API_URL          # Upstash Redis URL
KV_REST_API_TOKEN        # Upstash Redis token
NEXT_PUBLIC_ROOT_DOMAIN  # Root domain (e.g., ilovegithub.vercel.app)
GITHUB_TOKEN             # GitHub PAT for increased rate limits (used directly in card generators)
SUPABASE_URL             # Supabase project URL
SUPABASE_ANON_KEY        # Supabase anon key
```

---

## Deployment Notes

- **Platform**: Vercel (auto-deploy on push to master)
- **Blog**: Rewritten at `/blog/:path*` → `https://ilovegithub-blog.netlify.app/:path*`
- **Security headers**: `X-Frame-Options: DENY` and `Content-Security-Policy: frame-ancestors 'none'` applied globally
- **`@resvg/resvg-js`** is listed as a `serverExternalPackage` in `next.config.ts` (native binary)
- **Post-build**: `next-sitemap` runs automatically after `next build`
  verview`| Understanding high-level codebase structure |
|`refactor_tool` | Planning renames, finding dead code |

<!-- code-review-graph MCP tools -->

## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool                        | Use when                                               |
| --------------------------- | ------------------------------------------------------ |
| `detect_changes`            | Reviewing code changes — gives risk-scored analysis    |
| `get_review_context`        | Need source snippets for review — token-efficient      |
| `get_impact_radius`         | Understanding blast radius of a change                 |
| `get_affected_flows`        | Finding which execution paths are impacted             |
| `query_graph`               | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes`     | Finding functions/classes by name or keyword           |
| `get_architecture_overview` | Understanding high-level codebase structure            |
| `refactor_tool`             | Planning renames, finding dead code                    |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
