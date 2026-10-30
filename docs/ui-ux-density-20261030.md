# UI/UX follow-up checklist · 2026-10-30

Scope: German and English Lookup and Learn views, including 360/390 px mobile layouts. No species, taxonomy, attribution or learning-data format changes.

## Review suggestions

- [x] Put learning target, name languages, answer method and question count before optional species filters.
- [x] Collapse Lookup group/level filters; keep selected filter chips and the count visible when collapsed.
- [x] Place Lookup reset beside the result count rather than on a separate row.
- [x] Split the lesson summary into readable lines; omit unrestricted/default values while retaining active restrictions.
- [x] Collapse new-session preparation when a paused session exists; show its blocking explanation once and preserve single-session behavior.
- [x] Remove the duplicate setup heading, simplify the name-language frame and eliminate reserved two-line label space.
- [x] Hide dependent regional fields when no country is selected.
- [x] Move detailed regional methodology/count explanations into a disclosure; retain unavailable/stale warnings visibly.
- [x] Use “Lernstufe / Vocabulary level” consistently for the level controls.
- [x] Label the learning-progress filter “Nach Lernstand filtern / Progress filter”.
- [x] Use “Texteingabe / Text input” alongside Flashcards and Multiple Choice.
- [x] Label the regional list selector “Artennachweise / Species records”.
- [x] Name the parent explicitly in whole-region choices and remove stacked country parentheses.
- [x] Retain all supported names, image credits, visible UI-language/theme choices and large answer buttons; slightly tighten name-card spacing.

## Verification

- Passed all 11 Node test scripts, 8 Python region tests, JavaScript syntax and whitespace checks.
- Browser checks passed in DE/EN at 360/390 px and desktop at 1280 px, in both light and dark appearances; no horizontal page overflow.
- Lookup: searching, group/level chips while collapsed, counts, removing/resetting filters, focus returning to the disclosure, reload persistence, multilingual names and local images.
- Learn: country/parent/local hierarchy, recent/all periods, code-only language dependency, invalid same-language pair, empty level/group selections, group search, actual question count and summary labels.
- Text answer, flashcard reveal and code multiple-choice sessions start correctly. Paused new-session preparation stays blocked; one explanatory hint, resume retains the answer draft even after UI-language and preparation changes; grading and finishing preserve progress.
- No browser console warnings or errors observed.

Release gate: GitHub Pages workflow must succeed for the release commit, followed by checking the deployed layout/version. Mobile coverage uses browser viewport simulation, not a physical phone.

## Follow-up: explicit text-field clearing

- Added a shared visible clear control to species search, group search and typed quiz answers, independent of the native search cancel button.
- The 44 × 44 px button is available only for a nonempty, editable input, has DE/EN accessible labels, never submits the form, emits the existing input event and returns focus to the input. Native WebKit search cancel buttons are hidden to avoid duplicates.
- Verified search results reset to 313, the global reset also hides the button, clearing group search restores all 60 groups, keyboard activation works, and clearing an answer neither grades it nor restores the old draft after pause/reload/resume. Mobile browser checks passed; no physical iOS 26 device was available.
- All 11 Node test scripts, syntax and whitespace checks passed.

## Follow-up: compact answer feedback

- Grouped feedback into result/own answer, accepted names, and reference details. Reduced spacing within these groups while preserving separation between them.
- Code and scientific name share a wrapping reference row. Alternative codes, German names/sources, eBird links, photos/credits and review schedule remain available.
- Kept question/name text sizes and the fixed Next button; reduced repeated paragraph margins and feedback padding.
- Browser checks passed for the screenshot's Eurasian Wren case, correct/incorrect text answers, flashcard grading, code answers without pictures, DE/EN switching, feedback pause/reload/resume, and widths 360/390/1280 px. No horizontal overflow or console warnings/errors observed.
- Study translation and state regression tests, JS syntax and whitespace checks passed.
