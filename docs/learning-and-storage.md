# Learning, languages and storage

[README](../README.md) · UI labels below use the English interface.

## Name languages and learning contexts

The German and English interfaces share learning state. Questions and answers
independently support German, English, Dutch, French, Finnish and scientific names.
Dutch and French cover all 994 species; Finnish covers 986. Missing names exclude
the affected pair. If required name data fail to load, a paused lesson waits for
them rather than changing its questions. Sources and regeneration commands are in
[data sources](data-sources.md).

Text entry measures recall, flashcards measure self-assessment, and multiple
choice/“Think first” measure recognition. Evidence is separate for each species,
question language, answer target and method family. Success in one context does
not establish security in another. Statistics have independent selectors; only
an explicit practice action applies their context to learning.

Progress keys are `species-id:target`, with targets `en`, `de`, `nl`, `fr`, `fi`,
`sci`, `code` (eBird) and `dda`. Each record's `contexts` separates question
language and method family. Historical answer totals include all methods.

`name-languages.js` owns name resolution and answer comparison. Add a registry
entry and a sourced version-1 language JSON to support another language.
`i18n.js` and `editorial-en.js` handle UI/editorial text; `data-name-content`
protects original bird names from UI translation.

## Shared learning setup

**Change settings** controls targets, languages, method and pictures.
**Change species selection** controls geography, season, groups and selected
species. **Build another round yourself** adds question-count and progress filters.
Regional previews apply species/name filters; custom progress filters affect only
custom rounds. See [regional selection](deployment-and-regions.md#hybrid-regional-learning).

Shared preferences use `birdnames-ui-shared-v1`. Migration adopts the current
interface's legacy settings, falling back to the other interface, and keeps the
old keys as recovery copies. `lesson-state-v2` preserves a second legacy paused
lesson until the first ends. Interface switches retain questions, drafts and
feedback; reloads pause the lesson. Saved queues retain their languages and
selection when setup changes.

## Learning-progress terminology

Scheduling rules live in `learning-model.js`:

- Daily rounds contain up to ten targets, with due reviews first and at most
  three new introductions per local day across languages and methods. New pairs
  are introduced before testing. Region/season filters govern new targets;
  started targets remain eligible for review outside those filters.
- Custom practice can introduce more targets. **Keep learning** starts up to ten
  questions using current shared settings, ignoring custom counts/progress filters.
- Security requires three consecutive due successes, each at least 24 hours after
  the previous graded attempt. Initial, early, hinted and retry answers do not qualify.
- Review intervals are 1/3/7/14/30/60 days. Errors reset confirmations, reduce the
  stage and schedule a ten-minute review. Successful due repairs below the 24-hour
  gap schedule the next day without confirmation.
- Correct early answers and retries preserve scheduled dates. Hints preserve
  confirmations and retain earlier review dates. Extra attempts require an
  intervening question and are preferably placed after three.

First, supported and retry answers are counted separately. `#lernmethode` explains
the rules and research references; `#info` covers data and privacy.

## Completion conditions

Completion requires all round questions and extra attempts to be finished. Daily
completion also checks remaining reviews for the selected direction/method.
Ending early retains graded answers and reports open questions. Setup and
completion use `dailyLearningPlan()`; current additions have priority among new
targets without a reserved quota.

Undo is available on the early-ending summary until navigation, reload, another
round, backup restore or reset. It restores round state, not graded answers or
the introduction ledger. **Back to learning settings** opens setup without
starting a round; an existing paused session keeps its separate resume action.

## Answer-card explanations

Feedback shows the result, submitted and accepted answers, then references and
credited pictures. Folded sections explain names, German alternatives and why the
bird was selected, including the frozen region/season/current-report dates and
review schedule. Legacy feedback does not infer an earlier reason from new data.
“Think first” hides choices until requested; their order survives pause/reload.

When German participates, introductions and feedback show current alternatives.
Spatz, Grünling and Rüttelfalke are labelled ambiguous and rejected as unambiguous
answers; historical names remain in source notes. See the
[alternative-name audit](ui-consistency-20261113.md#complete-german-alternative-display-audit).

## Saved species

`#lernen/merkliste` stores IDs in `saved-species-v1`. Saved rounds use their own
list, ignoring region, season, group and progress filters while requiring the
selected names. Their setup does not change shared settings. Resume or end the
current round before starting another. Resetting progress retains the list;
unknown local IDs remain visible as unavailable.

## Backup and restore flow

**Statistics → Back up and restore progress** exports version-3 JSON. Exports
include all progress records, context evidence, the daily introduction ledger and
saved species; they exclude preferences, paused lessons, drafts and cached media.
At 1 MiB, exports use `.json.gz` if Compression Streams are available; compression
failure falls back to JSON. Input, expanded output and export are each limited to
128 MiB. Invalid or oversized files are rejected, including during decompression.

Import validates and previews before explicit replacement. It replaces progress
without merging and ends paused sessions. Version 3 replaces saved species;
versions 1/2 preserve the destination list. List-only v3 backups are valid.
Unknown imported IDs/records are reported and skipped; wholly unsupported files
are rejected and empty progress triggers a removal warning.

`learning-storage.js` commits records, ledger, list and lessons atomically. Write
failure preserves previous state. Legacy counters/dates remain historical;
the first graded legacy review claims its old date once for that context.
Version-1 lessons remain resumable. IndexedDB database version is still 1.

## Protected progress recovery

Startup validates records, ledger and lessons before migration or writing.
Unsafe state locks Learn/Statistics while leaving Lookup available. Original data
remain until replacement with a checked backup; failed replacement retains the
lock. Readable state can be exported as diagnostic rescue JSON, which is not an
importable progress backup. Reload retries initialization; storage reads time out
after ten seconds and late callbacks cannot write.

The queue limit is `speciesCount × 2 × (1 + RULES.maxRetries)`: 5,964 entries for
994 species with two retries. `progress-validation.js` owns record/ledger rules;
`learning-storage.js` owns loading and atomic replacement.

## DDA and eBird code systems

Code and mixed lessons select eBird or DDA across all methods and round types.
DDA questions require a mapped entry. `:code` and `:dda` records have separate
evidence and are both included in v3 backups. Reference cards label both systems;
accepted-answer cards use only the selected system.

DDA ignores case and accepts `Hö`/`Hoe`, but not `Ho` for `Hö`. Source spelling and
narrower concepts (Lesser Redpoll, feral Rock Pigeon, domestic Swan Goose) remain
visible. Queue items freeze their answer, source name and scope. Definition changes
reset stage/confirmations and make review due, retaining historical totals;
cosmetic name changes do not. Reconciliation also runs on backup restore.

## Checks

The [development check loop](development.md#checks) includes multilingual,
learning-model/settings/recovery, practice-queue, study-state, backup, DDA,
answer-feedback, progress-copy, translation and usability regressions.
