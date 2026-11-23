const fs = require("fs");
const path = require("path");

const scriptDir = __filename === "[stdin]" ? path.join(process.cwd(), "tools") : __dirname;
const root = path.resolve(scriptDir, "..");
const contentRoot = path.join(root, "content");
const sitePath = path.join(contentRoot, "site.json");

const collectionConfigs = [
  { key: "research", dir: "research", prefix: "research" },
  { key: "researchAreas", dir: "research-areas", prefix: "research/areas" },
  { key: "team", dir: "team", prefix: "research/team" },
  { key: "publications", dir: "publications", prefix: "research/publications" },
  { key: "projects", dir: "projects", prefix: "projects" },
  { key: "spotlight", dir: "spotlight", prefix: "spotlight" },
  { key: "media", dir: "media", prefix: "media" },
  { key: "news", dir: "news", prefix: "news" },
  { key: "blog", dir: "blog", prefix: "blog" },
  { key: "recruitment", dir: "recruitment", prefix: "get-involved/recruitment" }
];

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); }
  catch (error) { throw new Error(`${path.relative(root, filePath)}: ${error.message}`); }
}
const htmlEscape = (value) => String(value || "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
function validDate(value) {
  if (!/^\d{4}(?:-\d{2})?(?:-\d{2})?$/.test(value)) return false;
  const parts = value.split("-");
  if (parts.length === 1) return true;
  if (Number(parts[1]) < 1 || Number(parts[1]) > 12) return false;
  if (parts.length === 2) return true;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validateRecords(data) {
  const errors = [];
  for (const field of ["heroImage", "headshot"]) if (data.profile?.[field] && !fs.existsSync(path.join(root, data.profile[field]))) errors.push(`content/site.json: profile.${field} image ${data.profile[field]} does not exist`);
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const required = { researchAreas: ["title", "dek"], publications: ["title", "authors", "year", "status"], projects: ["title", "dek"], spotlight: ["title", "date", "dek"], team: ["name", "role"] };
  const slugs = {};
  for (const config of collectionConfigs) {
    const items = data[config.key] || [];
    const seen = new Set();
    slugs[config.key] = new Set(items.map((item) => item.slug));
    for (const item of items) {
      const location = `content/${config.dir}/${item.slug || "<missing-slug>"}.json`;
      if (!slugPattern.test(item.slug || "")) errors.push(`${location}: slug must use lowercase letters, numbers and hyphens`);
      if (seen.has(item.slug)) errors.push(`${location}: duplicate slug ${item.slug}`);
      seen.add(item.slug);
      for (const field of required[config.key] || ["title"]) if (!item[field]) errors.push(`${location}: missing ${field}`);
      if (item.image && !fs.existsSync(path.join(root, item.image))) errors.push(`${location}: image ${item.image} does not exist`);
      if (item.photo && !fs.existsSync(path.join(root, item.photo))) errors.push(`${location}: photo ${item.photo} does not exist`);
      if (item.date && !validDate(item.date)) errors.push(`${location}: date must be a valid YYYY, YYYY-MM, or YYYY-MM-DD`);
      if (config.key === "publications" && !/^(working paper|working project|in preparation|in progress since [a-z]+ \d{4}|under journal peer review|under review|conference peer review|journal revision process|accepted(?:, .+)?|published(?:, .+)?)$/i.test(item.status || "")) errors.push(`${location}: unsupported publication status ${item.status}`);
    }
  }
  const relationships = [
    ["researchAreas", "memberSlugs", "team"], ["researchAreas", "publicationSlugs", "publications"],
    ["researchAreas", "projectSlugs", "projects"], ["publications", "areaSlugs", "researchAreas"],
    ["publications", "profileSlugs", "team"], ["publications", "relatedProjects", "projects"],
    ["projects", "areaSlugs", "researchAreas"], ["projects", "publicationSlugs", "publications"],
    ["projects", "contributorSlugs", "team"]
  ];
  for (const [source, field, target] of relationships) for (const item of data[source] || []) {
    for (const slug of item[field] || []) if (!slugs[target].has(slug)) errors.push(`content/${collectionConfigs.find((config) => config.key === source).dir}/${item.slug}.json: ${field} references missing ${target} slug ${slug}`);
  }
  if (errors.length) throw new Error(`Content validation failed:\n- ${errors.join("\n- ")}`);
}

function byOrderThenDateThenTitle(a, b) {
  const orderA = Number.isFinite(Number(a.order)) ? Number(a.order) : 9999;
  const orderB = Number.isFinite(Number(b.order)) ? Number(b.order) : 9999;
  if (orderA !== orderB) return orderA - orderB;
  if (a.date || b.date) return String(b.date || "").localeCompare(String(a.date || ""));
  return String(a.title || a.name || a.slug).localeCompare(String(b.title || b.name || b.slug));
}

function loadCollection(config) {
  const dir = path.join(contentRoot, config.dir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const item = readJson(path.join(dir, file));
      if (!item.slug) item.slug = path.basename(file, ".json");
      item.url = `${config.prefix}/${item.slug}/`;
      return item;
    })
    .sort(byOrderThenDateThenTitle);
}

function loadSiteData() {
  const data = readJson(sitePath);
  collectionConfigs.forEach((config) => {
    data[config.key] = loadCollection(config);
  });
  validateRecords(data);
  data.nav = [
    { label: "Home", url: "index.html" },
    { label: "Research", url: "research/", children: [
      { label: "All research", url: "research/" },
      ...data.researchAreas.filter((area) => area.primary !== false).map((area) => ({ label: area.title, url: area.url })),
      { label: "Research profile", url: "research/profile/" }
    ] },
    { label: "Publications", url: "research/publications/" },
    { label: "Projects", url: "projects/" },
    { label: "Spotlight", url: "spotlight/" },
    { label: "People", url: "people/" },
    { label: "About", url: "about/" },
    { label: "Contact", url: "contact/" }
  ];
  data.pages.projects = { template: "projects", title: "Projects", kicker: "Selected work", intro: "Open source experiments in navigation, GNSS, and simulation." };
  data.pages.spotlight = { template: "spotlight", title: "Spotlight", kicker: "Research notes", intro: "Updates, presentations, and project milestones." };
  data.pages.people = { template: "team", title: "People", kicker: "Research connections", intro: "Brandon's profile and researchers connected through published work. External collaborators are identified by their own affiliations." };
  data.pages["research/areas"].intro = "Five main directions, with connected topics retained from the earlier site.";
  data.team.forEach((person) => { person.url = `people/${person.slug}/`; });
  const validRoutes = new Set(["index.html", ...Object.keys(data.pages).map((key) => key === "home" ? "index.html" : `${key}/`), ...collectionConfigs.flatMap((group) => data[group.key].map((item) => item.url)), ...data.team.map((person) => person.url)]);
  const internalLinks = [
    ...(data.homepage?.capabilities || []).flatMap((capability) => (capability.links || []).map((link) => ["content/site.json", link.href])),
    ...data.spotlight.flatMap((item) => (item.relatedLinks || []).map((link) => [`content/spotlight/${item.slug}.json`, link.href]))
  ];
  for (const [source, href] of internalLinks) {
    if (!href || /^(https?:|mailto:|#)/.test(href)) continue;
    const route = href.split(/[?#]/)[0];
    if (!validRoutes.has(route)) throw new Error(`${source}: internal link ${href} does not match a generated page`);
  }
  const areaBySlug = new Map(data.researchAreas.map((area) => [area.slug, area]));
  for (const publication of data.publications) {
    for (const slug of publication.areaSlugs || []) {
      const area = areaBySlug.get(slug);
      if (!area) throw new Error(`Publication ${publication.slug} references unknown research area ${slug}`);
      area.publicationSlugs = [...new Set([...(area.publicationSlugs || []), publication.slug])];
    }
  }
  const owner = data.team.find((person) => person.slug === "brandon-chen");
  if (owner) {
    data.profile.name = owner.name || data.profile.name;
    data.profile.title = owner.role || data.profile.title;
    data.profile.shortBio = owner.bio || data.profile.shortBio;
    data.contact.email = owner.email || data.contact.email;
    data.profile.links = [
      owner.linkedin ? { label: "LinkedIn", href: owner.linkedin } : null,
      owner.orcid ? { label: "ORCID", href: owner.orcid } : null,
      owner.github ? { label: "GitHub", href: owner.github } : null
    ].filter(Boolean);
    if (owner.experience && owner.experience.length) data.pages["research/experience"].entries = owner.experience;
    const ownerRecords = data.publications.filter((item) => (item.profileSlugs || []).includes(owner.slug));
    const publicationStat = data.profile.stats.find((item) => item.label === "Research records");
    if (publicationStat) publicationStat.value = String(ownerRecords.length).padStart(2, "0");
  }
  const members = new Set(data.team.map((item) => item.slug));
  const publications = new Set(data.publications.map((item) => item.slug));
  for (const area of data.researchAreas) {
    for (const slug of area.memberSlugs || []) {
      if (!members.has(slug)) throw new Error(`Research area ${area.slug} references unknown member ${slug}`);
    }
    for (const slug of area.publicationSlugs || []) {
      if (!publications.has(slug)) throw new Error(`Research area ${area.slug} references unknown publication ${slug}`);
    }
  }
  return data;
}

function text(value) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function pageBase(pagePath) {
  if (!pagePath) return "";
  return "../".repeat(pagePath.split("/").filter(Boolean).length);
}

function htmlFor(pageKey, title, base, data) {
  const detail = collectionConfigs.flatMap((group) => data[group.key] || []).find((item) => item.url?.replace(/\/$/, "") === pageKey) || data.team.find((person) => `people/${person.slug}` === pageKey);
  const description = detail?.dek || detail?.abstract || detail?.bio || data.pages[pageKey]?.intro || data.profile.shortBio;
  const canonical = `https://blxchen.github.io/${pageKey === "home" ? "" : `${pageKey}/`}`;
  return `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${htmlEscape(title)} | ${htmlEscape(data.profile.name)}</title>
  <link rel="canonical" href="${canonical}">
  <link rel="stylesheet" href="${base}css/styles.css">
  <link rel="stylesheet" href="${base}css/xona.css">
  <link rel="stylesheet" href="${base}css/xona-motion.css">
  <link rel="stylesheet" href="${base}css/research-areas.css">
  <link rel="stylesheet" href="${base}css/texas-editorial.css">
  <link rel="stylesheet" href="${base}css/research-site.css">
  <meta name="description" content="${htmlEscape(description)}">
  <meta property="og:title" content="${htmlEscape(title)} | ${htmlEscape(data.profile.name)}">
  <meta property="og:description" content="${htmlEscape(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://blxchen.github.io/assets/orbital-horizon.webp">
</head>
<body data-page="${pageKey}" data-base="${base}">
  <div id="site-shell"></div>
  <script src="${base}js/site-data.js"></script>
  <script src="${base}js/science/model.js"></script>
  <script src="${base}js/science/visualization.js"></script>
  <script src="${base}js/main.js"></script>
</body>
</html>
`;
}

function writePage(pageKey, title, data) {
  const pagePath = pageKey === "home" ? "" : pageKey;
  const dir = path.join(root, pagePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), htmlFor(pageKey, title, pageBase(pagePath), data), "utf8");
}

function writeSiteData(data) {
  const output = `window.SITE_DATA = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(path.join(root, "js", "site-data.js"), output, "utf8");
}

const data = loadSiteData();
writeSiteData(data);

Object.entries(data.pages).forEach(([key, page]) => {
  writePage(key, text(page.title) || data.profile.name, data);
});

collectionConfigs.forEach((group) => {
  data[group.key].forEach((item) => writePage(`${group.prefix}/${item.slug}`, text(item.title || item.name), data));
});
data.team.forEach((person) => writePage(`people/${person.slug}`, text(person.name), data));

const sitemapUrls = new Set(["", ...Object.keys(data.pages).filter((key) => key !== "home"), ...collectionConfigs.flatMap((group) => data[group.key].map((item) => `${group.prefix}/${item.slug}`)), ...data.team.map((person) => `people/${person.slug}`)]);
fs.writeFileSync(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...sitemapUrls].map((entry) => `  <url><loc>https://blxchen.github.io/${entry ? `${entry}/` : ""}</loc></url>`).join("\n")}\n</urlset>\n`);

const formerAreaRoutes = {
  "3d-mapping-ai": "3d-mapping-aided-gnss",
  "atmospheric-gnss": "remote-sensing",
  "autonomous-navigation": "",
  "leo-navigation": "leo-pnt",
  "smartphone-wearable-pnt": "smartphone-wearables-gnss"
};
for (const [oldSlug, newSlug] of Object.entries(formerAreaRoutes)) {
  if (data.researchAreas.some((area) => area.slug === oldSlug)) continue;
  const target = newSlug ? `../${newSlug}/` : "../";
  const dir = path.join(root, "research", "areas", oldSlug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${target}"><meta name="robots" content="noindex"><title>Research area moved</title></head><body><p>This research area has moved. <a href="${target}">View the current research area</a>.</p><script>location.replace(${JSON.stringify(target)})</script></body></html>\n`, "utf8");
}

console.log("Generated js/site-data.js and pages from content/");
