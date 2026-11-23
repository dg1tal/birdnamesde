# Card layout preparation — 23 November 2026

Status: implementation prepared and automated checks passed. The user approved committing and publishing before visual browser review; that review remains open until the Mac is unlocked. No browser preview or screenshots were attempted.

## Prepared changes

- Lookup cards and learning references use one wrapping row for scientific, English eBird, banding and available DDA codes. A small colour key below the row labels the origins that are present. Existing provenance tooltips and screenreader text remain attached to each code.
- DDA has a separate blue palette in light and dark mode and retains its original mixed case. Missing DDA data leaves no empty badge or legend entry. DDA scope notes remain visible below the shared row.
- Answer cards use the same key, restricted to their accepted code system. An eBird answer does not display a DDA code as an accepted answer, and a DDA answer does not display eBird answers.
- A code with both scientific and banding origins remains a single split-colour badge, with both origins in the key and a text explanation. The current catalogue contains no such dual-origin species badge; this case is covered by the existing synthetic regression fixture. Cross-species code collisions retain their individual provenance.
- Learning questions, introductions, feedback and reference blocks have smaller vertical gaps and padding. Scientific reference labels and names share a line when space permits. Primary headings have slightly lower maximum sizes. Collapsed note rows retain a 44 px minimum target, and fixed action controls and photo size calculations are unchanged.
- The HTML entry point has new application and stylesheet version URLs for the eventual release.

## Checks completed

- All 33 JavaScript test scripts passed, including the main suite, bilingual card rendering, DDA answer isolation, collisions, German alternatives, storage/recovery, photo layout and module versions.
- All 57 Python unit tests passed.
- All production JavaScript files passed syntax checks.
- The new DDA text/background contrast calculates to 7.00:1 in light mode and 8.39:1 in dark mode. All four origin palettes exceed 4.5:1 in both themes. These are palette calculations, not rendered-browser verification.
- `git diff --check` passed.

The DDA markup regression tests now verify that all codes share one row, each reference has one legend, unavailable origins are omitted, and answer legends stay restricted to their own system. The lookup test harness includes the shared DDA rendering helpers.

## Browser review to finish

Review locally from this checkout when the browser is available:

1. At 1440×1000, 390×844 and 320×568, inspect lookup details for Amsel (all four origins), Höckerschwan (no English-name code), Felsentaube (DDA scope note), and Anadyrknutt with the CATE collision list open.
2. Check German and English interfaces in both themes: badge/legend colour agreement, small-text readability, mixed-case DDA codes, wrapping, and absence of horizontal overflow. Also inspect 200% zoom and forced colours.
3. In learning, inspect an introduction, a revealed flashcard, correct feedback and wrong feedback, with and without photos. Include a long scientific name, German alternatives and an open name-origin explanation. Verify that the reduced spacing still separates question, answer and reference content clearly.
4. Check both eBird and DDA code targets. Confirm that answer cards only present accepted answers for the selected system and that Felsentaube's scope remains understandable.
5. On a short landscape viewport, verify scrolling, reachable note disclosures and the fixed action bar. Check text input with the software keyboard when possible. Record screenshots and any spacing adjustments; do not infer height savings from static CSS alone.

Publish these changes to `github/main` with automated checks, confirm the GitHub Pages workflow and verify the published asset versions. Keep the unrelated `docs/security-review-20261029.md` out of the commit. Any visual-review fixes receive their own checked commit and deployment.
