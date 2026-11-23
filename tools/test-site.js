const assert = require("assert"), fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.resolve(__dirname, ".."), context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "js/site-data.js"), "utf8"), context);
const data = context.window.SITE_DATA;
assert.deepStrictEqual(Array.from(data.nav, (item) => item.label), ["Home", "Research", "Publications", "Projects", "Spotlight", "People", "About", "Contact"]);
assert.strictEqual(data.nav[1].children.length, data.researchAreas.filter((area) => area.primary !== false).length + 2, "research dropdown generated from primary JSON area records");
assert.strictEqual(data.researchAreas.filter((area) => area.primary !== false).length, 5, "five main research directions");
for (const config of [{ key: "researchAreas", prefix: "research/areas" }, { key: "publications", prefix: "research/publications" }, { key: "projects", prefix: "projects" }, { key: "spotlight", prefix: "spotlight" }, { key: "team", prefix: "people" }]) {
  for (const item of data[config.key]) assert(fs.existsSync(path.join(root, config.prefix, item.slug, "index.html")), `missing detail page for ${item.slug}`);
}
assert(fs.readFileSync(path.join(root, "research/areas/autonomous-navigation/index.html"), "utf8").includes('data-page="research/areas/autonomous-navigation"'), "new research area must not be overwritten by a legacy redirect");
for (const item of data.nav) assert(fs.existsSync(path.join(root, item.url === "index.html" ? "index.html" : item.url, item.url === "index.html" ? "" : "index.html")), `missing navigation page ${item.url}`);
for (const legacy of ["research/profile", "research/team", "news", "blog", "cv", "media", "get-involved"]) assert(fs.existsSync(path.join(root, legacy, "index.html")), `legacy page lost: ${legacy}`);
assert(fs.readFileSync(path.join(root, "sitemap.xml"), "utf8").includes("https://blxchen.github.io/projects/navlab/"));
console.log("Site generation, dynamic navigation, and page preservation tests passed.");
