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

- Homepage, nav, page intros: `content/site.json`
- Research interests: `content/research/`
- Working papers: `content/publications/` (legacy folder name)
- Static content control room: `admin/`
- Team members: `content/team/`
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

## Add A Working Paper

Copy any file in:

```text
content/publications/
```

Copy `content/templates/publication.example.json` or use this minimal example:

```json
{
  "slug": "new-working-paper",
  "year": "2026",
  "type": "Working paper",
  "title": "Title of the Working Paper",
  "authors": "Brandon Chen",
  "venue": "Manuscript in preparation",
  "abstract": "Short abstract goes here.",
  "keywords": ["Topic One", "Topic Two"],
  "profileSlugs": ["brandon-chen"],
  "order": 1
}
```

Run:

```powershell
node tools/generate-pages.js
```

New working-paper page:

```text
research/publications/new-working-paper/
```

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

The same researcher also appears in the Research Profile card directory. Working papers and other research records connect to the profile through `profileSlugs`, `publicationNames`, or a matching author name. Those links automatically recalculate the profile fingerprint and activity.

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

The deployed GitHub Pages repo is:

```text
C:\tmp\blxchen.github.io-deploy
```

Best workflow:

1. Edit files in `C:\Users\Lilian CHan\Desktop\pntbrandon`.
2. Run:

```powershell
node tools/generate-pages.js
```

3. Copy the updated project files into the deploy repo.

For a full sync:

```powershell
Copy-Item "C:\Users\Lilian CHan\Desktop\pntbrandon\*" "C:\tmp\blxchen.github.io-deploy" -Recurse -Force
```

4. Commit and push:

```powershell
cd "C:\tmp\blxchen.github.io-deploy"
git status
git add -A
git commit -m "Update website"
git push origin main
```

5. Check:

```text
https://blxchen.github.io/
```

## Common Problems

- New card does not appear: run `node tools/generate-pages.js`.
- Page URL is wrong: check the `slug`.
- JSON error: look for a missing comma or quote.
- Old page still exists after deleting an item: delete the old generated folder too.
- Git says nothing to commit: make sure you copied changes into `C:\tmp\blxchen.github.io-deploy`.
