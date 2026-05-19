---
title: "How to Create Custom Shields.io Badges: Static & Dynamic"
slug: custom-shields-io-badges-guide
description: "Learn to create custom Shields.io badges for GitHub READMEs, blogs, and portfolios. Covers static badges, styles, logos, and live dynamic badges — with real examples."
excerpt: "A practical guide to creating eye-catching Shields.io badges — static, styled, and dynamic — for GitHub READMEs, portfolios, and developer blogs."
author: Subhomoy Roy Choudhury
category: Web Development
created: 2026-05-01
tags: Shields.io, GitHub README, GitHub Badges, Markdown, Badge Generator, Developer Tools, README Design, Dynamic Badges, Open Source
coverImage: /blog/custom-shields-io-badges-guide/cover-image-1.png
draft: false
readTimeMinutes: 15
---

# How to Create Custom Shields.io Badges: Static & Dynamic

Want your GitHub README or portfolio to stand out instantly? **Shields.io badges** are compact, visual indicators that communicate status, version, license, build health, and much more — in a single line of Markdown.

In this guide, you'll learn to create beautiful static badges, customize them with logos and styles, and build **dynamic badges powered by real-time data** from live endpoints.

---

## What is Shields.io?

[Shields.io](https://shields.io) is a free, open-source badge generation service used by millions of GitHub repositories. It generates SVG and PNG badges on the fly from a simple URL format — no account or API key required.

Badges are widely used on GitHub READMEs to communicate:

- Build and CI/CD status
- npm, PyPI, or package version
- License type
- Code coverage percentage
- GitHub stars, forks, or contributors

---

## Why Use Shields.io Badges?

Badges do more than decorate — they make information scannable at a glance:

- **Professionalism**: Projects with clear status indicators look maintained and well-organized
- **Transparency**: Instantly show build health, test coverage, or dependency status
- **Discoverability**: Metrics like stars and forks signal project popularity
- **Customization**: Match badge style and color to your project's brand

---

## 1. Create a Simple Static Badge

The easiest way to start is by constructing a badge URL manually.

### Basic Format

```
https://img.shields.io/badge/<LABEL>-<MESSAGE>-<COLOR>
```

### Tips

- Replace spaces with `_` or `%20`
- Use named colors (`blue`, `green`, `brightgreen`, `red`, `yellow`, `orange`, `lightgrey`) or hex codes (e.g. `ff69b4`)
- Separate label and message with `-`; use `--` for a literal hyphen in the text

### Example

```
https://img.shields.io/badge/status-active-brightgreen
```

Embed in Markdown:

```markdown
![Status](https://img.shields.io/badge/status-active-brightgreen)
```

---

## 2. Add Logos & Custom Styles

Make your badges more eye-catching with styles and icons.

### Add a Logo

Append `?logo=<name>` to any badge URL. Logo names come from [Simple Icons](https://simpleicons.org/).

```
https://img.shields.io/badge/code-JavaScript-yellow?logo=javascript
```

### Choose a Style

| Style           | Appearance                             |
| --------------- | -------------------------------------- |
| `flat`          | Flat design, subtle gradient (default) |
| `flat-square`   | Flat with sharp corners                |
| `plastic`       | 3D rounded look                        |
| `for-the-badge` | Bold, uppercase — ideal for portfolios |
| `social`        | Rounded, social media feel             |

### Example with Styling

```
https://img.shields.io/badge/code-JavaScript-yellow?logo=javascript&style=for-the-badge
```

### Customize Logo Color

Override the logo fill color with `logoColor`:

```
https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white&style=flat
```

---

## 3. Create Dynamic Badges

Dynamic badges pull live data and update automatically — no manual edits needed.

### From a JSON Endpoint

If you have an API that returns JSON, you can display any field as a badge:

```
https://img.shields.io/badge/dynamic/json?url=<API_URL>&query=<JSON_PATH>&label=<LABEL>&color=blue
```

**Key parameters:**

| Parameter           | Description                                        |
| ------------------- | -------------------------------------------------- |
| `url`               | Your API endpoint                                  |
| `query`             | JSONPath expression to the target value            |
| `label`             | Left-side badge text                               |
| `prefix` / `suffix` | Wrap the value (e.g. `suffix=ms` for milliseconds) |
| `color`             | Badge background color                             |

Example — display the latest React version from npm:

```
https://img.shields.io/npm/v/react?label=react&color=blue&style=flat-square
```

### GitHub Actions Workflow Status

Show your CI build status directly from a GitHub Actions workflow:

```
https://img.shields.io/github/actions/workflow/status/<OWNER>/<REPO>/<WORKFLOW_FILE>
```

Example:

```markdown
![CI](https://img.shields.io/github/actions/workflow/status/facebook/react/build_and_test.yml)
```

### Other Pre-built Live Sources

Shields.io has built-in integrations for dozens of platforms:

- **npm** — version, weekly downloads, bundle size
- **GitHub** — stars, forks, open issues, last commit date
- **Docker Hub** — image pulls, image size
- **Codecov** — test coverage percentage
- **PyPI** — version, Python versions supported

Browse the full catalog at [shields.io/badges](https://shields.io/badges).

---

## 4. Badge Caching & Refresh

Shields.io caches badge responses for **5 minutes** by default. If a badge shows stale data after a release, override the TTL with `cacheSeconds`:

```
https://img.shields.io/github/v/release/owner/repo?cacheSeconds=60
```

The minimum is 60 seconds. For badges where freshness matters (CI status, version), set a low value.

---

## 5. How to Embed Badges

### Markdown

```markdown
![Badge](https://img.shields.io/badge/demo-live-blue)
```

### Clickable Badge

```markdown
[![Visit Site](https://img.shields.io/badge/website-live-green)](https://example.com)
```

### HTML

```html
<img src="https://img.shields.io/badge/demo-live-blue" alt="Demo live badge" />
```

### Aligning Multiple Badges

Place badges on consecutive lines or separate with a blank line for wrapping:

```markdown
![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/github/license/owner/repo)
![Stars](https://img.shields.io/github/stars/owner/repo?style=social)
```

---

## Common Mistakes to Avoid

- **Spaces in URL**: Use `_` instead of bare spaces — they break the URL
- **Wrong logo name**: Check the exact slug at [simpleicons.org](https://simpleicons.org) — `javascript` works, `JS` does not
- **Too many badges**: More than 6–8 badges clutters the README; group related ones or use a table layout
- **Stale CI badge**: If the GitHub Actions badge never updates, verify your workflow file name matches the URL exactly (including `.yml` vs `.yaml`)

---

## Pro Tips for Better Badges

- **Consistency**: Pick one style (`for-the-badge` or `flat`) and use it across all badges in a project
- **Color convention**: `brightgreen` for passing/active, `red` for failing, `yellow` for warnings — follow the conventions readers recognize
- **Portfolio READMEs**: `for-the-badge` + `logoColor=white` creates a polished tech-stack section
- **Dark mode GitHub**: Use `logoColor=white` on dark-background badges so icons remain visible
- **Badge grouping**: Separate operational badges (CI, coverage) from informational ones (version, license) with a blank line

---

## Final Thoughts

Custom Shields.io badges are a small addition with a big impact. Whether you're showcasing your GitHub projects or enhancing your developer portfolio, badges help communicate value at a glance.

Start with a simple static badge, experiment with styles, then graduate to dynamic endpoint badges that always reflect your project's current state.

---

Want to take your GitHub profile further? Check out [iLoveGithub](https://ilovegithub.vercel.app) for more tools and visualizations built around GitHub — including SVG repo cards you can embed anywhere.
