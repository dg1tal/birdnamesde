# Development and verification

[README](../README.md) · Run commands from the repository root.

The app serves `dist/` directly, with no build step or npm dependencies. CI uses
Node.js 26 and CPython 3.15 on Ubuntu 26.04, with current patches in those lines.

## Checks

```sh
npm test
for test in scripts/test-*.mjs; do node "$test" || exit 1; done
python3 -m unittest discover -s scripts -p 'test_*.py'
python3 scripts/validate-data.py
python3 scripts/update-dda.py --check
python3 scripts/build-scientific-names.py --check
python3 scripts/build-ebd-seasonal.py --check
python3 scripts/check-private-ebd.py
python3 scripts/check-personal-paths.py
node scripts/validate-photos.mjs
for file in dist/*.js; do node --check "$file" || exit 1; done
git diff --exit-code -- dist data
git diff --check
```

Use repository-relative paths or `$HOME` in examples. Run the personal-path and
private-EBD guards before committing. Data generators such as `finalize-data.py`
write files; use documented `--check` options for reproducibility checks.

## Application modules

All paths below are under `dist/`.

| Area | Files |
| --- | --- |
| UI and styles | `app.js`, `style.css`, `accessibility.js` |
| Search and lookup settings | `logic.js`, `lookup-search.js`, `lookup-settings.js` |
| Scheduling and queues | `learning-model.js`, `practice-queue.js` |
| Lessons and persistence | `study-state.js`, `learning-storage.js`, `progress-validation.js` |
| Backups and saved species | `backup.js`, `backup-file.js`, `usability-state.js` |
| Languages and explanations | `name-languages.js`, `i18n.js`, `editorial-en.js`, `scientific-names.js`, `scientific-name-aliases.js` |
| Learning instructions | `learning-method.js`, `learning-selection-copy.js`, `progress-copy.js`, `introduction-reason.js` |
| Regional selection and codes | `regions.js`, `hybrid-learning.js`, `code-targets.js` |
| Study layout and photos | `study-viewport.js`, `study-photo-layout.js`, `photo-cache.js` |
| Information pages | `info-page.js`, `standalone-page.js` |
| Catalogue and validation | `species.json`, `validation.json` |

`node scripts/test-module-versions.mjs` checks consistent version URLs across imports and the
HTML entry point. It runs with the other Node suites.

## Optional workbook tooling

Only the legacy `build-data.py` importer needs openpyxl. Install it outside the
checkout; routine checks and deployment use the standard library:

```sh
python3.15 -m venv /tmp/birdnames-workbook-venv
/tmp/birdnames-workbook-venv/bin/python -m pip install -r requirements-dev.txt
```

Actions are pinned to commit SHAs. [Dependabot](../.github/dependabot.yml) proposes
monthly Actions and Python dependency updates, with no automatic merging. Review
runtime major upgrades separately.

## Photo cache

When pictures are enabled, `photo-cache.js` prepares the current and next two
questions and retains up to 12 decoded images. The Cache API
(`birdnames-photos-v1`) stores content-hash URLs and removes superseded versions.
Storage or blob-URL restrictions fall back to memory or normal URLs. Photo caching
is separate from IndexedDB progress and does not provide full offline support.
Tests: `scripts/test-photo-cache.mjs`.

## Accessibility and browser verification

Skip to content focuses the active view. Navigation preserves meaningful focus;
queued focus changes respect intervening user input. Picture dialogs support
Escape and return focus to their invoking control. Feedback announces accepted
answers and progress, leaving photos and folded sources outside the announcement.
Flashcard reveal focuses the answer before grading controls. Focus outlines also
support forced colours. Only the active route remains in the accessibility tree.

Browser evidence: [20 November UI review](ui-review-20261120.md),
[23 November card review](layout-review-20261123.md), and
[26 November README captures](readme-screenshots-20261126.md). These viewport checks
do not verify physical mobile keyboards or actual screenreader speech. Historical
WAVE results concern the initial HTML, not the styled running application.
