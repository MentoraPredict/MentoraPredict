# JAMstack Landing Page

MentoraPredict has a dedicated public landing application in `apps/landing`. It uses Astro and JAMstack principles to generate a fast static site, independently from the authenticated React application in `apps/web`.

## Technologies

| Technology | Purpose |
| --- | --- |
| Astro 5 | Builds the landing page as static HTML |
| Contentful | Headless CMS for marketing content |
| Tailwind CSS 4 | Utility-based styling compiled by Vite |
| TypeScript | Types CMS data, configuration, and component props |
| Sharp | Build-time image processing support |
| Nginx | Serves generated static files with compression and caching |
| Docker | Produces a reproducible build and lightweight runtime image |
| Kong | Exposes the landing service through `/landing` |

## Why it is JAMstack

The landing follows the JAMstack model:

- **JavaScript:** Astro and Contentful's SDK execute during the build.
- **APIs:** Content is retrieved from Contentful's delivery API.
- **Markup:** Astro pre-renders the page into static HTML.

```text
Contentful + local fallback content
              ↓ build time
        Astro static build
              ↓
        HTML, CSS, images
              ↓ runtime
        Nginx -> Kong -> user
```

There is no application server or Contentful request when a visitor opens the page. Contentful credentials remain in the build environment and are not shipped to the browser. A small client script separately requests optional download manifests; it does not contact the CMS.

## Architecture

`src/pages/index.astro` loads hero, statistics, and feature content concurrently. It composes Astro components through `BaseLayout`:

```text
index.astro
├── Navbar
├── HeroSection
├── StatsSection
├── FeaturesSection
├── DownloadSection
└── Footer
```

`src/lib/contentful.ts` creates the CMS client only when both `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` exist. `src/lib/queries.ts` maps Contentful entries into typed view models.

Every query has embedded fallback content. Missing credentials, empty collections, or Contentful errors therefore do not fail the build; the site is generated with local defaults.

## Project structure

```text
apps/landing/
├── public/                 Static images copied without transformation
├── src/
│   ├── components/         Astro page sections
│   ├── config/             Site and download configuration
│   ├── layouts/            Shared HTML shell and metadata
│   ├── lib/                Contentful client, queries, and DTO mapping
│   ├── pages/              File-based routes
│   └── styles/             Global Tailwind styles
├── .env.example            CMS and web-application variables
├── astro.config.mjs        Static output and `/landing` base path
├── Dockerfile              Multi-stage build and Nginx runtime
├── nginx.conf              Routing, caching, compression, and health check
└── package.json
```

## Content model

The current queries expect these Contentful content types:

| Content type | Main fields |
| --- | --- |
| `hero` | Badge, headline, text, calls to action, and image |
| `stat` | Value, label, and order |
| `feature` | Title, description, icon, and order |
| `downloadOption` | Platform, label, URL, availability, and order |

The hero, statistics, and features are currently loaded by `index.astro`. `getDownloadOptions()` and `src/config/downloads.ts` exist but are not connected to the page.

`DownloadSection.astro` renders local placeholders and then requests `/downloads/desktop.json` and `/downloads/mobile.json` in the browser. When a manifest exists, it can publish a download URL, build URL, environment, and update time without rebuilding the Astro HTML. Failed or missing manifest requests preserve the unavailable state.

Because content is fetched at build time, publishing in Contentful does not update the deployed page automatically. A new landing image must be built and deployed unless a CMS webhook is later connected to the delivery pipeline.

## Environments

```env
CONTENTFUL_SPACE_ID=
CONTENTFUL_ACCESS_TOKEN=
CONTENTFUL_ENVIRONMENT=master
PUBLIC_WEB_APP_URL=http://localhost:5173
```

- `CONTENTFUL_*` configures build-time content retrieval.
- `PUBLIC_WEB_APP_URL` provides the destination for links into the React web application.
- Variables without the `PUBLIC_` prefix are server/build-only in Astro.

## Routing and deployment

Astro generates static output with `base: "/landing"`. The Docker build copies `dist` into Nginx, which:

- redirects `/landing` to `/landing/`;
- serves the generated site below `/landing/`;
- enables gzip compression;
- caches versioned assets for one year;
- exposes `/health` for container checks.

Kong routes `/landing` to the `landing` container. In local Docker development, the container is also exposed through port `4321` by default.

## Commands

Run from the repository root in Git Bash:

```bash
# Development server
pnpm --filter @mentorapredict/landing dev

# Static production build
pnpm --filter @mentorapredict/landing build

# Preview the generated output
pnpm --filter @mentorapredict/landing preview
```

With Docker Compose:

```bash
docker compose -p mentorapredict --env-file infra/.env \
  -f infra/docker/docker-compose.dev.yml build landing

docker compose -p mentorapredict --env-file infra/.env \
  -f infra/docker/docker-compose.dev.yml up -d landing
```

## Relationship with apps/web

The repository currently contains two public landing implementations:

- `apps/landing`: Astro JAMstack site served at `/landing`.
- `apps/web`: React `LandingPage` served at the web application's `/` route.

They do not share components or content automatically. The Astro site is the dedicated static marketing application, while `apps/web` owns authentication and role dashboards. Changes to one landing implementation must be intentionally mirrored or one implementation should eventually become the single public entry point.

## Current limitations

- Content updates require a rebuild and deployment.
- Download links remain placeholders until deployment provides valid manifest JSON files.
- The queried Contentful download options are not rendered.
- There is no automated CMS preview or webhook deployment flow in the repository.
- Marketing content has local fallbacks, so CMS failures can remain invisible without build monitoring.

See also [Web Architecture](./frontend/web.md), [Desktop Project Structure](./DESKTOP_STRUCTURE.md), and [Mobile Project Structure](./MOBILE_STRUCTURE.md).
