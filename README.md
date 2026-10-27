# Chunxiang's portfolio

Live site: https://annaxchun.github.io/

The current GitHub Pages website lives in `pages-site/`. React owns the page;
GSAP ScrollTrigger drives a continuous personal story through a real Three.js
Minnan courtyard and a photographic badminton scene. Cannon-es simulates
maple leaves resting on the solid title strokes. The palette is cool white,
ice blue and blue-black. A complete static profile is available at `/profile.html`.

## Develop and build the current website

Use Node.js 22.12+ or a newer supported LTS release. The Pages site has its own
lockfile; it does not require installing the legacy app's dependencies.

```bash
npm --prefix pages-site ci
npm run dev:pages
npm run build:pages
npm run preview:pages
```

The build output is `dist-pages/`, including `.nojekyll`. Personal content is in
`pages-site/src/data.js`; the illustrated portrait and supporting images are in
`pages-site/public/assets/`.

Animation references and license distinctions are recorded in
`docs/open-source-motion-performance.md`. Scroll does not update a video
player or rerender the story through React. Glyph geometry is built in a
worker and cached; scene render targets are bounded, stay warm between
chapters, and shrink when offscreen or hidden.

For a local production benchmark, run `node pages-site/scripts/prepare-benchmark.mjs <label>`
after building, serve `outputs/performance/<label>/`, then use the visible
benchmark button in Chrome. The 19-second forward/reverse scroll records rAF
cadence and long tasks. It is not a GPU frame-rate measurement. The probe is
injected only into that disposable copy, never `dist-pages/`.

## Publish to GitHub Pages

Pages serves the root of the `gh-pages` branch. Pushing `main` alone does not
publish a new version. After committing source changes on `main`, build and
update a separate clean checkout of the publishing branch:

```bash
npm run build:pages
git push origin main
git fetch origin gh-pages
git worktree add --detach ../chunxiang-pages-publish origin/gh-pages
rsync -a --delete --exclude=.git dist-pages/ ../chunxiang-pages-publish/
git -C ../chunxiang-pages-publish add -A
git -C ../chunxiang-pages-publish commit -m "deploy: update portfolio"
git -C ../chunxiang-pages-publish push origin HEAD:gh-pages
git worktree remove ../chunxiang-pages-publish
```

Use a new checkout path if that directory already exists. Push without force;
if someone publishes concurrently, fetch the new head and rebuild the release
on top of it. Confirm the Pages deployment succeeds before announcing it live.

The current design was synchronized from Sites source commit
`30b6c43fc057835db268dbbbe75e760f23e30030`.

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
