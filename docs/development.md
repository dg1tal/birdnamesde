# Development and verification

[Back to the README](../README.md)

Paths in code examples are relative to the repository root. UI labels use the English interface. Dated review reports retain their release-specific results; the thematic guides describe the documented current behavior.

## Application modules

- `dist/species.json`: independently replaceable species data and provenance metadata.
- `dist/logic.js`: search normalization, answer acceptance, progress helpers and import validation.
- `dist/lookup-search.js`: ranked multilingual lookup with visible match provenance; see [search design and research](search-design-20261108.md).
- `dist/learning-model.js`: daily introduction budget, learning contexts, evidence and review scheduling.
- `dist/practice-queue.js`: custom and direct-continuation practice queues.
- `dist/learning-method.js`: bilingual learning-method explanations and research references.
- `dist/learning-selection-copy.js`: shared species-selection and daily introduction wording.
- `dist/app.js`: lookup, daily/custom learning, text/flashcard/direct-choice/think-first answers, IndexedDB persistence, statistics, JSON export/import and theme.
- `dist/study-state.js`: serializable lesson recovery, single grading and separate first-question/retry progress.
- `dist/style.css`: responsive layout and dark mode.
- `dist/validation.json`: complete machine validation result, code collisions and limitations.

## Checks

CI selects Node.js 26 LTS and standard CPython 3.15, taking current stable patches
within those release lines, on Ubuntu 26.04. Use the same runtime lines locally.
The app has no npm dependencies; no npm install or package-manager cache is needed.

```sh
npm test
for test in scripts/test-*.mjs; do node "$test" || exit 1; done
python3 -m unittest discover -s scripts -p 'test_*.py'
python3 scripts/validate-data.py
python3 scripts/build-scientific-names.py --check
python3 scripts/build-ebd-seasonal.py --check
python3 scripts/check-private-ebd.py
node scripts/validate-photos.mjs
for file in dist/*.js; do node --check "$file" || exit 1; done
git diff --exit-code -- dist data
git diff --check
```

No build step is required. Serve `dist/` as static assets, for example with `python3 -m http.server 8000 --directory dist`. The Pages workflow runs the deployment checks and refreshes regional/current data before uploading this directory. `scripts/finalize-data.py` regenerates data and is not a read-only check; run it only when intentionally updating the dataset.

Browser verification and its limits are recorded in the dated reports below. Recent checks include responsive layouts, keyboard navigation, backup/restore and lesson recovery. Physical mobile keyboards and actual screenreader speech remain unverified.

## Module version consistency

Run `node scripts/test-module-versions.mjs` to check that production imports and
the HTML entry point use a single URL version for each local JavaScript module.
This check runs in the existing Pages test loop.

## Optional workbook tooling

Only the legacy `scripts/build-data.py` importer needs openpyxl. Install its pinned
development dependency in a virtual environment outside the checkout:

```sh
python3.15 -m venv /tmp/birdnames-workbook-venv
/tmp/birdnames-workbook-venv/bin/python -m pip install -r requirements-dev.txt
```

Routine checks and deployment do not install this dependency. Loading the workbook
for inspection does not require running the importer or regenerating datasets.

## Dependency maintenance

GitHub Actions are pinned to full commit SHAs with release-version comments.
Dependabot proposes monthly updates for Actions and the optional Python dependency,
targeting `main`, with at most five open pull requests per ecosystem and no automatic
merging. Review migration notes and run the checks before merging. Runtime major
upgrades are reviewed separately; patch releases within the selected lines are
picked up by the setup actions. The workflows log their runtime versions.

## Learning photo cache

`dist/photo-cache.js` prefetches and decodes the current and next two question photos only when lesson photos are enabled. It retains up to 12 decoded image objects and reuses the actual element after grading, avoiding lazy-load scheduling and repeat decoding for nearby retries. Compressed responses are stored in the browser Cache API (`birdnames-photos-v1`) with content-hash URLs; old versions of a replaced photo are removed. Cache restrictions or quota errors fall back to memory reuse, and a host that rejects blob image URLs falls back to a preloaded normal image URL. Image caching is separate from IndexedDB learning records. The browser can evict either storage under its usual policies; this does not make the whole app available offline.

Run `node scripts/test-photo-cache.mjs` for network deduplication, decoded-object reuse, persistent cache reuse without network, invalidation, memory limits and recovery tests.

## Keyboard and screenreader behavior

The first Tab reaches Skip to content; activating it focuses the current search, answer field or heading without changing routes. Route changes, removed group/species controls, statistics-language changes and paused-session preparation preserve meaningful focus. Queued render focus never overrides an intervening user focus change. Native modal picture dialogs start at Close, support Escape and return focus to the invoking picture.

Typed questions describe their language pair, bird and attempt type. Feedback focuses the result with accepted names, learning consequences and progress as its description; photos and source credits are outside that automatic announcement. The folded explanation and optional image/source controls precede Next in reading/tab order. Flashcard reveal focuses the answer group before the two grading buttons. Search announcements are coalesced and route changes cancel stale messages. Scientific names use the valid Latin language tag, and the redundant scientific-name lookup row was removed. Keyboard focus has an explicit visible outline, including forced-colors styling.

## Historical WAVE report and its limits

The initial HTML has a meaningful heading, four original hash-route containers and a fifth for the learning-method view, with descriptions and a no-JavaScript explanation. The WAVE results below record the earlier four-view release; they are not a new audit of the current application. These are the same containers used by the running application. Only the active view is shown; inactive content is cleared so stale forms, duplicate control IDs and inactive headings do not enter navigation.

The [public WAVE report](https://wave.webaim.org/report#/https://dg1tal.github.io/birdnamesde/) originally found 0 errors, 0 contrast errors and 6 alerts (one heading-structure alert and five broken same-page targets). After deployment, a rerun found 0 errors, 0 contrast errors and 1 alert: the intentional `noscript` element explaining the JavaScript requirement in both languages. All six original alerts were resolved.

The report frame contained no scripts and an unloaded stylesheet (`link.sheet` was null). Its heading/fragment findings concern the initial document; its contrast result does not assess the application palette. The live quiz, feedback, backup interactions and styled contrast require separate checks. WebAIM recommends its browser extension for dynamic content. Initial descriptions and noscript guidance do not make the app work without JavaScript.

## Earlier UI reviews

See [ui-ux-density-20261030.md](ui-ux-density-20261030.md) for follow-ups reviewed on 4 November, including lookup regions, species packages, regional previews and the current daily-learning flow. See [ui-ux-update-20261021.md](ui-ux-update-20261021.md) for the approved UX scope, storage compatibility and browser verification. Historical learning records are preserved. Current evidence, daily introduction budgets and saved lessons use the [version-2 learning model](learning-and-storage.md#learning-progress-terminology).
