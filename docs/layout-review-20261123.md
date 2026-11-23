# Codes and compact learning cards — visual review, 23 November 2026

Reviewed in the ChatGPT internal browser after the Mac was unlocked. Learning interactions used the canonical checkout served at `127.0.0.1:8017`, with isolated browser storage, so test answers did not alter the user's published-site learning records. The initial layout release was `f8aa49a`; the checkout also received the independent introduction-copy update during this review. Unrelated scientific-name data edits were excluded from this change.

## Coverage and result

| View | Cases inspected | Result |
| --- | --- | --- |
| Lookup details | Amsel, Höckerschwan, Felsentaube; CATE collision list on Temminckstrandläufer | Code badges and small keys are readable in light and dark themes. DDA keeps mixed case; unavailable origins are omitted. Scope notes stay visible. |
| Introductions | English/dark with one or two photos; German/light without photos; DDA/eBird code targets | Names, codes and reference topics remain distinguishable with the tighter spacing. Actions stay reachable. |
| Flashcard reveal and correct feedback | Amsel, English/dark, photos and German alternative name | Answer and reference codes are visible; photos can scroll without covering the fixed mobile controls. |
| Wrong-answer feedback | Felsentaube, German/light, no photos; answer resolving to Amsel | Submitted answer, its meaning, accepted names, scope and references remain distinct. |
| Long scientific question | Melanocorypha bimaculata, 320×568 | Heading wraps across two lines with no horizontal overflow; duplicate reference removed. |
| Short landscape | 844×390, open origin explanation | End of the notes and eBird link can scroll fully above the action bar. |

Inspected viewports: 1440×1000, 390×844, 320×568 and 844×390. DOM width measurements at the narrow sizes matched the viewport width. The browser briefly returned an intermediate scaled screenshot immediately after a viewport change; settled screenshots and DOM measurements were used for conclusions.

## Corrections found and rechecked

1. **Collision colours need a complete key.** A species with only scientific and banding badges can have English-name badges in its expanded collision list. The card's existing single legend now includes the origins of those collision badges too. Rechecked CATE with Anadyrknutt, Fahlente and Raubseeschwalbe.
2. **DDA scope was repeated.** Felsentaube's DDA introduction showed the same scope note before the answer and inside the answer block. The answer now omits the duplicate. The question and standalone references retain the scope. Rechecked at 320×568; one scope note remains.
3. **Scientific questions repeated their own name.** When the question itself is a scientific name, the reference block repeated that same name. That reference row is now omitted while codes and applicable German alternatives remain. Rechecked Melanocorypha bimaculata at 320×568.

Regression tests cover these cases. All 33 JavaScript test scripts and production JavaScript syntax checks passed after the corrections. The prior 57 Python tests and palette-contrast calculations belong to the initial layout implementation; these follow-up changes do not alter Python, data or colours.

## Screenshots

- [Desktop code colours — dark](layout-review-20261123/desktop-codes-dark.jpg), [light](layout-review-20261123/desktop-codes-light.jpg)
- [Mobile codes](layout-review-20261123/mobile-codes-light.jpg), [320 px wrapping](layout-review-20261123/small-codes-light.jpg)
- [DDA scope in lookup](layout-review-20261123/mobile-dda-scope-light.jpg), [DDA introduction after correction](layout-review-20261123/small-dda-introduction-de-light.jpg)
- [Collision before correction](layout-review-20261123/mobile-collision-before.jpg), [complete legend after correction](layout-review-20261123/mobile-collision-fixed.jpg)
- [Desktop introduction](layout-review-20261123/desktop-introduction-en-dark.jpg), [mobile introduction](layout-review-20261123/mobile-introduction-en-dark.jpg)
- [Flashcard reveal](layout-review-20261123/mobile-flashcard-en-dark.jpg), [correct feedback](layout-review-20261123/mobile-feedback-en-dark.jpg), [wrong feedback](layout-review-20261123/desktop-wrong-feedback-de-light.jpg)
- [Open origin explanation](layout-review-20261123/mobile-origin-en-dark.jpg), [landscape end of notes](layout-review-20261123/landscape-feedback-en-dark.jpg)
- [Long scientific introduction after correction](layout-review-20261123/small-scientific-introduction-fixed.jpg)

## Limits

This is desktop browser viewport testing, not a physical mobile-device test. The software keyboard, actual screenreader speech, 200% browser zoom and forced-colour rendering were not verified in this pass. No claim of exact height savings is made; the redundant blocks were visibly removed and the remaining spacing was reviewed.
