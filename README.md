# Brandon Chen Academic Website

Static academic website for Brandon Chen.

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
- `content/publications/` is the legacy folder name for working-paper cards and subpages.
- `content/team/` contains team member cards and profile pages.
- `content/media/` contains media cards and subpages.
- `content/news/` contains news cards and subpages.
- `content/blog/` contains blog cards and subpages.
- `content/recruitment/` contains recruitment cards and position application subpages.

## Research Profile

`research/profile/` is a Pure/Scopus-inspired researcher dashboard using this site's own visual system. Brandon's profile shows working-paper status without claiming publications, citations, or an h-index. External researcher profiles may display sourced bibliometrics.

- Match a team member to research records with `publicationNames` or `profileSlugs`.
- Add `keywords` to working-paper JSON files to feed the fingerprint calculation.
- Fingerprints use a documented weighted model: profile interest `4`, paper keyword `6`, title phrase `3`, title token `1.5`, abstract phrase `0.7`, and abstract token `0.35`. Scores are normalized to the strongest topic on that profile.

## Free profile and working-paper management

The deployed website is fully static and does not require Firebase, a database, cloud storage, authentication, or a paid plan. The control room at `admin/` links to the editable GitHub content and explains the VS Code workflow.

- Researcher profiles live in `content/team/*.json`.
- Working-paper records live in `content/publications/*.json`.
- Profile photos live in `assets/`.
- Optional paper PDFs can live in `assets/papers/`.
- Copy starting files from `content/templates/`.

After editing, run `node tools/generate-pages.js`. The generator rebuilds `js/site-data.js` and the public pages. Brandon's working-paper count, activity, and fingerprints update automatically from the JSON records.

Brandon's central configuration is `content/team/brandon-chen.json`. Update the LinkedIn URL, biography, research interests, similar profiles, and experience link there.

Commit and push the generated changes to `main`; the included GitHub Pages workflow publishes them at no hosting cost.

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
C:\tmp\blxchen.github.io-deploy
```

See `EDITING-GUIDE.md` for the full edit, generate, commit, and push workflow.
