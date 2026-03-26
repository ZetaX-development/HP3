# Current Routing Structure

## Framework
**Astro v5.16.6**
(Note: The user request mentioned Next.js/Flask, but the project is built with Astro).

## URL Patterns

The site uses a combination of static routes (file-based) and dynamic routes (via `[...page].astro`).

### 1. Static Pages (`src/pages/*.astro`)
| URL | File | Status |
|---|---|---|
| `/` | `src/pages/index.astro` | Homepage (Japanese default) |
| `/careers` | `src/pages/careers.astro` | Static Page |
| `/team` | `src/pages/team.astro` | Static Page |
| `/business/ai-solution` | `src/pages/business/ai-solution.astro` | Sub-page |
| `/business/prc` | `src/pages/business/prc.astro` | Sub-page |
| `/examples/*` | `src/pages/examples/*.astro` | Various landing page examples |
| `/404` | `src/pages/404.astro` | Error Page |

### 2. Dynamic Pages (`src/pages/[...page].astro`)
These pages are generated from the `otherPages` content collection located in `src/data/otherPages`.

**Current mechanism:**
- The `[...page].astro` file explicitly filters for the default locale (`ja`) and removes the locale from the slug.
- Data Source: `src/data/otherPages/ja/`

| URL | Content Source |
|---|---|
| `/privacy-policy` | `src/data/otherPages/ja/privacy-policy` |
| `/terms` | `src/data/otherPages/ja/terms` |
| `/elements` | `src/data/otherPages/ja/elements` |

### 3. Blog Posts
**Status:** Data exists in `src/data/blog` but no dedicated route (`src/pages/blog/...`) was found in the top-level analysis. Currently, blog posts may not be accessible via a specific URL pattern or are handled on the homepage only.

## Current i18n Configuration (Hybrid/Incomplete)
- **Config:** `astro.config.mjs` defines `locales: ["en", "fr", "ja"]` with `defaultLocale: "ja"`. `prefixDefaultLocale: false` is set (matches requirements).
- **Data:** `src/data` (managed by Keystatic) has folders for `en`, `fr`, `ja`.
- **Logic:** `[...page].astro` manually enforces loading only the default locale, effectively disabling i18n for dynamic pages currently.
