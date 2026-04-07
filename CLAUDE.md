# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**iLoveGithub** is a curated collection of magical tools and visualizations built around GitHub. Key features:

- Repository analytics and visualization
- AI-powered repo summaries
- Dynamic SVG card generation for repos (for README embeds, etc.)
- QR code generation
- Integration with 100+ external GitHub tools

**Version**: 0.24.0 | **Deployment**: Vercel

---

## Tech Stack

- **Framework**: Next.js 16+ (App Router, React 19)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4, Radix UI components
- **Database/Cache**: Upstash Redis (KV storage)
- **Authentication**: Supabase
- **API Client**: Axios
- **SVG Generation**: Satori (for image generation), custom SVG templating

---

## Project Structure

```
src/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── repo/              # Repository data & visualization endpoints
│   │   │   ├── route.ts       # Get repo details (JSON)
│   │   │   └── trending/      # Trending repos endpoint
│   │   ├── visualify/         # Repo visualization
│   │   ├── qrcode/            # QR code generation
│   │   ├── tools/             # Tools directory endpoint
│   │   ├── healthz/           # Health check
│   │   └── readyz/            # Readiness probe
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── helper.ts              # Helper utilities
├── lib/
│   ├── utils.ts               # GitHub API client (getRepoDetails), URL parsing
│   ├── redis.ts               # Upstash Redis setup & health checks
│   ├── circuit-breaker.ts     # Circuit breaker for resilience
│   ├── supabase.ts            # Auth & database
│   ├── email.ts               # Email service
│   ├── mailer.ts              # Nodemailer config
│   ├── health-monitor.ts      # Service health monitoring
│   ├── types.ts               # TypeScript types
│   └── version.ts             # Version info
├── services/
│   ├── github.ts              # GitHub service layer
│   ├── tools.ts               # Tools service
│   └── qrcode.ts              # QR code service
├── components/
│   ├── ui/                    # Radix UI components (reusable)
│   └── emails/                # Email templates
├── constants.ts               # App-wide constants
├── instrumentation.ts         # Monitoring/observability
└── proxy.ts                   # Proxy configuration
```

---

## Common Development Commands

### Development

```bash
npm run dev                    # Start dev server with Turbopack (http://localhost:3000)
```

### Building & Production

```bash
npm run build                  # Build for production
npm start                      # Start production server
npm run export                 # Export static site
```

### Linting & Formatting

```bash
npm run lint                   # Run ESLint
npm run lint:fix              # Fix ESLint errors automatically
npm run format                # Format code with Prettier (entire project)
```

### Git & Releases

```bash
npm run commit                # Commitizen CLI for structured commits
```

### Blog

```bash
npm run hugo:build            # Build Hugo blog (in /blog directory)
npm run hugo:serve            # Serve Hugo blog locally
```

---

## Key Architecture Patterns

### 1. **GitHub API Integration with Circuit Breaker**

All GitHub API calls go through `getRepoDetails()` in `src/lib/utils.ts`:

```typescript
export async function getRepoDetails(token: string, owner: string, repo: string);
```

Uses Axios with GitHub's REST API v3. The circuit breaker pattern (`src/lib/circuit-breaker.ts`) protects against cascading failures:

- **CLOSED**: Normal operation
- **OPEN**: Stops requests after 5 failures (60s timeout before retry)
- **HALF_OPEN**: Test recovery with 2 consecutive successes before closing

Error handling example from API routes:

```typescript
const cacheKey = `github:repo:${owner}/${repo}`;
const cachedDataStr = await redisCircuit.execute(async () => await redis.get(cacheKey));
```

### 2. **Caching Strategy**

All repo data is cached in Redis with 1-hour TTL:

```typescript
await redis.set(cacheKey, repoDetails, {ex: 3600}); // 3600 seconds = 1 hour
```

Cache keys follow pattern: `github:repo:${owner}/${repo}`

### 3. **SVG Card Generation (Dynamic)**

Two main endpoints for dynamic SVG generation:

- **`/api/repo/card`** (1000x480px) - Full detailed card with stats & progress bar
- **`/api/repo/simple-card`** (900x300px) - Compact version

Query parameters:

- `owner`: GitHub owner
- `repo`: Repository name
- `theme` (optional): `minimal`, `gradient`, `geometric`, `waves`, `dark`, `colorful`

Example:

```
GET /api/repo/card?owner=torvalds&repo=linux&theme=dark
```

Features:

- Dynamic data from GitHub API
- Theme-based styling with background patterns
- Number formatting (k/M suffix)
- Safe HTML escaping for user input
- Responsive icon designs
- Language/progress bar visualization

### 4. **Error Handling**

Standard pattern for API routes:

```typescript
if (!owner || !repo) {
  return NextResponse.json({error: "Missing 'owner' or 'repo'"}, {status: 400});
}

try {
  // ...fetch & process
  return new NextResponse(svg, {
    headers: {"Content-Type": "image/svg+xml"},
  });
} catch (error) {
  console.error("Error:", error);
  return NextResponse.json({error: "..."}, {status: 500});
}
```

### 5. **Environment Variables**

Required env vars:

```
KV_REST_API_URL          # Upstash Redis URL
KV_REST_API_TOKEN        # Upstash Redis token
NEXT_PUBLIC_ROOT_DOMAIN  # Root domain (e.g., ilovegithub.vercel.app)
GITHUB_TOKEN (optional)  # For increased rate limits
SUPABASE_URL            # Supabase project URL
SUPABASE_ANON_KEY       # Supabase anon key
```

---

## Important Conventions

### API Route Pattern

All API routes follow this pattern:

1. Extract query params from `searchParams`
2. Validate required params with early returns
3. Check circuit breaker + Redis cache
4. Fallback to GitHub API if cache miss
5. Cache result with TTL
6. Return response with appropriate headers

### SVG Generation

- Always escape user input with `escapeHtml()`
- Use template literals with `${variable}` for dynamic content
- Define styles in `<defs><style>` for reusability
- Return with `Content-Type: image/svg+xml` header
- Cache SVG responses with 1-hour max-age

### Code Organization

- `lib/` = Core utilities & services (auth, DB, utils)
- `services/` = Business logic layer
- `components/` = React UI components
- `app/api/` = API routes (one file = one endpoint)
- `app/` = Pages & layouts

---

## Testing & Quality Checks

**Pre-commit hooks** (Husky):

- Runs `prettier` on staged files
- Enforced via `lint-staged`

**Structured commits** (Commitizen):

```bash
npm run commit  # Opens interactive commit CLI
```

**Type safety**:

- Strict TypeScript mode enabled
- No `any` types allowed
- Path aliases configured: `@/*` → `./src/*`

---

## Deployment

- **Platform**: Vercel (automatic CI/CD on push to main)
- **Analytics**: Vercel Analytics & Speed Insights
- **Blob Storage**: Vercel Blob for images
- **Post-build**: Automatic sitemap generation (`next-sitemap`)

---

## Performance Optimization

1. **Caching**: All GitHub API responses cached 1 hour
2. **Circuit Breaker**: Prevents thundering herd on external API failures
3. **Redis**: KV store for fast cache lookups
4. **Turbopack**: Used in dev mode for fast builds
5. **Next.js 16**: Latest optimizations, React 19

---

## Common Tasks

### Adding a new SVG card endpoint

1. Create file: `src/app/api/repo/[cardname]/route.ts`
2. Fetch repo data via `getRepoDetails()`
3. Implement `generateCard()` function
4. Return SVG with theme support
5. Add caching with 1-hour TTL

### Debugging

- Check circuit breaker state: `circuitBreaker.getStats()`
- Verify Redis connection: Check `KV_REST_API_URL` env var
- Logs available in Vercel dashboard

### Adding GitHub API fields

Edit `src/lib/utils.ts` `getRepoDetails()` function or extend the Promise.all() calls to fetch additional endpoints.

---

## Useful References

- [Next.js Docs](https://nextjs.org/docs)
- [GitHub API v3](https://docs.github.com/en/rest)
- [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)
- [Radix UI](https://radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
