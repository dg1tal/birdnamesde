# UI/UX update — 21 October 2026

## Scope

Implements the approved three-stage review on the existing BirdNames DE Site. Species data, names, codes, photos and photo attribution records are unchanged.

- Lookup remembers query, group, vocabulary level, photo preference and return scroll position. Visible filter labels, removable filter chips, reset actions and a return-to-search button improve navigation.
- Lesson setup remembers settings. Searchable groups show species counts, selected groups and explicit all/clear actions. Zero selected groups is now an explicit empty selection.
- Records and the current lesson are written in one IndexedDB transaction, using the existing database and state store. A saved lesson is offered for resumption after reload. Grading and feedback rendering are separate; restored feedback does not grade again. Text drafts, hints and revealed flashcards persist.
- Original questions and retry counts are separate. Feedback retains the user's answer. Flashcard reveal uses the same US/GB and alternative name presentation. Photos remain hidden until grading.
- Pause and completion are separate actions. Completion reports first answers and additional repetitions. Historical totals remain intact; the new first/retry counters start on this date and are labeled accordingly. JSON backups retain optional new counters while older version-1 backups remain accepted.
- Statistics link to due, unmastered and individual difficult-species practice. An existing paused lesson must be completed before starting another, preventing silent replacement.
- Local photo enlargement uses a native modal dialog, with both sex photos and per-image author/license/source. Escape closes the dialog and restores focus. External source links remain separate.
- Responsive filter layouts, larger touch rows, horizontally contained tables, semantic headings, focused question/feedback transitions, visible focus outlines and explicit status messages improve access.

## Verification

- Existing search/answer/scheduling/import tests passed for all 313 species.
- New lesson-state tests cover restoration without double grading, stable original totals, separate retries, first-answer accounting and invalid lesson rejection.
- Existing photo-cache tests passed; all 409 local photo references, licenses, authors and hashes validated.
- Browser: wrong text answer, reload, resume graded feedback, retry with a GB answer and completion: 0/1 first answers, 1 correct additional retry, 2 attempts total (no duplicate grade).
- Browser: statistics individual-species start, flashcard reveal without photos, two sex photos after grading, decoded photo dialog, Escape dismissal and pause/resume passed.
- Browser: lookup query and group survived navigation; filtered empty state explained restrictions.
- Browser at 320, 390 and 768 CSS-pixel frame widths: no horizontal document overflow after fixing native-select minimum sizing. Lookup with photos, lesson feedback and statistics were checked.
- Real iPhone Safari, on-screen keyboard and assistive-technology testing remain unverified. Browser automation is not a substitute for these device checks.

## Storage compatibility

Database name/version and existing `records` key remain unchanged. A new `lesson` key stores the current queue and answer state. UI preferences use a new `birdnames-ui` localStorage key. No existing learning record is migrated or deleted. Learning backup/import remains version 1; lesson state is local-only and is cleared when replacing/resetting progress after the existing explicit confirmation.
