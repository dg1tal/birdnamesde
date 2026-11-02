# UI/UX follow-up checklist · 2026-10-30

This is a dated change log; later entries supersede earlier setup layouts and labels. See [README](../README.md) for current behavior. UI labels are quoted from the English interface.

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
- [x] Use “Vocabulary level” (subsequently replaced by “Species packages” in Learn and removed from Lookup) consistently for the level controls.
- [x] Label the learning-progress filter “Progress filter”.
- [x] Use “Text input” alongside Flashcards and Multiple Choice.
- [x] Label the regional list selector “Species records”.
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

## Follow-up: hide the header during active study · 2026-11-01

- Removed the CSS override that kept the logo and UI-language/theme controls visible in study mode. They are hidden for both questions and feedback, with no replacement settings button.
- Pausing and finishing restore the normal header. Language/theme settings remain available while paused; resuming retains the current question, draft or graded feedback.
- Browser checks passed at 360/390/1280 px, in DE/EN and light/dark appearances. The Common Crane photo fits fully above the fixed Next bar at 360 × 800 px. Verified pause → change language/theme → resume and completion → visible header. No horizontal overflow or browser errors observed.

## Follow-up: adaptive feedback pictures · 2026-11-01

- Size feedback images and loading placeholders from the document position of the first photo row, visual viewport and actual fixed action-bar position, with 12 px clearance where possible.
- Clamp image height to 220–360 CSS px: long feedback scrolls instead of shrinking pictures into thumbnails. Preserve the full image with `object-fit: contain`; names, captions and source credits remain available.
- At mobile widths up to 580 px, comparison pictures stack at full width so individual birds remain identifiable. Desktop comparison pictures share a height that fits the lowest image start in the first row. Enlarged dialogs and Lookup images retain their own sizing.
- Recalculate after viewport/keyboard changes, feedback layout changes and expanded sources, without changing image size merely because the page scrolls. Observe only active feedback and disconnect on pause/question changes.
- Verified 390 × 844, 390 × 740, 360 × 800, 844 × 390 and 1280 × 900: short Common Crane feedback fits above the action bar; long Wren feedback and expanded sources respect the 220 px floor; male/female Nuthatch pictures stack on mobile and fit side-by-side on desktop. Tested scientific-name feedback, DE/EN switching, pause/reload/resume, image enlargement and stable sizing while scrolling. No browser console warnings/errors observed.
- All 12 Node test scripts and syntax/whitespace checks passed. Added height-boundary and viewport-clearance tests to the Pages workflow.


## Follow-up: direct session entry and actionable filters · 2026-11-01

- Existing defaults already provide ten multiple-choice questions and shared remembered preferences. Show the existing session summary and Start first; collapse both the learning configuration and species settings below it. Paused sessions continue to take precedence.
- Keep active restrictions visible above Start. Name up to three selected species groups directly. Explain the independent meanings of vocabulary level and learning progress next to their controls.
- Empty study selections explain missing levels/groups, due reviews, incorrect answers, unavailable region data or incompatible name languages. Offer only individual filter relaxations that actually produce eligible species, with the resulting species count. A separate species-filter reset preserves name languages, target, method, question count, pictures and learning records.
- Lookup empty states offer removing a specific group/level when this produces matches while preserving the search text and other filter. Existing chips, filter counts and full reset remain.
- Validation: all twelve Node test scripts, ten Python regional tests, local image validation, JavaScript syntax and whitespace checks passed. Added bilingual empty-selection regression cases. Browser verification covered direct start, language mismatch and focused correction, empty levels, due-only recovery, settings persistence across reload/interface changes, filter reset preserving German→Dutch/text/15 questions, paused-session priority and lookup recovery retaining the query. Responsive checks at 390×844 and 360×800 showed no horizontal page overflow; no browser warnings/errors observed. No physical phone test.


## Follow-up: answer flow with a reduced visual viewport · 2026-11-01

- Reproduced a clipped text field at 390×320: its bottom was 251 px while the fixed action bar started at 246.5 px. The existing keyboard inset moved the bar but did not reveal the field. Revealed flashcard answers could also sit behind the bar.
- Measure the actual bar height and reserve scroll space including the visual viewport inset. On focus, viewport resize and bar resize, reveal the answer field and any hint, the revealed flashcard answer, or the feedback result plus accepted answer with 12 px clearance. Oversized feedback starts with the result and remains scrollable. Visual viewport scroll events update bar positioning without scrolling the reader back. Dialogs are excluded from focus correction; leaving study mode clears the layout properties and observers.
- Hint and clear pointer interactions preserve input focus. Text/code fields request a Done keyboard action and describe their hint accessibly. Disable Check for empty/whitespace-only input, including after clearing a saved draft.
- Verification: thirteen Node test scripts, ten Python regional tests, local media validation, JS syntax and whitespace checks passed. New geometry regressions cover layout-resizing keyboards, visual-only resizing, viewport panning, changing bar heights, oversized feedback and clearance across viewport sizes; they run in Pages CI.
- Browser checks in DE/EN covered 390×320, 360×280, 360×320, 390×400 and 844×390, text and code input, hint/clear focus, empty Check state, Enter submission, correct/incorrect feedback, Next, revealed flashcards, multiple choice, manual feedback scrolling and pause/reload/resume with a preserved draft. The reproduced input and revealed card now have 12 px clearance above the bar. No horizontal overflow or console warnings/errors observed.
- Verification limit: browser height changes and automated keyboard geometry tests simulate reduced space. No physical iOS/Android keyboard or device emulator was available; native keyboard animation, predictive-text bars and OS-specific focus behavior still need a real-device check.


## Follow-up: understandable learning progress · 2026-11-01

- Added shared DE/EN progress copy: fixed round questions versus extra attempts after errors. Setup explains extra attempts before Start. Active and paused rounds show both first-attempt progress and remaining round questions/extra attempts; the bar's accessible value also includes pending extras. The question identifies a first attempt or extra attempt 1/2 explicitly.
- Statistics define due reviews and mastery beside the figures: new targets are not scheduled yet, mastered targets become due again, three consecutive unhinted correct answers mark mastery, and errors/hints reset that streak. Clarified the selected answer-language/code scope and that lesson species filters do not apply to these totals.
- Feedback shows the mastery streak and scheduled next review before pictures, with a separate explicit extra-attempt notice. Summaries and aggregate statistics distinguish first attempts per round from additional attempts, including outstanding work at early completion. Optional explanations clarify that round questions can be new or previously practised, and that the bar measures answered questions rather than correct answers.
- No changes to scheduling, mastery thresholds, grading, saved lesson state, imports or exports. Added regressions for a full bar with pending extras, both retry limits, pause/reload recovery, due/mastered overlap, and hint/error resets; included in Pages CI.
- All fourteen Node test scripts, ten Python regional tests, local media validation, JS syntax and whitespace checks passed. Browser checks in DE/EN covered a one-question round with two extra attempts, consistent pause/reload counts, correct first/extra summary totals, early completion, progression from 1/3 through 3/3 to mastery, and mobile statistics. At 390×844 and 360×320 there was no horizontal overflow; the typed-answer field retained 12 px clearance above the action bar. No console warnings/errors observed.


## Follow-up: local storage, backup and restore · 2026-11-01

- Added a visible browser/device-local storage note in Statistics with a direct button opening and focusing the backup panel. Expanded DE/EN backup instructions explain website-local storage, no account/device sync, site-data/private-mode loss, and exactly what the JSON includes/excludes. Downloads use dated filenames and report initiation without claiming a confirmed disk save.
- File selection now validates and previews filename, optional backup date, supported learning targets/species and current browser scope. It does not write records. The explicit Replace action explains replacement across all languages with no merge, retained preferences and loss of paused sessions; users can download the current state first or cancel. Empty backups receive an additional removal warning; entirely unsupported files are rejected and partial files report skipped entries.
- Restore commits records and cleared saved sessions atomically before updating in-memory state. Failed persistence retains the previous progress and paused sessions, reports the failure and leaves the preview available for retry/export/cancel. The existing version-1 backup format remains compatible. Information-page text matches this flow.
- Fifteen Node test scripts, ten Python regional tests, media validation, JS syntax and whitespace checks passed. Added backup schema/count/escaping/empty/partial coverage and transaction mocks for unavailable/closed storage, quota failure and synchronous-write abort; included in Pages CI.
- Browser verification in DE/EN used only the local test origin: exported records before and after preview/cancel matched exactly; an explicit restore followed by reload/export matched the chosen file exactly and ended the paused lesson; restoring the original export and exporting again preserved all records. Invalid/unsupported files were rejected, an empty file displayed the removal warning and was cancelled. Tested preview at 360×800 and 760×900, file controls, replacement button wrapping and focused preview scrolling. No horizontal overflow or console warnings/errors observed. Physical mobile devices and actual quota failure were not tested.


## Follow-up: keyboard, focus and screenreader structure · 2026-11-01

- Added a first-Tab Skip to content link. Initial visits retain document focus; navigation focuses the new content. Queued focus captures the intended element and does not override a user's intervening Tab/click. Fixed focus loss after group/species chip removal, statistics-language rerenders and filter recovery inside paused-session preparation.
- Text answers describe the question name, language pair and attempt. Feedback uses focused result headings with explicit descriptions for the user's answer, accepted answer, learning consequence and remaining progress. Removed the whole-feedback live region and live image placeholders to avoid repeated picture/source announcements. Hint delivery uses either focused field description or a concise live message. Search/group results share a debounced atomic status region; unchanged selection/region statuses are not rewritten, and navigation clears pending announcements.
- Keyboard order places Next directly after the feedback answer, before optional references. Revealed flashcards focus a named/described answer group, followed by the two grading buttons. Picture dialogs retain native modal behavior, focus Close initially and restore their invoker after Escape/close. Added visible focus styling and forced-colors rules. Scientific names now use Latin (`la`) rather than the internal `sci` target as a language tag, and lookup no longer repeats the scientific-name row.
- Sixteen Node test scripts, ten Python regional tests, local image validation, JS syntax and whitespace checks passed. New tests cover status coalescing/repeated messages/cancellation, unchanged-text suppression, disconnected targets, native tab order, valid language tags and delayed focus respecting intervening user navigation.
- Browser checks in DE/EN: first Tab/Enter skip navigation, result-count messages, keyboard picture open/Tab containment/Escape return, removal of two group chips, typed answer/hint/submission/Next, paused recovery, statistics-language focus, flash reveal → both grading buttons, scientific-name multiple choice, and rapid Learn → Statistics → backup activation without focus theft. DOM audits found no missing ARIA references, duplicate IDs, unlabelled form controls or positive tabindex in the tested views. At 360×320 the answer/feedback retained clearance above the fixed bar; at 390×844 Next had a visible 3 px keyboard outline with no horizontal overflow. No console warnings/errors observed.
- Limit: accessibility-tree/DOM inspection and keyboard testing were performed; no actual VoiceOver/NVDA speech session or OS forced-colors test was available. This is not an exhaustive conformance audit.
- Guidance: [WAI focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), [native modal dialogs](https://www.w3.org/WAI/WCAG22/Techniques/html/H102), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).


## Follow-up: WAVE initial-document findings · 2026-11-01

- Baseline in the user-provided public WAVE report: 0 errors, 0 contrast errors, 6 alerts (1 missing heading structure, 5 broken same-page links). The report frame contained the initial loading document and no app scripts; it did not contain the loaded Lookup/Learn views. These counts are the before-change baseline.
- Added a meaningful initial h1, descriptive sections for lookup, study, statistics and information, and German/English no-JavaScript guidance. The loading status is set only when JavaScript actually starts, rather than promising indefinite loading with JavaScript disabled.
- Hash navigation now targets persistent, named view containers in both initial and running HTML. The application renders into the selected container, hides the other containers and clears their stale controls/headings. This supplies genuine destinations rather than empty dummy anchors or removing useful route links. The security policy remains unchanged.
- All sixteen Node scripts, ten Python regional tests, media validation, JS syntax and whitespace checks passed. Added invariants for initial fragment destinations, headings/noscript help, retained route containers and removal of inactive form content.
- Browser checks in DE/EN covered direct Learn loading with a preserved paused round, Lookup search, Statistics, Information, one active view/h1, real fragment targets, language switching, resume of graded feedback and Next to the preserved multiple-choice round. After deployment, the exact same public report was rerun: 0 errors, 0 contrast errors and 1 alert (Noscript element). All six original heading/link alerts were resolved. WAVE’s reference identifies the presence of noscript as a manual review item; the intentional German/English explanation of the JavaScript requirement is retained. The report scope remains the initial document.
- Sources: [WAVE report](https://wave.webaim.org/report#/https://dg1tal.github.io/birdnamesde/), [WAVE help](https://wave.webaim.org/help.php), [WebAIM evaluation guidance](https://webaim.org/articles/evaluationguide/).

WAVE scope clarification: inspection of the final report frame showed zero script elements and an unloaded app stylesheet (`link.sheet` was null). Its zero contrast findings therefore do not evaluate the actual application palette. The static heading/fragment checks remain useful; interactive behavior and styled contrast require evaluation of the loaded application, for example with the WAVE browser extension. The initial descriptions and noscript guidance do not make the application functional without JavaScript.


## Lookup: region filter replaces vocabulary level · 2026-11-02

- Removed the vocabulary-level filter from Lookup; old stored levels are discarded.
- The optional region filter uses the same country/region/local-region hierarchy as Learn. The default is “All regions”; selecting a region initially uses all records, with the last 30 days available as an option.
- Lookup remembers its region independently of Learn. Visible guidance explains eBird records, time periods and historical rarities.
- The active region chip and relevant empty-result action remove only the region, preserving the query. “Clear all” clears the query, group and region and restores all-time records.
- Browser verification covered country changes, England/Cornwall, Bavaria, both periods, empty search and targeted recovery, keyboard order, reload, independence from the learning region and a 360 px layout without horizontal overflow. Automated tests cover legacy settings migration and independent region storage.

## Species packages replace vocabulary levels · 2026-11-02

- The three editorial sets are now called “Getting started”, “Building on the basics” and “Exploring further”, under “Species packages”.
- Descriptions use actual example species, dynamic totals and complete alphabetical lists. Each species belongs to exactly one package. Packages can be combined and are not cumulative; other species filters narrow the selection further. Full lists and totals explicitly precede filtering.
- Numeric IDs, species assignments, saved selections and progress remain intact. The labels apply to setup summaries, selection help, lookup cards and data information in both interfaces; lists identify their name language.
- Verified individual and combined packages (106, 103 and 209 species), empty selection, complete-list disclosures, description references, keyboard order and English copy. No horizontal overflow at 360 px, including the expanded 104-species list. Automated checks cover complete lists, stable selection IDs, both languages and HTML escaping.

## Regional selection and frequency previews · 2026-11-02

- Learning setup places country/region and species selection before the round controls. Regional selection replaces global packages; further filters and learning-target/session settings remain available in disclosures.
- A live preview offers all records, seasonal selection and recent records, with selectable modes, counts, explanations and expandable species lists. Counts reflect the other active filters.
- Seasonal selection defaults to “Frequent” (at least 10%) and “Medium” (1% to less than 10%); “Rare” (above 0% but less than 1%) is independently selectable. Compact checkbox rows retain counts, explanations and expandable species lists.
- Current notable reports are automatically included, with no opt-out control. The preview separates base species and current additions and explains validity or missing fresh data. Insufficient seasonal samples visibly fall back to all regional records.
- See [README](../README.md#hybrid-regional-learning) for source coverage, thresholds, expiry and reproduction. These behavior notes were checked against the current source; earlier browser-verification results above remain tied to their dated changes.
