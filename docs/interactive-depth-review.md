# Interactive depth review — 2026-11-02

## Current conclusion

**PASS for the independently observed visual, interaction, responsive and reduced-motion checks below.** No remaining P1/P2 was observed within that scope. Actual background-tab suspension was **not verified**: opening a blank tab and reading the original through the Chrome automation channel still returned `document.hidden=false`. This is a coverage boundary, not evidence that suspension works or fails. Main-thread performance, deployment and live-site verification remain with the main agent.

This review applies to the new `ForestStage` and `PaperFlight` implementation. Earlier storybook/retro/courtyard approvals do not substitute for this round. It does not claim that the illustrated character is a volumetric mesh: the character is layered 2.5D artwork; the plane has CSS 3D faces and folding geometry; the retained sports scene uses WebGL.

- Preview: `http://127.0.0.1:4182/`.
- Final checked bundle: `index-CE0nCpGW.js`, `index-DD-4UzMV.css`.
- Browser: actual Google Chrome, review tab `1859664230`.
- Desktop: 1200 × 940 CSS px, DPR 2. Mobile viewport overrides: 390 × 844 and 320 × 568. Actual Chrome 200% zoom: 600 × 470 CSS px, DPR 4; the toolbar also reported 200%.
- The intermediate screenshots marked R1 precede only the later `touch-action` correction. The final R2/mobile and desktop checks used the corrected build.

## Acceptance and evidence

| Check | Actual observation | Result |
| --- | --- | --- |
| Character depth | Moving the actual pointer between left/right positions changed the head orientation visibly; body, clouds and foreground branch moved at different amplitudes. No visible neck/scarf break or old-head remnant appeared at the tested extremes. | PASS |
| Direct interaction | Clicking the visible character and pressing Enter on its focused button produced the jump/greeting and visible reply. The status announcement was present. | PASS |
| Paper plane | Click/keyboard interaction produced a complete roll. A capture during the roll shows the underside, central keel and separate folded faces, rather than a single image merely rotating in its plane. Scrolling changes its banking/position while OPD + RL and SOTA remain readable. | PASS |
| Mobile layout | At 390 and 320, identity and role stayed readable in document flow; the character did not cover those facts. The research title, SOTA and description remained readable around the plane, including its intermediate pose. No horizontal overflow was measured. | PASS |
| Mobile interaction surface | Wheel/page scrolling over the large character/plane surfaces continued to scroll the page. Both final buttons computed `touch-action: pan-y pinch-zoom`. This was a viewport test, not a physical touch-device or pinch-gesture test. | PASS for observed behavior; real pinch untested |
| Actual 200% zoom | Hero/identity and research content reflowed without horizontal overflow. The plane occupies a later part of the document instead of forcing facts into a cropped fixed screen. | PASS |
| Anchors | The first actual hero-to-research link click settled at research top 24 px. The first actual return-to-top click from contact settled at `scrollY=0`, hero top 0. | PASS |
| Offscreen | At contact, the forest reported `visible=false` and the plane `motion=paused`; returning to the hero restored the forest's active state. | PASS |
| Reduced motion | Chrome DevTools emulated the actual media preference; `matchMedia('(prefers-reduced-motion: reduce)').matches` was true. Character head/idle/breath/cloud wrappers and plane float/roll computed `transform:none`. Plane interaction was disabled. The character retains a non-motion greeting/status interaction. Restoring the preference returned `reduce=false`. | PASS |
| Background tab | A blank-tab attempt did not create an observable hidden state through this automation channel. | NOT VERIFIED |

## Resolved finding

The main agent's independent source review found that `touch-action: pan-y` on the two large interactive artworks prevented pinch zoom. Both were changed to `pan-y pinch-zoom`; the final Chrome computed values confirm the fix. No new visual layout change was introduced by that correction. This review did not execute a physical multi-touch gesture.

## Screenshot evidence

Paths are relative to the repository root:

- `outputs/visual-review/depth-final-desktop.png` — final clean desktop composition.
- `outputs/visual-review/depth-r1-left.png` and `depth-r1-right.png` — actual pointer extremes.
- `outputs/visual-review/depth-r1-greeting.png` — character action.
- `outputs/visual-review/depth-r1-roll-side.png` — plane underside/keel during the roll.
- `outputs/visual-review/depth-r1-plane-bank.png` — scroll-driven banking.
- `outputs/visual-review/depth-r2-390-plane.png` — final 390 research layout.
- `outputs/visual-review/depth-r2-320-plane.png` and `depth-r2-320-character.png` — final 320 layout.
- `outputs/visual-review/depth-r2-200-hero.png`, `depth-r2-200-research.png`, `depth-r2-200-plane.png` — actual 200% layout.

The reduced-motion screenshot captured the existing internship area after a responsive refresh, so it is not presented as visual evidence of the new modules. The reduced-motion conclusion above is based on the actual media preference and rendered DOM/computed styles, paired with the lifecycle source review; it is not a claim of a separate full static-page visual audit.

## Handoff and limits

Chrome was handed back to the main agent at the ordinary preview URL, default viewport (1200 × 940), 100% zoom, reduced-motion emulation removed and DevTools closed. Tab `1859664230` was marked for handoff. The review agent stopped UI operations before writing this document.

This round deliberately did not rerun the unchanged certificate/contact archive and full sports matrix, perform a GPU/FPS measurement, or infer low-end-device performance from screenshots. The main agent reported 14 existing tests passing; those were not independently rerun by this reviewer. The next acceptance evidence is the main agent's final performance and deployment check.
