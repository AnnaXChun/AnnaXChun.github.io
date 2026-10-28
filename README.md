# Chunxiang's portfolio

Live site: https://annaxchun.github.io/

The current GitHub Pages website lives in `pages-site/`. The front half is a
Retro-Futurist editorial portfolio: layered CRT portrait, pointer-driven 2.5D
head/gaze, a photographic reel and perspective files. GSAP drives bounded
transform/opacity motion; React owns content. The final Three.js badminton
scene retains the accepted models, photographic lighting and reversible
scroll choreography. `/profile.html` contains the same facts without JavaScript.

## Develop and verify

Use Node.js 24 LTS. The Pages app has its own lockfile and does not need the
legacy application's dependencies.

```bash
npm --prefix pages-site ci
npm run dev:pages
npm run build:pages
node --test pages-site/test/badminton.test.mjs pages-site/test/scene-runtime.test.mjs pages-site/test/story-motion.test.mjs
```

Build output: `dist-pages/`. Content source: `pages-site/src/data.js`.
Current visual standards: `docs/design-taste.md`. Independent Chrome evidence:
`docs/retro-futurist-review.md`. Older courtyard documents are historical.

The sports scene is lazy-loaded near its chapter. Render targets have a pixel
budget; offscreen/background work suspends. Intro and 2.5D effects use GSAP
ScrollTrigger/quickTo. Reduced motion preserves static content and imagery.
GSAP is distributed under its Standard No Charge license, not MIT.

For local production measurements, run
`node pages-site/scripts/prepare-benchmark.mjs <label>` after a build and serve
that ignored output directory. Its opt-in button records 19 seconds of forward
and reverse scroll. rAF/long-task metrics describe main-thread cadence, not
GPU presentation FPS. The measurement UI is never included in `dist-pages/`.

## Deploy

`.github/workflows/portfolio-pages.yml` uses GitHub's official, commit-pinned
checkout/setup-node/upload-pages-artifact/deploy-pages actions. Pull requests
build and run the retained sports/runtime checks. Merging an accepted version
to `main` builds and deploys that same artifact; deployment can also be started
with `workflow_dispatch`. Only the deploy job gets Pages/OIDC write permissions.

The repository Pages source is GitHub Actions. The old `gh-pages` branch stays
as a historical release snapshot, not the active delivery path. Confirm the
workflow deployment succeeds and inspect the public site in Chrome before
reporting a release complete. Do not force-push publishing branches.

## Legacy application reference

The original `app/`, root dependencies and supporting tools remain available
for reference. The following notes describe that earlier Vinext application.

### vinext-starter

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

This starter does not use `wrangler.jsonc`.

## Included Shape

- edit site code under `app/`
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm test`: build the starter and verify its rendered loading skeleton
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
