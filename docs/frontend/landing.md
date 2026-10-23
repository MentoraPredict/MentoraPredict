# apps/landing

Public marketing/landing page (hero, features, stats, downloads, footer) shown at the root domain. Separate from the authenticated React SPA — no auth, no dashboards. See [README.md](./README.md) for how it fits alongside the other client apps.

## Tech Stack

| Concern | Library | Version |
|---|---|---|
| Framework | Astro | 5.7 |
| Styling | tailwindcss (`@tailwindcss/vite`) | 4 |
| CMS | contentful | 11.12.6 |
| Image processing | sharp | — |

## Purpose

Astro-rendered static/server page pulling some content (copy, labels) from Contentful. It does **not** trust Contentful's `availability`/`downloadUrl` fields for the downloads section: an inline client script fetches the same live `/downloads/*.json` manifests that `apps/web` uses and patches the DOM at runtime. This keeps a stale Astro static build reflecting the live CD pipeline state even if the CMS content is out of date.

## Structure

| Path | Contents |
|---|---|
| `src/components/` | `.astro` files: DownloadSection, FeaturesSection, Footer, HeroSection, Navbar, StatsSection |
| `src/config/` | `downloads.ts`, `site.ts` |
| `src/layouts/` | `BaseLayout.astro` |
| `src/lib/` | `contentful.ts`, `queries.ts` |
| `src/pages/` | `index.astro` |
| `src/styles/` | `global.css` |

## Build

Multi-stage `Dockerfile` (`node:22-alpine` → `nginx:alpine`), taking `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, `CONTENTFUL_ENVIRONMENT`, and `PUBLIC_WEB_APP_URL` as Docker build args. See [../deployment/ci-cd-pipeline.md](../deployment/ci-cd-pipeline.md).

## Visual consistency note

This app deliberately mirrors `apps/web`'s actual Tailwind color palette (default `blue-*`/`gray-*`) rather than its own custom `primary-*`/`neutral-*` theme tokens. This follows a visual-drift audit that found the two didn't match — worth noting since a reader might otherwise expect the custom tokens to be in active use.
