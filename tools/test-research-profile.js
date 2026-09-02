const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const window = {
  location: { search: "?person=brandon-chen", href: "http://localhost/research/profile/?person=brandon-chen" },
  localStorage: { getItem: () => null, setItem: () => {} }
};
const document = { body: { dataset: { page: "research/profile", base: "" } } };
const context = vm.createContext({ window, document, URLSearchParams, console, setTimeout, clearTimeout });

vm.runInContext(fs.readFileSync(path.join(root, "js", "site-data.js"), "utf8"), context);
const source = fs.readFileSync(path.join(root, "js", "main.js"), "utf8").replace(
  /\s+bootstrap\(\);\s*\}\)\(\);\s*$/,
  "\n  window.__researchProfileTest = { calculateResearchProfile, renderActivityChart, fingerprintWeights };\n})();"
);
vm.runInContext(source, context);

const testApi = window.__researchProfileTest;
assert(testApi, "Research profile test API was not exposed");
assert.deepStrictEqual(
  JSON.parse(JSON.stringify(testApi.fingerprintWeights)),
  { interest: 4, keyword: 6, titleToken: 1.5, titlePhrase: 3, abstractToken: 0.35, abstractPhrase: 0.7 }
);

window.SITE_DATA.team.forEach((person) => {
  const metrics = testApi.calculateResearchProfile(person);
  assert(metrics.fingerprint.length > 0, `${person.name} should have a calculated fingerprint`);
  const maximum = Math.max(...metrics.fingerprint.map((topic) => topic.rawWeight));
  metrics.fingerprint.forEach((topic) => {
    assert.strictEqual(Number((topic.interestWeight + topic.paperWeight).toFixed(2)), topic.rawWeight);
    assert.strictEqual(topic.score, Math.max(8, Math.round((topic.rawWeight / maximum) * 100)));
  });
});

const brandon = window.SITE_DATA.team.find((person) => person.slug === "brandon-chen");
const brandonMetrics = testApi.calculateResearchProfile(brandon);
const brandonRecords = window.SITE_DATA.publications.filter((item) => (item.profileSlugs || []).includes(brandon.slug));
assert.strictEqual(brandonMetrics.outputs.length, brandonRecords.length);
assert(brandonMetrics.fingerprint.some((topic) => topic.interestWeight > 0), "Interests should contribute");
if (brandonRecords.length) {
  assert(brandonMetrics.fingerprint.some((topic) => topic.paperWeight > 0), "Verified working papers should contribute");
} else {
  assert(!brandonMetrics.fingerprint.some((topic) => topic.paperWeight > 0), "Simulator projects must not contribute as papers");
}

console.log("Research profile scoring and sparse-chart tests passed.");
