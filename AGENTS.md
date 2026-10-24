# Personal portfolio

- The published GitHub Pages app is `pages-site/`. The root `app/` is a legacy site; do not edit it when fixing the current portfolio.
- Before UI changes, read `docs/design-taste.md`. It records the user's confirmed design priorities, sizing baseline, references, and verification requirements.
- Prioritize the person and real work: large legible typography, prominent evidence, genuine 3D Minnan architecture with ink-wash materials on warm paper. The user explicitly rejected a 2D painting with pan/zoom. Use physical camera dolly, gate entry, orbit and crane transitions; keep reduced-motion views still. Do not add unrelated product features or reading-mode controls. The top banner is removed.
- Lead with OPD + RL and the user-confirmed open-benchmark SOTA experience, then the ByteDance international commercialization Agent internship (2026.09.20–present; Claude Code core integration, business workflows, Skill optimization and Bad Case Studio). The user wants a concise presentation without benchmark specifics; do not invent names or scores or keep asking for them.
- Validate appearance in **Google Chrome**, at normal desktop proportions and phone widths. An in-app sidebar preview is not sufficient evidence of proportions.
- Run `npm run build:pages` for the published app. For architecture/camera changes, run `node --test pages-site/test/minnan-model.test.mjs` to verify model integrity and a collision-free passage through the gate. Preserve user-provided originals and unrelated local files.
