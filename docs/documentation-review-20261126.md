# Documentation review · 26 November 2026

Reviewed the README and the thematic development, learning/storage, data-source
and deployment guides against application commit `0058ab6`, its tracked datasets
and the current Pages workflow. Earlier dated reports retain their original
release scope and verification results.

## Corrections and additions

- Corrected current coverage to 994 catalogue species, 986 Finnish names (eight
  missing), 994 French names and scientific-name explanations for all 994 species
  in German, English and Dutch. The README already carried the correct totals.
- Updated the round-recovery example to 5,964 queue entries and documented its
  formula, `speciesCount × 2 × (1 + RULES.maxRetries)`. Added DDA to the overview
  of independent progress-record targets.
- Documented the collapsed name-copying section at the bottom of lookup cards:
  scientific name first, all available languages, German alternatives, distinct
  British/US English names and the manual fallback when clipboard access fails.
- Replaced the obsolete purple-only dual-origin code description with the
  split-colour badge. Documented DDA blue, per-origin display grouping, collision
  origins in the legend and answer-system separation. Stored code ranking and
  accepted values are unchanged.
- Linked the 23 November card-layout review alongside the broader 20 November UI
  review. Labelled the README screenshots as 20 November captures that predate
  later layout changes and name copying, and retained their original provenance.
- Updated the thematic guides' review stamp to identify the application revision
  used for this check.

## Verification and limits

- Passed `npm test`, every `scripts/test-*.mjs` suite and all 65 Python unit tests.
  These include language coverage, bounded lesson recovery, bilingual code
  rendering, collision provenance and clipboard/manual-copy behavior.
- Passed catalogue validation, DDA/scientific-name/EBD reproducibility checks,
  private-EBD checks, photo licence/hash validation and production JavaScript
  syntax checks. Application and dataset files in `dist/` and `data/` are unchanged.
- Checked local Markdown/HTML file references, documented catalogue/language
  totals, the queue-limit formula, personal-path policy and Git whitespace.
- This is a documentation update with automated verification. No new screenshots,
  browser interaction, physical-device or accessibility audit was performed;
  external source links were not revalidated. The dated UI reports retain their
  own verification limits.
