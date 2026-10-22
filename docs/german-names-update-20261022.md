# German alternative and historical names — 22 October 2026

Added a separately maintained editorial overlay in `dist/german-names.json`: 60 sourced names for 38 species (47 current alternatives and 13 historical names). The eBird-based `dist/species.json`, species IDs, primary German/English/scientific names, codes, existing aliases and occurrence data are unchanged. Photo records and assets are unchanged.

Names appear directly below the primary German heading in lookup, in flashcard reveals, and in graded feedback for every learning method. Learning names are centered. Source disclosures explain usage and link to the underlying source. Names are searchable with the existing multi-token/umlaut normalization; English-name and code answer acceptance is unchanged. Previously saved lessons resolve against the current species records and therefore receive the new name display too.

Classification is conservative. An older name is not automatically obsolete: current LBV usage supports Spechtmeise, Fischreiher, Schneefink, Schwarzdrossel, Turmschwalbe and Haubensteißfuß as traditional alternatives. Historical entries require explicit former-use evidence or a dated scholarly attestation. Schuhu is specifically *veraltend*, not claimed extinct. Finkenkönig remains an alternative because past-tense explanation alone is weak evidence of obsolescence. Spatz, Grünling and Rüttelfalke carry ambiguity notes. Generic, taxonomically uncertain or subspecies-only expressions were excluded.

The reviewed source decisions and rejected candidates are retained in `data/german-name-review.json`; per-name sources, explanations and dates are included in the downloadable overlay. No taxonomic equivalence or geographic region was inferred solely from name appearance.

Checks passed: all 313 species search and accepted-answer/repetition/import checks; lesson restoration; photo cache; all 415 photo/illustration provenance/hash checks; new overlay integrity, 60 alias/combined searches, umlaut transliteration and English/code answer boundaries; JavaScript syntax and whitespace checks. Browser QA: Distelfink and Augsburger Nachtwächter find Stieglitz; source disclosure; no German aliases before flashcard reveal, aliases in reveal and graded feedback; photo hiding until grading preserved; text feedback displays centered Spechtmeise; mobile lookup/source and restored lesson at 320/390/768 pixels without horizontal overflow. No new physical-device test.

Screenshot: `birdnames-german-names-20261022.jpg`.
