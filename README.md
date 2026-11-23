# Brandon Chen Academic Website

Static personal academic website for Brandon Ling-Xuan Chen. This is an independent site, not an official university or laboratory website.

The eight primary tabs are Home, Research, Publications, Projects, Spotlight, People, About, and Contact. Existing CV, blog, news, media, recruitment, research profile, and earlier research URLs remain available.

The site is now English-only and built around easy content folders. Most edits happen in:

```text
content/
```

Add new cards or subpages by copying one `.json` file into the right folder, then run:

```powershell
node tools/generate-pages.js
```

That command rebuilds `js/site-data.js` and creates the matching `index.html` pages.

## Main Editing Files

- `content/site.json` controls homepage text, nav, page intros, profile links, stats, hero image, footer credit, and capability cards.
- Header logos are controlled by `profile.brand` in `content/site.json`.
- `content/research/` contains research interest cards and subpages.
- `content/research-areas/` contains research areas, contributor slugs, and related publication slugs. The Research dropdown is generated from records where `primary` is not `false`; connected topic pages still appear in the research index.
- `content/publications/` contains publication and manuscript records with their exact status.
- `content/projects/` contains project pages and homepage project cards.
- `content/spotlight/` contains dated research updates and homepage spotlight entries.
- `content/team/` contains team member cards and profile pages.
- `content/media/` contains media cards and subpages.
- `content/news/` contains news cards and subpages.
- `content/blog/` contains blog cards and subpages.
- `content/recruitment/` contains recruitment cards and position application subpages.

## Scientific dashboard and validation

`js/science/model.js` calculates a circular LEO pass in ECI coordinates, accounts for Earth rotation, derives range rate and geometric Doppler, converts ECEF positions into a local ENU skyplot, and computes a complex-signal STFT. `js/science/visualization.js` draws the graphs and pauses animation when the dashboard is out of view or the visitor requests reduced motion.

The spectrogram is an educational 2048 samples/s baseband demonstration. A modeled first-order Doppler tracking oscillator removes the large carrier shift before sampling. It is not a real satellite waveform or measured data.

The requested separate urban satellite-positioning concept image was not present among local assets. The urban GNSS card uses the existing Kaohsiung image until that asset is supplied.

Run the full local checks:

```powershell
node tools/generate-pages.js
node tools/test-science.js
node tools/test-site.js
node tools/test-research-profile.js
```

The generator validates required fields, duplicate slugs, relationships, dates, publication statuses, and referenced images. It also creates `sitemap.xml`.

## Contact delivery

GitHub Pages has no server-side form endpoint. The contact page validates fields, filters a honeypot field, and opens a draft in the visitor's email app. The visitor must send the draft. Direct email is always shown. To receive submissions without an email app, configure a hosted form endpoint and replace the `mailto:` handler in `bindContactForm()` in `js/main.js`; keep secrets out of the repository.

## Research Profile

`research/profile/` is a Pure/Scopus-inspired researcher dashboard using this site's own visual system. Brandon's profile shows publication records with their individual status, without claiming citations or an h-index. External researcher profiles may display sourced bibliometrics.

- Match a team member to research records with `publicationNames` or `profileSlugs`.
- Add `keywords` to publication JSON files to feed the fingerprint calculation.
- Fingerprints use a documented weighted model: profile interest `4`, paper keyword `6`, title phrase `3`, title token `1.5`, abstract phrase `0.7`, and abstract token `0.35`. Scores are normalized to the strongest topic on that profile.

## Free profile and publication management

The deployed website is fully static and does not require Firebase, a database, cloud storage, authentication, or a paid plan. The control room at `admin/` links to the editable GitHub content and explains the VS Code workflow.

- Researcher profiles live in `content/team/*.json`.
- Publication records live in `content/publications/*.json`.
- Profile photos live in `assets/`.
- Optional paper PDFs can live in `assets/papers/`.
- Copy starting files from `content/templates/`.

After editing, run `node tools/generate-pages.js`. The generator rebuilds `js/site-data.js` and the public pages. Brandon's publication count, activity, and fingerprints update automatically from the JSON records.

Brandon's central configuration is `content/team/brandon-chen.json`. Update the LinkedIn URL, biography, research interests, similar profiles, and experience link there.

Commit content changes to `main`. The GitHub Actions workflow regenerates the pages; GitHub Pages then serves the updated site.

## Run Locally

```powershell
py -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

## Deploy

The deployed GitHub Pages repo is:

```text
blxchen/blxchen.github.io on GitHub
```

See `EDITING-GUIDE.md` for the full edit, generate, commit, and push workflow.
