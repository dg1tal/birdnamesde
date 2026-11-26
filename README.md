# BirdNames DE

Look up bird names and learn them with short, spaced-repetition practice rounds. The catalogue covers 994 species recorded in Germany, the Netherlands, the United Kingdom, Finland and France, with German, English, Dutch, French, Finnish and scientific names. The interface is available in German and English.

**[Open BirdNames DE](https://dg1tal.github.io/birdnamesde/)** — use it in your desktop or mobile browser, without an account.

## Features on mobile

The screenshots below show the current German interface, captured on 26 November 2026. They include the compact learning cards and current code legends; the name-copying view is shown below the gallery.

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Find names across languages</h3>
      <p>Search names and codes, then open a species to compare German, English, Dutch, French, Finnish and scientific names.</p>
      <a href="docs/screenshots/mobile-lookup.jpg"><img src="docs/screenshots/mobile-lookup.jpg" width="280" alt="Expanded Blaumeise lookup card with multilingual names, scientific and English eBird codes, DDA abbreviation and the collapsed name-copying control"></a>
    </td>
    <td width="50%" valign="top">
      <h3>Build a daily learning habit</h3>
      <p>Choose your region, season and languages. Daily rounds introduce a few new targets and bring back scheduled reviews.</p>
      <a href="docs/screenshots/mobile-daily-learning.jpg"><img src="docs/screenshots/mobile-daily-learning.jpg" width="280" alt="Mobile daily round with three new English bird names, collapsed settings and the current German autumn selection"></a>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>Practise bird names</h3>
      <p>Think first, then reveal the choices. Text input, flashcards and direct multiple choice are also available.</p>
      <a href="docs/screenshots/mobile-practice.jpg"><img src="docs/screenshots/mobile-practice.jpg" width="280" alt="Compact German-to-English think-first question for Eichelhäher with four revealed choices and the mobile progress and action bars"></a>
    </td>
    <td width="50%" valign="top">
      <h3>Keep track of your progress</h3>
      <p>View started species, secure learning targets and scheduled reviews using independent language and method selectors.</p>
      <a href="docs/screenshots/mobile-progress.jpg"><img src="docs/screenshots/mobile-progress.jpg" width="280" alt="Mobile learning statistics with language, code-system and method selectors, three started species, no secure names and the example's next scheduled review"></a>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>Understand each answer</h3>
      <p>Feedback separates the accepted name, scientific reference and official codes. Pictures and their credits follow, with further explanations below.</p>
      <a href="docs/screenshots/mobile-feedback.jpg"><img src="docs/screenshots/mobile-feedback.jpg" width="280" alt="Complete correct Eichelhäher answer with Eurasian Jay, Garrulus glandarius, eBird and DDA codes, a credited photo, folded explanations and the Next action"></a>
    </td>
    <td width="50%" valign="top">
      <h3>Save birds for later</h3>
      <p>Keep a personal species list and practise it with your choice of languages and answer method.</p>
      <a href="docs/screenshots/mobile-saved-species.jpg"><img src="docs/screenshots/mobile-saved-species.jpg" width="280" alt="Mobile saved-species list containing Blaumeise and the language and answer-method controls for practising it"></a>
    </td>
  </tr>
</table>

Captured on 26 November 2026 at 430 × 932 CSS pixels, in the light theme, using a separate local preview. Lookup is scrolled to show the species details; the feedback card fits in one viewport. Statistics show a completed three-question example round with Eichelhäher, Tannenmeise and Kampfläufer; the next-review date belongs to that example. These are unedited browser viewport captures, not physical-device tests. Click an image to view it at full size. See the [capture record](docs/readme-screenshots-20261126.md) for states and verification limits.

Photo visible in the feedback screenshot: I, Luc Viatour, [Eurasian Jay (*Garrulus glandarius*)](https://commons.wikimedia.org/wiki/File:Garrulus_glandarius_1_Luc_Viatour.jpg), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

## Copy bird names

At the bottom of a lookup species card, open **All names for copying** and choose **Copy names**. The text starts with the current scientific name, followed by all available name languages, including German alternatives and distinct British/US English names. It includes languages hidden by the lookup display settings. If clipboard access is unavailable, the app selects the text for manual copying.

<a href="docs/screenshots/mobile-copy-names.jpg"><img src="docs/screenshots/mobile-copy-names.jpg" width="280" alt="Expanded Amsel name-copying section with Turdus merula, Schwarzdrossel, British and US English names, Dutch, French and Finnish names, and the successful copy confirmation"></a>

The Amsel example is scrolled to the copying section. All seven lines are visible, and **Namen kopiert.** (“Names copied”) confirms the clipboard action.

## Save birds for later practice

Use **Save species** on a species card or in search-result details, then open **Saved species** from Lookup or Learn. A saved-species round uses only that list, independently of regional, seasonal and progress filters. It never replaces an existing paused round.

## How learning works

Choose the names or codes you want to practise, your question and answer languages, and a region. Seasonal frequency groups help select new species; current notable reports can add species to that selection. These are occurrence-based learning filters, not sighting predictions.

Your daily round prioritises due reviews and introduces at most three new names or codes per day across languages and methods. New targets are introduced before they are tested. Started targets stay eligible for scheduled reviews when you change your region or season. You can also build a custom round or continue practising after the daily round.

Choose text input, flashcards, multiple choice or “Think first”, which initially hides the choices. Photos appear during introductions and after answers when pictures are enabled. Statistics distinguish recognition, free recall and self-assessment; progress in one method or language direction does not automatically count as secure knowledge in another.

German alternatives are visible during introductions, answer reveals and feedback whenever German is the question or answer language. Ambiguous alternatives such as Spatz are labelled and shown separately from accepted answers; historical names and source notes remain available in disclosures.

On phones, **Display** groups interface-language and theme controls. **Learning method** and **Data & privacy** include collapsible contents lists. The app explains its scheduling rules and research references under **Learning method**. See [learning, languages and storage](docs/learning-and-storage.md) for implementation details.

## Privacy and limits

Learning progress is stored in your browser on your device. There is no authentication, analytics, server-side progress database or automatic account/device sync. Browser privacy settings or storage cleanup can remove local progress.

Use **Statistics → Back up and restore progress** to export a portable backup. Backups use `.json`, or `.json.gz` for large exports when browser compression is available. Importing a checked backup replaces the destination browser’s progress after confirmation. Saved species are included in version-3 backups; older backups retain the destination browser’s saved-species list. Other preferences and paused rounds are not included. Before changing browsers or site domains, export from the old location first.

There is no promised offline mode. The app loads its data and photos from static hosting; regional eBird updates run through GitHub Actions, and the browser does not contact the eBird API. Country-list membership records occurrence, including historical rarities and some introduced or escaped birds; it does not establish breeding status. See the in-app **Data & privacy** page for coverage, source periods and limitations.

## Run locally and check

The app has no runtime dependencies or build step. From the repository root, serve `dist/`:

```sh
python3 -m http.server 8000 --directory dist
```

Open [localhost:8000](http://localhost:8000/). No npm install is needed. Run the baseline application check with:

```sh
npm test
```

CI also runs the complete Node/Python suites, data reproducibility checks and photo validation before deployment. See [development and verification](docs/development.md) for the full commands and CI runtime versions. The [Pages workflow](.github/workflows/pages.yml) publishes `dist/` from `main`; [deployment and regional data](docs/deployment-and-regions.md) describes hosting and refresh configuration.

## Data sources and acknowledgement

Taxonomy and common names use the reviewed eBird/Clements 2025 catalogue. Official quick codes come from the 2026 workbook, with documented exceptions and concept-verified scientific-name updates. DDA breeding-survey abbreviations use the interactive DDA web list, are checked in the daily publication workflow, and have separate learning progress from eBird codes. National lists cover DE, NL, GB, FI and FR; regional occurrence lists and current notable reports use the eBird API. Scientific-name explanations give source languages, word roots and naming histories for the displayed scientific name, including the reviewed 2026 combinations, with linked references principally from Jobling (2010). Dutch and French cover all 994 species; Finnish covers 986. Missing names exclude a species from the affected learning pair rather than falling back to another language. Photos and illustrations have individual source credits and licences.

**The eBird Basic Dataset (EBD) itself is not included in this repository.**
Neither the country download archives nor raw observation or sampling-event
records are published here. The seasonal data files contain derived aggregates:
regional species groups and summary checklist counts.

The seasonal frequency groups use the **eBird Basic Dataset (EBD)**: September 2026
for Germany, the Netherlands and the UK; October 2026 for Finland and France.
All five countries use 2021–2025. Regional occurrence lists and current notable reports use the eBird API.

Source datasets used to calculate the seasonal aggregates:

> eBird Basic Dataset. Version: EBD_relSep-2026. Cornell Lab of Ornithology, Ithaca, New York. Sep 2026.

> eBird Basic Dataset. Version: EBD_relOct-2026. Cornell Lab of Ornithology, Ithaca, New York. Oct 2026.

General eBird project reference:

Sullivan, B.L., C.L. Wood, M.J. Iliff, R.E. Bonney, D. Fink, and S. Kelling. 2009. eBird: a citizen-based bird observation network in the biological sciences. Biological Conservation 142: 2282-2292.
[DOI](https://doi.org/10.1016/j.biocon.2009.05.006).

We thank the Cornell Lab of Ornithology for providing the eBird data and the eBird
contributors for their observations. The source EBD is available through the
[official eBird data access page](https://science.ebird.org/en/use-ebird-data/download-ebird-data-products).
Derived data retain the [eBird Data Access Terms of Use](https://www.birds.cornell.edu/home/ebird-data-access-terms-of-use/),
including the full terms distributed in `dist/ebd-terms.txt`; they are excluded from
the code's MIT licence. Attribution does not imply endorsement by Cornell or eBird.

Source records, workbook links, DDA selection provenance, code policy, scientific-name references and image acquisition details are collected in [data sources and reproduction](docs/data-sources.md). The [EBD import guide](docs/ebd-import.md) documents seasonal aggregate calculation and source terms.

## License and third-party material

The original application code in `dist/` (HTML, CSS and JavaScript), the code in `scripts/`, and project configuration are licensed under the [MIT License](LICENSE), copyright (c) 2026 DG1TAL. A copy of the license in `dist/LICENSE` accompanies the hosted application. This grant does not cover the JSON datasets, images, or other third-party material in this repository.

The photos and illustrations in `dist/images/` retain their individual licenses and attribution requirements, recorded per image in `dist/photos.json`. The eBird/Clements taxonomy, common names, quick codes, EBD-derived seasonal groups and API-derived regional data are sourced from Cornell Lab of Ornithology/eBird; this project's MIT license does not grant rights to those materials. Review the [eBird API terms](https://www.birds.cornell.edu/home/ebird-api-terms-of-use/) and [eBird data access terms](https://www.birds.cornell.edu/home/ebird-data-access-terms-of-use/) before reusing or redistributing them. Other source material and editorial provenance are documented in [data sources and reproduction](docs/data-sources.md).

## Further documentation

| Guide | Contents |
| --- | --- |
| [Development and verification](docs/development.md) | Modules, full checks, optional tooling, photo cache and accessibility verification |
| [Learning, languages and storage](docs/learning-and-storage.md) | Scheduling, language contexts, lesson recovery, backups and storage compatibility |
| [Data sources and reproduction](docs/data-sources.md) | Taxonomy, catalogue, names, codes, photo provenance and reproduction commands |
| [Deployment and regional data](docs/deployment-and-regions.md) | GitHub Pages, regional API refresh, seasonal selection and current reports |
| [Private EBD import](docs/ebd-import.md) | Aggregate calculation, review and activation; raw records remain outside Git |
| [Search design](docs/search-design-20261108.md) | Multilingual lookup ranking and match provenance |
| [App-wide UI review · 20 November](docs/ui-review-20261120.md) | Mobile navigation, controls, answer cards, contents lists and verification limits |
| [Card layout review · 23 November](docs/layout-review-20261123.md) | Compact learning cards, code legends, collision lists and viewport screenshots |
| [Documentation review · 26 November](docs/documentation-review-20261126.md) | Current catalogue counts, copying, code display and documentation verification |
| [README screenshots · 26 November](docs/readme-screenshots-20261126.md) | Current gallery, copying example, capture states and verification limits |

Dated reviews in `docs/` record the scope and results of individual releases. Start with the thematic guides above for current behavior.
