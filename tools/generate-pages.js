const fs = require("fs");
const path = require("path");

const scriptDir = __filename === "[stdin]" ? path.join(process.cwd(), "tools") : __dirname;
const root = path.resolve(scriptDir, "..");
const contentRoot = path.join(root, "content");
const sitePath = path.join(contentRoot, "site.json");

const collectionConfigs = [
  { key: "research", dir: "research", prefix: "research" },
  { key: "team", dir: "team", prefix: "research/team" },
  { key: "publications", dir: "publications", prefix: "research/publications" },
  { key: "media", dir: "media", prefix: "media" },
  { key: "news", dir: "news", prefix: "news" },
  { key: "blog", dir: "blog", prefix: "blog" },
  { key: "recruitment", dir: "recruitment", prefix: "get-involved/recruitment" }
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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
    const workingPapers = data.publications.filter((item) => (item.profileSlugs || []).includes(owner.slug) && item.type === "Working paper");
    const workingPaperStat = data.profile.stats.find((item) => item.label === "Working papers");
    if (workingPaperStat) workingPaperStat.value = String(workingPapers.length);
    const workingPaperStatus = data.homepage && data.homepage.status
      ? data.homepage.status.find((item) => item.label === "Now drafting")
      : null;
    if (workingPaperStatus) workingPaperStatus.value = `${workingPapers.length} working papers`;
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
  return `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | ${data.profile.name}</title>
  <link rel="stylesheet" href="${base}css/styles.css">
</head>
<body data-page="${pageKey}" data-base="${base}">
  <div id="site-shell"></div>
  <script src="${base}js/site-data.js"></script>
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

console.log("Generated js/site-data.js and pages from content/");
