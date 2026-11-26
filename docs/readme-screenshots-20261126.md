# README screenshots · 26 November 2026

Captured the application from the canonical checkout at commit `763e25d` (the
application files match `0058ab6`). All seven images use a **430 × 932 CSS pixel**
browser viewport, the German interface and the light theme. They are unedited
JPEG viewport screenshots, without cropping, stitching or injected page state.

The local preview used its own browser origin and storage. No production-site
progress was read or modified. The screenshots were prepared through the visible
interface: saving Blaumeise, starting the daily round, reading all three
introductions, revealing choices and answering all three questions correctly.

## Capture states

| Image | Visible state |
| --- | --- |
| [Lookup](screenshots/mobile-lookup.jpg) | Expanded Blaumeise result, scrolled to multilingual names, eBird/DDA codes, their legend and the collapsed copy section; captured before saving the species |
| [Daily learning](screenshots/mobile-daily-learning.jpg) | Three new English names available, Germany/autumn, frequent and medium groups, 145 matching species and collapsed learning settings |
| [Practice](screenshots/mobile-practice.jpg) | First Eichelhäher question, Deutsch → Englisch, Think first with four choices revealed, zero of three questions answered |
| [Feedback](screenshots/mobile-feedback.jpg) | Correct Eurasian Jay answer with *Garrulus glandarius*, eBird/DDA codes, collision disclosure, photo credit, folded explanations and Next; the whole card fits without scrolling |
| [Progress](screenshots/mobile-progress.jpg) | After the completed Eichelhäher, Tannenmeise and Kampfläufer round: three species started, zero secure names, no due reviews, and the example's next-review time on 27 November |
| [Saved species](screenshots/mobile-saved-species.jpg) | One saved Blaumeise and the German-to-English Think first controls for a saved-species round |
| [Copy names](screenshots/mobile-copy-names.jpg) | Amsel found via *Turdus merula*, scrolled to all seven copy lines, German alternative Schwarzdrossel, separate British/US names and the successful “Namen kopiert.” status |

The feedback photo is [*Garrulus glandarius* by I, Luc Viatour](https://commons.wikimedia.org/wiki/File:Garrulus_glandarius_1_Luc_Viatour.jpg),
[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The screenshot
retains its visible author, source and licence links; the README repeats the credit.
No other bird photographs appear in the seven captures.

The six previous files are preserved byte-for-byte under `screenshots/20261120/`.
The [20 November report](documentation-review-20261120.md) now links those archived
images and retains their photo credits. The README gallery, alt text, example
species, source credit and developer-guide capture link refer to the new images.

## Verification and limits

Every capture was visually inspected. The daily-learning and copy views measured
430 px document width at the 430 px viewport. The capture session recorded no
JavaScript console errors. The name-copy control showed its success message.
The temporary viewport override was reset, the preview tab was closed and the
local server was stopped after capture.

File checks passed for all seven JPEG dimensions, changed bytes for the six
refreshed images, exact preservation of the archived originals, and all 147 local
file references across 30 Markdown documents. Passed `npm test` and
`scripts/test-lookup-settings.mjs`, `scripts/test-answer-feedback.mjs`,
`scripts/test-progress-copy.mjs` and `scripts/test-usability.mjs`.
Personal-path and Git whitespace checks also passed. Application and data files
in `dist/` and `data/` are unchanged.

These are desktop-browser mobile viewport captures. This pass does not repeat
dark-mode, keyboard, physical-device, screenreader, backup-import or multi-viewport
audits. The next-review timestamp and the 145-species selection belong to this
local example; current reports and the capture time can change those values.
