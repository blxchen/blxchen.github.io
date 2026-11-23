# Editing Guide

The site is English-only for now.

Most content lives in simple JSON files inside:

```text
content/
```

You usually do not need to edit `js/site-data.js` by hand. It is generated from the `content/` folder.

## Basic Workflow

1. Copy an existing `.json` file in the right `content/` folder.
2. Rename the copied file.
3. Edit the fields inside it.
4. Run the generator:

```powershell
node tools/generate-pages.js
```

5. Preview locally:

```powershell
py -m http.server 8080
```

6. Open:

```text
http://localhost:8080/
```

## Folder Map

- Homepage profile and page intros: `content/site.json` (the eight-tab nav is assembled by the generator)
- Research interests: `content/research/`
- Research areas and contributor mappings: `content/research-areas/`
- Publications: `content/publications/`
- Projects: `content/projects/`
- Spotlight: `content/spotlight/`
- Static content control room: `admin/`
- Team members: `content/team/`
- New record starters: `content/templates/`
- Media items: `content/media/`
- News posts: `content/news/`
- Blog posts: `content/blog/`
- Recruitment positions: `content/recruitment/`

## Important Rules

- Every item needs a unique `slug`.
- The `slug` becomes the page URL.
- Use lowercase words with hyphens for slugs, like `new-blog-post`.
- Do not manually write `url`; the generator creates it.
- Use `order` to control card order. Lower numbers show first.
- Arrays use square brackets, like `["AI", "Sensing"]`.
- Paragraph lists also use square brackets.
- Put a comma after each field except the last one.

## Add A Blog Post

Copy any file in:

```text
content/blog/
```

Example new file:

```text
content/blog/my-new-post.json
```

Paste this:

```json
{
  "slug": "my-new-post",
  "date": "2026-08-08",
  "title": "My New Post",
  "dek": "One short preview sentence for the blog list.",
  "body": [
    "First paragraph of the post.",
    "Second paragraph of the post."
  ],
  "order": 1
}
```

Run:

```powershell
node tools/generate-pages.js
```

New page:

```text
blog/my-new-post/
```

## Add a publication

Open the site's **Content Control Room** at `/admin/`. Fill in **Add a publication** and choose its research areas and contributor profiles. The form downloads a JSON file. Upload that file to `content/publications/` in the GitHub repository and commit it. The GitHub workflow runs the generator and creates the public page.

You can also copy `content/templates/publication.example.json` into `content/publications/` and edit it manually. Use `type` and `status` to state exactly whether a record is in preparation, under review, accepted, or published. The site shows this status on the publication and research-area pages. Add `doi` or `paperUrl` only when you have a real public link.

`profileSlugs` links the record to researcher profiles. `areaSlugs` links it to research areas. Both are arrays of slugs. If an area should show a publication that has no `areaSlugs`, add its slug to that area's `publicationSlugs` list.

The public page URL is `research/publications/<slug>/`.

## Add or edit a research area

Each area is one file in `content/research-areas/`. Copy an existing file to add another, then edit its `slug`, `title`, `dek`, `image`, `tags`, `body`, and `order`.

- `memberSlugs` lists contributor profile slugs from `content/team/`.
- `publicationSlugs` lists publication slugs from `content/publications/`.
- A new publication can also select the area with its own `areaSlugs` field.

The generator checks these references and stops with an error if a slug is misspelled. Run `node tools/generate-pages.js` to preview locally; on GitHub, committing content JSON runs it automatically.
## Add a project, spotlight item, or person

Copy `content/templates/project.example.json` to `content/projects/<slug>.json` for a project. Its `featured` flag controls whether it appears on the homepage. `areaSlugs`, `publicationSlugs`, and `contributorSlugs` create links to existing records. The generated page is `projects/<slug>/`.

Copy `content/templates/spotlight.example.json` to `content/spotlight/<slug>.json` for a dated update. The generated page is `spotlight/<slug>/`.

Copy `content/templates/person.example.json` to `content/team/<slug>.json` for a research profile. State the person's verified role and affiliation; an external collaborator is not a member of an independent lab by default. The generated page is `people/<slug>/`; earlier `research/team/` URLs remain valid.

Research dropdown entries come from `content/research-areas/*.json`. A new area JSON automatically creates its own page and dropdown link unless `"primary": false` marks it as a connected topic; those pages still appear in the research index. The generator checks duplicate slugs, required fields, images, dates, publication statuses, and related record slugs. Run `node tools/generate-pages.js` and resolve any named content errors before committing.

Five broad directions appear in the dropdown; four earlier focused topic pages remain available in the research index.

## Scientific dashboard

The homepage graphs are computed in `js/science/model.js` and rendered in `js/science/visualization.js`. The model uses a circular 550 km LEO pass, an 11.45 GHz carrier, Earth rotation, an ECEF-to-ENU skyplot, and an STFT of synthetic complex baseband samples. The visible spectrogram is frequency centered after modeled first-order Doppler tracking; it is not a measured waveform. Run `node tools/test-science.js` after changing equations or sampling parameters.

## Contact form delivery

The static GitHub Pages site has no form backend. The form validates the visitor's fields and opens a draft in their email application. The visitor must send that draft. If you want server delivery, create an endpoint with a hosted form service, configure its spam protection, and replace the `mailto:` action in `bindContactForm()` in `js/main.js`. Do not commit service secrets. Keep the direct email link as a fallback.

## Add A Research Interest

Copy any file in:

```text
content/research/
```

Example:

```json
{
  "slug": "new-research-topic",
  "number": "04",
  "title": "New Research Topic",
  "dek": "Short one-sentence description.",
  "image": "assets/my-research-image.jpg",
  "tags": ["Tag One", "Tag Two"],
  "body": [
    "First paragraph.",
    "Second paragraph."
  ],
  "order": 4
}
```

Run:

```powershell
node tools/generate-pages.js
```

New page:

```text
research/new-research-topic/
```

The optional `image` field appears on the homepage research-direction cards. Put the image in `assets/`, then point to it like:

```json
"image": "assets/my-research-image.jpg"
```

## Add A Team Member

Copy any file in:

```text
content/team/
```

Copy `content/templates/research-profile.example.json` or use this minimal example:

```json
{
  "slug": "new-team-member",
  "name": "New Team Member",
  "role": "Research Assistant",
  "bio": "Short biography.",
  "photo": "assets/new-team-member.jpg",
  "publicationNames": ["New Team Member"],
  "interests": ["Topic One", "Topic Two"],
  "order": 3
}
```

Run:

```powershell
node tools/generate-pages.js
```

New page:

```text
research/team/new-team-member/
```

The same researcher also appears in the Research Profile card directory. Publications and other research records connect to the profile through `profileSlugs`, `publicationNames`, or a matching author name. Those links automatically recalculate the profile fingerprint and activity.

For Brandon, update `content/team/brandon-chen.json` to change the photo path, LinkedIn URL, biography, research interests, CV text, similar profiles, and experience link in one place. To add a portrait later, place the image in `assets/` and change the `photo` value.

## Add A News Post

Copy any file in:

```text
content/news/
```

Example:

```json
{
  "slug": "new-announcement",
  "date": "2026-08-08",
  "title": "New Announcement",
  "dek": "Short announcement summary.",
  "body": [
    "Full announcement text."
  ],
  "order": 1
}
```

Run:

```powershell
node tools/generate-pages.js
```

New page:

```text
news/new-announcement/
```

## Add A Media Item

Copy any file in:

```text
content/media/
```

Example:

```json
{
  "slug": "new-media-item",
  "date": "2026-08",
  "title": "New Media Item",
  "dek": "Short media description.",
  "body": [
    "More details about the media item."
  ],
  "order": 1
}
```

Run:

```powershell
node tools/generate-pages.js
```

New page:

```text
media/new-media-item/
```

## Add A Recruitment Position

Copy the reusable template:

```text
content/templates/recruitment.example.json
```

Save the copy in `content/recruitment/` with a new filename, then edit every placeholder. The template includes the fields rendered on recruitment detail pages:

```json
{
  "slug": "new-opportunity",
  "title": "New Opportunity",
  "type": "Research collaboration",
  "location": "Remote / Hong Kong",
  "deadline": "Rolling",
  "dek": "Short description for the recruitment card.",
  "tags": ["Research", "Prototype", "Writing"],
  "body": [
    "First paragraph about the role.",
    "Second paragraph about the work."
  ],
  "perks": ["A realistic collaboration benefit."],
  "requirements": ["A genuine minimum requirement."],
  "fitIf": ["A trait or interest that makes someone a good fit."],
  "preferred": ["A useful but non-mandatory skill."],
  "engagementNote": "Clarify employment status, funding, attribution, and authorship expectations.",
  "order": 1
}
```

Run:

```powershell
node tools/generate-pages.js
```

New page:

```text
get-involved/recruitment/new-opportunity/
```

Each recruitment detail page automatically includes an application form. When submitted, it opens an email addressed to:

```text
chen.brandon1213@gmail.com
```

## Edit Homepage, Nav, About, CV, Contact

Open:

```text
content/site.json
```

Common sections:

- `contact`: email and location.
- `profile`: name, title, short bio, headshot, hero image, links, stats.
- `profile.brand`: header logo paths, header wordmark, and header subtitle.
- `homepage`: status cards, tabs, and capability cards.
- `nav`: header navigation links.
- `pages`: page titles, intros, about text, research experience timeline, and contact intro.

After editing:

```powershell
node tools/generate-pages.js
```

## Add A Homepage Capability Card

Open:

```text
content/site.json
```

Find:

```json
"capabilities": [
```

Copy one full block inside that list and paste it below the others. Example:

```json
{
  "number": "05",
  "icon": "orbit",
  "title": "New direction",
  "copy": "One or two sentences describing the direction.",
  "keywords": [
    "Keyword one",
    "Keyword two",
    "Keyword three"
  ],
  "linksLabel": "Selected pages",
  "links": [
    {
      "label": "Research page",
      "href": "research/"
    },
    {
      "label": "Related writing",
      "href": "blog/"
    }
  ]
}
```

Available icons:

```text
orbit
target
signal
shield
```

Then run:

```powershell
node tools/generate-pages.js
```

## Change The Homepage Backdrop

Put the new image in:

```text
assets/
```

Then update `profile.heroImage` in `content/site.json`:

```json
"heroImage": "assets/my-homepage-photo.jpg"
```

If the image needs credit, update `profile.heroCredit` in the same file.

## Change The Headshot

Put your image here:

```text
assets/headshot.jpg
```

In `content/site.json`, change:

```json
"headshot": "assets/headshot.jpg"
```

Then run:

```powershell
node tools/generate-pages.js
```

## Change The Header Logos

The header has two editable logo slots.

Replace these files:

```text
assets/logo-left-placeholder.svg
assets/logo-right-placeholder.svg
```

Or point to different files in `content/site.json`:

```json
"brand": {
  "leftLogo": "assets/my-left-logo.png",
  "rightLogo": "assets/my-right-logo.png",
  "wordmark": "Brandon",
  "subtitle": "Independent Research & Navigation"
}
```

Then run:

```powershell
node tools/generate-pages.js
```

## Homepage Team Slots

The homepage shows the first two files from:

```text
content/team/
```

To change the homepage team slots, edit the `order` field in each team member file. The two lowest `order` values show on the homepage.

Optional team photos can be added like this:

```json
{
  "slug": "new-team-member",
  "name": "New Team Member",
  "role": "Research Assistant",
  "bio": "Short biography.",
  "photo": "assets/new-team-member.jpg",
  "order": 1
}
```

Then run:

```powershell
node tools/generate-pages.js
```

## Commit To GitHub

The local Git checkout for the deployed site is:

```text
C:\Users\Lilian CHan\Desktop\pntbrandon\deploy
```

Best workflow:

1. Edit files in the `deploy` checkout.
2. Run:

```powershell
node tools/generate-pages.js
```

3. Run tests, then commit and push:

```powershell
cd "C:\Users\Lilian CHan\Desktop\pntbrandon\deploy"
node tools/test-science.js
node tools/test-site.js
node tools/test-research-profile.js
git status
git add -A
git commit -m "Update website"
git push origin main
```

4. Check:

```text
https://blxchen.github.io/
```

## Common Problems

- New card does not appear: run `node tools/generate-pages.js`.
- Page URL is wrong: check the `slug`.
- JSON error: look for a missing comma or quote.
- Old page still exists after deleting an item: delete the old generated folder too.
- Git says nothing to commit: check that edits were made in the `deploy` checkout.
