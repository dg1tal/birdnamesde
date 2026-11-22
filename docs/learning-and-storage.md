# Learning, languages and storage

[Back to the README](../README.md)

Reviewed against commit `62f79cb` on 20 November 2026.

Paths in code examples are relative to the repository root. UI labels use the English interface. Dated review reports retain their release-specific results; the thematic guides describe the documented current behavior.

## Name languages and learning contexts

German and English interface choices are visible in the desktop header; phones group them with theme controls under **Display**. Both interfaces share the same learning state. In either interface, question and answer names are independently selectable: German, English, Dutch, French, Finnish and the binomial scientific name. A swap button reverses them. Names, codes and mixed lessons support text entry, flashcards, direct multiple choice and “Think first” (options initially hidden). Both names must exist for a species to be eligible; missing translations never fall back to a different answer language. A paused lesson whose name data cannot be loaded is preserved and cannot be resumed until the data returns.

Dutch names for the expanded catalogue come from the `Dutch` column of the retained official `eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx` records. Reproduce them with `python3 scripts/build-name-language.py --language nl --column Dutch`. `dist/languages/nl.json` records provenance and exact official names. Names are literal official records; the catalogue expansion retains the pinned v2025 taxonomy without speculative translations. Dutch names are searchable and shown in lookup alongside the existing names, photos and attribution.

Finnish names use the same retained workbook’s `Finnish` column: `python3 scripts/build-name-language.py --language fi --column Finnish`. `dist/languages/fi.json` contains 933 sourced names for the 940-species catalogue. The seven species without Finnish names are excluded whenever the question or answer requires Finnish; no names are guessed. Finnish names are also searchable and available in lookup. Scientific-name explanations for French and Finnish questions use the German/English interface language.

French names use the retained workbook’s global `French` column: `python3 scripts/build-name-language.py --language fr --column French`. `dist/languages/fr.json` records the exact names and provenance for all 940 catalogue species. French is available for questions, answers, lookup and language-specific progress, independently of the German/English interface.

`dist/name-languages.js` is the shared registry and resolver for names, labels, accepted alternatives and Unicode-aware answer comparison. To add another language, add its registry entry and a sourced JSON file in the same version-1 schema. Session and progress validation derive supported name targets from this registry. UI translations remain separate in `dist/i18n.js`; bird names marked `data-name-content` are never transformed by UI translation.

Progress records retain the outer `species-id:target` keys: `:en`, `:de`, `:code`, `:nl`, `:fr`, `:fi` and `:sci`. Within each record, `contexts` separates question language and method family: text uses recall, flashcards use self-assessment, and direct choice/“Think first” share recognition. Changing direction or method family does not transfer secure status. See [Backup and restore flow](learning-and-storage.md#backup-and-restore-flow) for export contents and legacy compatibility.

New lessons save the selected names explicitly, so changing setup does not alter an existing queue. Legacy lessons recover their original question language on migration. Statistics use independent question-name, answer-name and method-family selectors for secure/due counts; aggregate answer totals retain historical answers across methods.

Checks: `node scripts/test-multilingual.mjs`, alongside the existing answer, alias and lesson-state tests. See [dutch-learning-20261029.md](dutch-learning-20261029.md).

## Shared learning setup

The interface switch translates the current learning context. Settings use `birdnames-ui-shared-v1`; the first visit adopts the current interface's legacy settings, falling back to the other interface. Old preference keys remain as recovery copies. IndexedDB `lesson-state-v2` shares the current lesson and preserves a second legacy paused lesson until the first is finished. Active questions, drafts and feedback survive interface switches; ordinary reloads still pause the lesson.

Learning setup leads with the daily round and a shared settings disclosure. Species selection determines new introductions; already started targets remain eligible for due review independently of those species filters. Shared settings include question/answer names, method, region, species groups, pictures and regional selection. Regional previews compare all records, seasonal selection and recent records, with counts, species lists and automatic current additions. Their counts apply shared species/name filters and exclude the custom progress filter. Seasonal frequency choices show counts and expandable lists.

Basic learning settings keep target/languages, method and pictures together. Region and species selection are separately collapsible after the daily action. Species groups and selections from statistics remain part of species selection. The collapsed summary includes matching species and picture state; selection errors stay visible. All ordinary learning selections use regional data and additional species-group filters; saved-species rounds explicitly use their own list.

“Build another round yourself” adds custom question-count and progress controls. Code-only learning hides unused answer-language/swap controls. `node scripts/test-learning-settings.mjs` checks migration and selection messages; `node scripts/test-practice-queue.mjs` checks direct continuation.

English editorial metadata is centralized in `dist/editorial-en.js`. `node scripts/test-editorial-translations.mjs` checks coverage of every species status/note, German-name explanation/region and photo label/comparison/transformation in the current dataset. Names and original source titles remain unchanged.

Study feedback and backup errors use explicit locale-aware message composition. `node scripts/test-study-translations.mjs` checks counters, review/hint/retry combinations, singular/plural forms and import errors in English and German. Selected-group chips render translated labels; species names in difficult-species statistics keep their original language.

## Learning-progress terminology

The daily round offers at most ten targets, due reviews first, with three new introductions per local calendar day across languages and methods. Region/season/species filters govern discovery, while started targets remain eligible for review. Free practice retains the full filters and can introduce more targets. “Keep learning” starts an optional round of up to ten questions directly from completion or an exhausted daily queue, preserving shared species/language/method settings while ignoring hidden custom progress filters and question counts. Custom and direct practice share the queue builder in `dist/practice-queue.js` (`node scripts/test-practice-queue.mjs`). New pairs are introduced before practice. Introduction cards lead with a short memorisation instruction and use the focused study view with Next/Pause controls and compact spacing. At viewport widths of at least 900 px and heights of at least 650 px, actions stay inside the card using sticky positioning; smaller viewports retain the fixed action bar. Image heights budget for all image rows, captions and card padding, with readable minimum sizes and scrolling on small screens. Introductions, revealed flashcards and feedback separate the main answer from a reference panel. In name questions, the scientific reference and smaller code badges appear together after the answer; introductions keep codes in the supplementary species section. Code answers are not duplicated. “Think first” hides options until requested, without a timer; option order, introduction state and feedback survive pause/reload.

`dist/learning-model.js` owns the shared product constants and pure scheduling logic. Evidence is separated by species, question language, answer target and method family (recognition, recall, self-assessment). Three consecutive due successes at least 24 hours after the previous graded attempt confirm security; initial practice, hints, retries and early practice do not. Fixed intervals remain 1/3/7/14/30/60 days. Errors reduce the stage and schedule a ten-minute review. Correct early practice/retries preserve scheduled dates; a successful due short-gap repair schedules the next day without confirmation. Hints preserve confirmations and retain earlier dates. Feedback explanations remain below the images. First answers, supported answers and bounded extra attempts are counted separately. A retry requires at least one intervening question and is preferably placed after three.

The completion summary places direct continuation before supplementary details, offers additional due reviews when available and omits the next-review timestamp.

`#lernmethode` is a separate bilingual view with the actual rules, seven research sources and explicit distinction between research principles and product thresholds. Footer/setup/statistics links open it; active sessions are paused. `#info` retains data, storage, network, licensing and backup information. Tests: `node scripts/test-learning-model.mjs` and `node scripts/test-learning-method.mjs`.

## Completion conditions

A positive completion message requires all round questions and extra attempts to
be finished. Daily-round completion additionally checks the currently offered
questions for the same learning direction/method and remaining reviews today.
Ending a round early preserves its graded answers and reports its open questions.
Setup and completion share `dailyLearningPlan()`; current additions retain their
priority among new candidates without reserving a fixed share. The unused former
quota queue has been removed. `scripts/test-hybrid-learning.mjs` exercises the
actual daily/practice paths, and `scripts/test-progress-copy.mjs` checks the
completion conditions in German and English.

## Answer-card explanations

The first-attempt label is hidden; retries show “Repeat”. Feedback separates the result, the user’s answer and the accepted answer. A reference panel shows the scientific name, codes and German alternatives; comparison pictures follow with their own credits. The former outer More information disclosure has been removed. Below pictures, sibling disclosures provide name meaning, German-name notes/sources and “Why am I seeing this bird?”, followed by a separate eBird link and the Next action. The learning-context disclosure contains the saved pre-grading question reason, confirmations and schedule. Older graded sessions use neutral wording rather than inferring their reason from updated records; focused feedback does not automatically announce folded details.

If German is either the question or answer language, all 47 current alternatives for 34 species are visible during introductions, reveals and feedback. Unambiguous alternatives remain accepted answers. Spatz, Grünling and Rüttelfalke are separately labelled ambiguous and are not accepted as unambiguous answers. Historical names retain their qualifications in source notes. Source explanations and links stay with the name they document. See [the complete display audit](ui-consistency-20261113.md#complete-german-alternative-display-audit) and `scripts/test-answer-feedback.mjs`.

Regional round selection (region, season, chosen frequency groups and historical period) is shown in the folded answer-card explanation instead of above every question. A current addition retains only a short “Currently reported” badge; its observation/expiry dates are shown in the explanation together with the original round-selection snapshot.

The completion summary offers “Back to learning settings”, which opens the editable setup without starting a round. A click on the already-active Learn navigation link also opens setup instead of waiting for a hashchange. Existing settings and any saved session are preserved; if another session remains, setup is expanded and its separate resume action remains available.

## Backup and restore flow

Large backups (compact JSON at least 1 MiB) are automatically saved as `.json.gz`
when the browser supports both Compression Streams APIs. Small backups remain
readable `.json`; missing or failed compression falls back to compact JSON.
Both file formats carry the current version-3 backup schema; versions 1 and 2
remain importable through the same preview and explicit, atomic replacement flow.
Older JSON exports above the former 5 MB limit remain importable. Gzip is detected by its header; damaged archives are rejected.
The common input/expanded-output/export budget is 128 MiB. Expanded bytes are
counted while streaming and decompression is cancelled on overflow; compression
does not bypass this limit. Export refuses an oversized regular backup instead
of producing a file the importer would reject. Rescue files remain distinct,
uncompressed diagnostic JSON and are never accepted as progress backups.
Tests: `node scripts/test-backup-file.mjs` covers 939 targets with 75,120 answers,
legacy JSON, gzip round trips, further grading, unavailable compression,
truncation/checksum errors and bounded expansion.

Statistics visibly identifies browser/device-local storage and links directly to backup controls. The dated JSON download includes all answer-language/code records, method/direction evidence and the daily introduction ledger plus saved species independently of current filters; preferences, paused sessions, drafts and cached media are excluded. Selecting a file only validates and previews it, showing its date, supported learning-target/species counts and the current browser counts. Explicit replacement overwrites all progress without merging and ends paused sessions. Users can download their current records before replacement or cancel without changing them. Empty backups have a distinct removal warning; files containing only unsupported records are rejected, while partially supported files report skipped records.

`dist/learning-storage.js` writes records, the daily ledger, saved species and saved lessons in one transaction. Restore publishes the new in-memory state only after the transaction commits; quota, closed-database or synchronous write failures preserve the prior state. Export format v3 includes method/direction evidence, the daily introduction ledger and saved species. Imports accept v1/v2/v3; old counters/dates are retained as historical data, with no invented source-language or method evidence. The first graded legacy review claims its old date once for the selected context. Paused v1 sessions remain resumable. Browser downloads are announced as started, rather than claiming the file has been saved to disk.

## Protected progress recovery

Saved learning state is validated before migration or any normal write. The same
counter/date rules apply to backups and local records, including method contexts
and legacy values; optional historical counters remain optional. Unsupported
entries retain the existing skip-and-report behavior during backup import. Local
startup never silently removes unsupported or damaged records.

If records, the daily ledger or a saved lesson cannot be restored safely, Learn
and Statistics show a recovery view in the selected interface language. Lookup
remains available. Normal learning writes are blocked, and the original stored
state is kept until the user explicitly replaces it with a checked v1/v2/v3 backup.
Readable original state can be downloaded as a separately marked rescue JSON
file; this is diagnostic material, not an importable progress backup. A failed
replacement keeps both the original data and the recovery lock. A reload retries
storage initialization. Opening/reading storage is bounded to ten seconds; late
callbacks cannot publish state or start normal writes after a timeout. Backups use version 3; versions 1 and 2 remain importable. IndexedDB database version 1 remains unchanged.

Round recovery uses the catalogue size and `RULES.maxRetries`: at most two initial
targets per species, each with its permitted extra attempts (5,640 entries for
940 species and two retries). Large v1/v2 rounds retain their queue, counters,
feedback and draft instead of being discarded at the former 1,878-entry limit.

`dist/progress-validation.js` owns shared record and daily-ledger validation;
`dist/learning-storage.js` owns bounded loading and atomic replacement. Run
`node scripts/test-learning-recovery.mjs` for the fixed 1,750-question large-round
regression, maximum sizes, legacy backup round trips, malformed counters/dates,
failed/aborted/blocked reads, late callbacks and preservation of original data.
See [quality-review-20261105.md](quality-review-20261105.md) for the original findings and verification.

## Data and privacy information

`dist/info-page.js` renders matching German and English information sections. Species/media totals and regional coverage/timestamps derive from loaded data; the review date is separate from taxonomy and dataset dates. English source links have English descriptions and retain original titles in a disclosure. Both information routes have collapsible contents lists with focusable section targets. The page documents the Actions-only eBird fetch, hosting requests, shared learning context, local storage/cache, backup scope and domain migration. Tests: `node scripts/test-information.mjs`.

## Saved species, statistics and round recovery

The daily round is the primary action. On desktop it sits beside the learning-settings summary; on phones these stack. **Change settings** opens target, languages, method and pictures. **Change species selection** separately opens region, seasonal/group filters and selected species. Both offer a direct return to the daily round with focus on a visible action. Hinted success and added retries are explained immediately; the current phase distinguishes main questions from extra attempts.

Statistics has its own persisted question/answer/method viewing context. Changing its selectors does not write learning settings. Only explicit practice actions apply that context. Recognition retains the current recognition format where possible, otherwise Think first.

`#lernen/merkliste` manages saved species. IDs are stored in `saved-species-v1` in the existing IndexedDB state store and committed together with progress, the daily ledger and rounds. Saved-species setup starts from current learning settings but does not change them. Its queue ignores region, season, group and progress filters; incompatible name pairs are excluded. The current round must be resumed or explicitly ended before another can start.

Backup version 3 adds `savedSpecies`. List-only backups are valid. Version 3 replaces the list; versions 1 and 2 preserve it and explain this in preview. Unknown imported IDs are reported and skipped. Local unknown IDs are preserved and marked unavailable in the list. Reset progress retains the list. Settings, paused rounds and answer drafts remain excluded from backups.

Ending early offers Undo on the current summary, without a timer. Only round state and the pending-round order are restored; graded records and the daily ledger are never rolled back or graded twice. Leaving the summary, starting another round, restoring a backup, resetting or reloading invalidates Undo.

Regression coverage: `node scripts/test-usability.mjs`, including atomic list replacement and failed transactions, old and list-only backups, independent statistics, and the production end-round handler.

## DDA and eBird code systems

Abbreviation and mixed lessons select eBird or DDA, including saved-species
practice. Existing settings default to eBird. Mixed lessons pair the selected
name target with one selected code system. The four answer methods, daily
introductions, custom rounds and continuation share this selection. Only species
with a mapped DDA entry are eligible for DDA questions. Reference cards show
separately labelled source systems after revealing the answer. The DDA source
link appears centrally under Data & privacy rather than on each card.

The existing `species-id:code` records remain eBird; `species-id:dda` records keep
independent DDA evidence, reviews, methods and question languages. Statistics
select their code system independently and carry it into follow-up practice.
Progress backups include both systems without changing export version 3.

DDA answers ignore case and accept German umlaut transliterations (`Hö` / `Hoe`)
but preserve umlauts as distinct letters (`Ho` is not `Hö`). The original one- to
three-letter source spelling is always displayed. Narrower source concepts
(Lesser Redpoll, feral Rock Pigeon, domestic Swan Goose) are explained in both
questions and answers using the German DDA name, independently of question language.

Each DDA queue item snapshots its original answer, source name and scope, so
reloads and later data updates cannot rewrite paused questions or grade them
twice. A definition signature on DDA records detects changes to the abbreviation,
scientific concept or scope: confirmations/stage are reset and review becomes
due, while historical answer totals are retained. This reconciliation also runs
when restoring backups. Cosmetic source-name changes do not reset evidence.
