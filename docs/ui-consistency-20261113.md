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
