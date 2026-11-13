# Visual consistency and phone layout — 13 November 2026

The interface now uses a shared warm background, pine-green actions, consistent
surface borders, corner radii, headings and spacing in light and dark mode.
A small vector bird mark and matching navigation icons connect the app's header
to its subject. Lookup, learning and statistics share a heading treatment.

Lookup has a distinct search surface, quieter filters and a consistent saved-list
link. Species cards group additional names into responsive columns and put the
save action beside the primary name. Existing code-origin colours are preserved.
Statistics places its three context selectors in one responsive settings group.

The daily round precedes optional learning settings in both DOM and visual order.
On wide screens they sit side by side; phones use a single column. Explanatory
round text sits in a native disclosure. On phones, language and theme choices
share a labelled Display disclosure; desktop keeps those choices visible. Escape
closes the phone disclosure and restores focus. Changing breakpoints preserves
access to the controls. Phone selects use 16px text, and narrow language settings
stack vertically. Existing keyboard focus, study viewport handling, fixed phone
actions and adaptive picture sizing remain in use.

## Verification

- All Node application suites passed, including locale, accessibility, lookup,
  learning, backup, module-version and study-viewport checks.
- All 47 Python tests passed, plus catalogue, scientific-name and seasonal-data
  reproducibility checks, private-EBD checks and local image validation.
- JavaScript syntax and Git whitespace checks passed.
- Browser review covered 320, 360, 390 and 430px phone widths and the 1280px
  desktop layout. Lookup/results, dark species details, statistics, expanded
  learning/species settings, the display menu and DE/EN interface were checked.
  Measured reviewed phone views had no document-width overflow. Main navigation
  and display controls were at least 44px high; study actions were at least 48px.
- A study introduction, answer choices, correct-answer feedback with a picture,
  and pausing were exercised at phone size. No browser errors were reported.
- Core text, secondary text and primary-action colour pairs measured at least
  5.4:1 contrast in both themes. Code badge colours retain the existing scheme.

These checks use browser viewport overrides, not physical iOS/Android devices;
actual software keyboards and screenreader speech were not verified anew.


## Answer-card follow-up

The answer area now separates the accepted answer from a consistent reference
block for German alternatives, the scientific name and entry codes. When German
is either the question or answer language, accepted German alternatives are
visible without opening a disclosure, including introductions and revealed
flashcards. For example, Ringeltaube also shows Waldtaube in both directions.
Historical and ambiguous names retain their qualifications in the source notes.

The lower reference area no longer has an outer More information disclosure.
Name meaning, German names with sources, and the learning context are sibling
sections with consistent left alignment and disclosure controls. Genus and epithet
use compact rows on desktop and stack on phones. Source explanations and their
links are grouped under the name they document. The eBird link has a separate
footer row. Picture attribution and licensing remain attached to the picture.

Verification exercised Ringeltaube in DE → EN text practice and EN → DE
think-first practice, including the introductions, completed feedback, visible
Waldtaube alias and opened origin/source sections. The updated answer renderer
checks also cover Kleiber/Spechtmeise, code learning, historical-name separation,
accepted alternative answers, flat disclosure structure and DE/EN labels.
Browser checks covered 320px and 390px phone layouts and desktop, light and dark
themes, with no horizontal document overflow in the reviewed states. Physical
mobile keyboards and screenreader speech were not retested. All Node suites,
47 Python tests, syntax, data reproducibility and image checks passed.

## Complete German-alternative display audit

The Haussperling/Spatz discrepancy came from reusing the accepted-answer list for
visible German alternatives. Spatz is documented as a current but ambiguous
vernacular name; Mauersegler/Turmschwalbe is an unambiguous alternative. Two other
current alternatives have the same ambiguity flag: Grünfink/Grünling and
Turmfalke/Rüttelfalke.

All three now appear without opening a disclosure when German is a question or
answer language. They sit outside the accepted-answer block, visibly labelled
ambiguous, with a short explanation that they are not unambiguous quiz answers.
The answer-acceptance policy and historical-name qualifications are preserved.

An exhaustive renderer audit covers all 47 current German alternatives across
34 species, both learning directions, both interface languages and every other
registered target language plus codes. It asserts that the names occur outside
any disclosure, ambiguity is labelled, unrelated language pairs do not acquire
German names, and showing an ambiguous name does not change accepted answers.

Browser verification at 390px additionally checked Haussperling/Spatz and
Mauersegler/Turmschwalbe through introductions, revealed flashcards and graded
feedback. Spatz was outside every disclosure for both DE → EN and EN → DE,
visibly marked ambiguous, while the accepted German answer remained Haussperling.
The reviewed phone states had no document-width overflow. All Node/Python suites,
syntax, data reproducibility, image and whitespace checks passed.
