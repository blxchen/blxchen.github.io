(function () {
  const data = window.SITE_DATA;
  const body = document.body;
  const pageKey = body.dataset.page || "home";
  const base = body.dataset.base || "";
  const page = data.pages[pageKey] || data.pages.home;
  const researchProfileStorageKey = "brandon-research-profiles-v1";
  const requestedResearcherSlug = new URLSearchParams(window.location.search).get("person");
  let activeResearcherSlug = requestedResearcherSlug || (data.team[0] && data.team[0].slug);

  const $ = (selector, root = document) => root.querySelector(selector);
  const text = (value) => value || "";
  const attr = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
  const url = (path) => (path.startsWith("http") || path.startsWith("#") ? path : base + path);
  const asset = (path) => url(path);

  function formatPhone(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/^\(\+852\)/.test(raw)) return raw;
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 8) return `(+852) ${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length === 11 && digits.startsWith("852")) return `(+852) ${digits.slice(3, 7)} ${digits.slice(7)}`;
    return raw;
  }

  function detailForPage() {
    const groups = [
      { prefix: "research/", items: data.research, description: "dek" },
      { prefix: "research/team/", items: data.team, description: "bio" },
      { prefix: "research/publications/", items: data.publications, description: "abstract" },
      { prefix: "media/", items: data.media, description: "dek" },
      { prefix: "news/", items: data.news, description: "dek" },
      { prefix: "blog/", items: data.blog, description: "dek" },
      { prefix: "get-involved/recruitment/", items: data.recruitment, description: "dek" }
    ];

    for (const group of groups) {
      const item = group.items.find((entry) => `${group.prefix}${entry.slug}` === pageKey);
      if (item) return { item, description: group.description };
    }
    return null;
  }

  function setPageMeta() {
    const detail = detailForPage();
    document.documentElement.lang = "en-US";
    document.title = `${text(detail ? detail.item.title : page.title)} | ${data.profile.name}`;
    const description = text(detail ? detail.item[detail.description] : (page.intro || data.profile.shortBio));
    let meta = $('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
    let icon = $('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      icon.type = "image/svg+xml";
      document.head.appendChild(icon);
    }
    icon.href = asset(data.profile.headshot);
  }

  function navItem(item) {
    const children = item.children || [];
    const key = item.url === "index.html" ? "home" : item.url.replace(/\/$/, "");
    const isCurrent = pageKey === key || (key !== "home" && pageKey.startsWith(`${key}/`));
    return `
      <li class="nav-item ${children.length ? "has-menu" : ""} ${isCurrent ? "current" : ""}">
        <a href="${url(item.url)}" ${isCurrent ? 'aria-current="page"' : ""}>${text(item.label)}</a>
        ${children.length ? `<div class="subnav">${children.map((child) => `<a href="${url(child.url)}">${text(child.label)}</a>`).join("")}</div>` : ""}
      </li>
    `;
  }

  function renderShell() {
    const shell = $("#site-shell");
    const searchValue = new URLSearchParams(window.location.search).get("q") || "";
    shell.innerHTML = `
      <header class="site-header" id="top">
        <a class="skip-link" href="#main">Skip to content</a>
        <div class="su-global-brand">${data.profile.name}</div>
        <div class="su-lockup-row">
          <a href="${url("index.html")}" class="su-lockup" aria-label="Brandon Chen home">
            <span class="su-wordmark-name">${text(data.profile.brand.wordmark || data.profile.name)}</span>
            <span class="su-lockup-divider" aria-hidden="true"></span>
            <span class="su-site-title">${text(data.profile.brand.subtitle || data.profile.title)}</span>
          </a>
          <form class="su-site-search" role="search" action="${url("index.html")}" method="get">
            <label for="site-search-input">Search this site</label>
            <input id="site-search-input" name="q" placeholder="Search this site" value="${attr(searchValue)}">
            <button type="submit" aria-label="Search"></button>
          </form>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div class="su-nav-row">
          <nav id="primary-nav" class="primary-nav" aria-label="Primary">
            <ul>${data.nav.map(navItem).join("")}</ul>
          </nav>
        </div>
      </header>
      <main id="main" tabindex="-1"></main>
      ${footer()}
    `;

    $(".menu-toggle").addEventListener("click", (event) => {
      const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
      event.currentTarget.setAttribute("aria-expanded", String(!expanded));
      $(".primary-nav").classList.toggle("open", !expanded);
    });

  }

  function footer() {
    const credit = data.profile.heroCredit;
    return `
      <footer class="site-footer">
        <div class="footer-upper">
          <div class="footer-brand-block">
            <strong>${data.profile.name}</strong>
            <p>${text(data.profile.title)}</p>
            <p>${text(data.contact.location)}</p>
            <a href="mailto:${data.contact.email}">${data.contact.email}</a>
            ${credit ? `<p class="image-credit"><a href="${credit.source}">${text(credit.label)}</a> by ${text(credit.author)}. <a href="${credit.licenseUrl}">${text(credit.license)}</a>.</p>` : ""}
          </div>
          <div class="footer-column">
            <h2>Explore</h2>
            <a href="${url("about/")}">About</a>
            <a href="${url("research/")}">Research</a>
            <a href="${url("research/publications/")}">Working Papers</a>
            <a href="${url("blog/")}">Blog</a>
          </div>
          <div class="footer-column">
            <h2>Resources</h2>
            <a href="${url("cv/")}">CV</a>
            <a href="${url("media/")}">Media</a>
            <a href="${url("news/")}">News</a>
            <a href="${url("contact/")}">Contact</a>
            <a href="${url("admin/")}">Content Control Room</a>
          </div>
          <div class="footer-column footer-action">
            <a class="footer-button" href="${url("contact/")}">Contact</a>
          </div>
        </div>
        <div class="footer-lower">
          <strong>${data.profile.name}</strong>
          <nav aria-label="Footer">
            <a href="${url("index.html")}">Home</a>
            <a href="${url("research/")}">Research</a>
            <a href="${url("contact/")}">Contact</a>
            ${data.profile.links.map((link) => `<a href="${link.href}">${link.label}</a>`).join("")}
          </nav>
          <a class="back-to-top" href="#top">Back to Top</a>
        </div>
      </footer>
    `;
  }

  function hero() {
    return `
      <section class="hero">
        <img class="hero-image" src="${asset(data.profile.heroImage)}" alt="">
        <div class="hero-overlay"></div>
        <div class="hero-satellite-field" aria-hidden="true">
          <span class="orbit-ring"></span>
          <span class="orbit-ring second"></span>
          <span class="orbit-line a"></span>
          <span class="orbit-line b"></span>
          <span class="satellite sat-a"><i></i></span>
          <span class="satellite sat-b"><i></i></span>
          <span class="signal-dot d1"></span>
          <span class="signal-dot d2"></span>
          <span class="signal-dot d3"></span>
          <span class="signal-dot d4"></span>
          <span class="sat-readout">
            <em>SAT</em>
            <strong data-sat-count>16 / 24</strong>
            <small>HDOP <b data-hdop>0.8</b></small>
          </span>
        </div>
        <div class="hero-content reveal">
          <p class="eyebrow">${text(data.contact.location)}</p>
          <h1>${data.profile.name}</h1>
          <p class="hero-title">${text(data.profile.title)}</p>
          <p class="hero-copy">${text(data.profile.shortBio)}</p>
          <div class="hero-actions">
            <a class="button primary" href="${url("research/")}">View research</a>
            <a class="button" href="${url("get-involved/contact/")}">Start a conversation</a>
          </div>
        </div>
        <aside class="status-panel reveal">
          <span>Research status</span>
          <strong>Open to collaborate</strong>
          <div class="signal-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        </aside>
      </section>
    `;
  }

  function sectionHeader(kicker, title, intro) {
    return `
      <header class="section-header reveal">
        <p class="eyebrow">${text(kicker)}</p>
        <h1>${text(title)}</h1>
        ${intro ? `<p>${text(intro)}</p>` : ""}
      </header>
    `;
  }

  function backLink(path, label) {
    return `<a class="back-link reveal" href="${url(path)}">&larr; ${text(label)}</a>`;
  }

  function researchCard(item, showImage = false) {
    return `
      <a class="research-card reveal" href="${url(item.url)}">
        ${showImage && item.image ? `<span class="research-card-image"><img src="${asset(item.image)}" alt=""></span>` : ""}
        <span>${item.number}</span>
        <h2>${text(item.title)}</h2>
        <p>${text(item.dek)}</p>
        <div class="tag-row">${item.tags.map((tag) => `<em>${tag}</em>`).join("")}</div>
      </a>
    `;
  }

  function publicationCardLegacy(item) {
    return `
      <a class="publication-card reveal" href="${url(item.url)}">
        <span>${item.year} · ${text(item.type)}</span>
        <h2>${text(item.title)}</h2>
        <p>${item.authors}</p>
        <small>${text(item.venue)}</small>
      </a>
    `;
  }

  function publicationCard(item) {
    return `
      <a class="publication-card reveal" href="${url(item.url)}">
        <span>${item.year} &middot; ${text(item.type)}</span>
        <h2>${text(item.title)}</h2>
        <p>${text(item.authors)}</p>
        <small>${text(item.venue)}</small>
      </a>
    `;
  }

  function collectionCard(item, type) {
    return `
      <a class="collection-card reveal" href="${url(item.url)}">
        <span>${item.date || item.year || type}</span>
        <h2>${text(item.title)}</h2>
        <p>${text(item.dek || item.abstract)}</p>
      </a>
    `;
  }

  function getInvolvedCard(item) {
    return `
      <a class="involved-card reveal" href="${url(item.href)}">
        <span>${text(item.label)}</span>
        <h2>${text(item.title)}</h2>
        <p>${text(item.copy)}</p>
        <small>${text(item.action)} -&gt;</small>
      </a>
    `;
  }

  function recruitmentCard(item) {
    return `
      <a class="recruitment-card reveal" href="${url(item.url)}">
        <span>${text(item.type)} - ${text(item.deadline)}</span>
        <h2>${text(item.title)}</h2>
        <p>${text(item.dek)}</p>
        <div class="tag-row">${(item.tags || []).map((tag) => `<em>${tag}</em>`).join("")}</div>
      </a>
    `;
  }

  function homeTabConsole() {
    const tabs = data.homepage.tabs;

    return `
      <section class="band home-console">
        ${sectionHeader("Research console", "A live map of the work", "Tabbed panels for scanning active research areas.")}
        <div class="home-tabs reveal" data-home-tabs>
          <div class="home-tab-list reveal" role="tablist" aria-label="Homepage research panels">
            ${tabs.map((tab, index) => `
              <button class="home-tab-button ${index === 0 ? "active" : ""}" type="button" role="tab" aria-selected="${index === 0 ? "true" : "false"}" data-home-tab="${tab.key}">
                <span>${String(index + 1).padStart(2, "0")}</span>${text(tab.label)}
              </button>
            `).join("")}
          </div>
          <div class="home-tab-panels">
            ${tabs.map((tab, index) => `
              <article class="home-tab-panel reveal ${index === 0 ? "active" : ""}" role="tabpanel" data-home-panel="${tab.key}">
                <p class="eyebrow">${text(tab.label)}</p>
                <h2>${text(tab.title)}</h2>
                <p>${text(tab.copy)}</p>
                <div class="home-chip-row">${tab.points.map((point) => `<span>${point}</span>`).join("")}</div>
              </article>
            `).join("")}
          </div>
        </div>
      </section>
    `;
  }

  function homeStatusBoard() {
    const statusItems = data.homepage.status;

    return `
      <section class="band home-status">
        <div class="home-status-header reveal">
          <p class="eyebrow">Live status</p>
          <h2>Research status board</h2>
          <p>A quick-edit homepage status area for current progress, collaboration state, and next updates.</p>
        </div>
        <div class="status-grid">
          ${statusItems.map((item, index) => `
            <article class="status-card reveal">
              <span class="status-led ${index === 1 ? "warm" : ""}" aria-hidden="true"></span>
              <small>${text(item.label)}</small>
              <h3>${text(item.value)}</h3>
              <p>${text(item.note)}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function homeCapabilityGrid() {
    const capabilities = data.homepage.capabilities;
    const icons = {
      orbit: `<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="24" rx="18" ry="8"></ellipse><circle cx="24" cy="24" r="3"></circle><circle cx="38" cy="18" r="2"></circle></svg>`,
      target: `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="13"></circle><circle cx="24" cy="24" r="5"></circle><path d="M24 6v6M24 36v6M6 24h6M36 24h6"></path></svg>`,
      signal: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect class="bar b1" x="10" y="27" width="4" height="7"></rect><rect class="bar b2" x="19" y="20" width="4" height="14"></rect><rect class="bar b3" x="28" y="13" width="4" height="21"></rect><rect class="bar b4" x="37" y="7" width="4" height="27"></rect></svg>`,
      shield: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 6l15 6v11c0 9-6.2 15.5-15 19-8.8-3.5-15-10-15-19V12z"></path><path d="M18 24l4 4 8-9"></path><path class="shield-scan" d="M15 14h18"></path></svg>`
    };

    return `
      <section class="band home-capabilities">
        <header class="section-header capability-heading reveal">
          <p class="eyebrow">Capabilities</p>
          <h1>Four research directions, each with a <span>clear public path.</span></h1>
        </header>
        <div class="cap-grid cap-grid-rich">
          ${capabilities.map((item, index) => `
            <article class="cap-card cap-card-rich reveal">
              <span class="cap-icon cap-icon-${text(item.icon || "orbit")}">${icons[item.icon] || icons.orbit}</span>
              <span class="cap-num">${text(item.number || String(index + 1).padStart(2, "0"))}</span>
              <h2>${text(item.title)}</h2>
              <p>${text(item.copy)}</p>
              ${item.keywords && item.keywords.length ? `<div class="cap-keywords">${item.keywords.map((keyword) => `<span>${text(keyword)}</span>`).join("")}</div>` : ""}
              ${item.links && item.links.length ? `<div class="cap-links"><small>${text(item.linksLabel || "Selected pages")}</small>${item.links.map((link) => `<a href="${url(link.href)}">${text(link.label)} -&gt;</a>`).join("")}</div>` : ""}
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function homeTeamPreview() {
    const members = data.team.slice(0, 2).map(resolvedTeamMember);
    if (!members.length) return "";

    return `
      <section class="band home-team-preview">
        ${sectionHeader("Team", "People behind the work", "The first two team files appear here as homepage slots.")}
        <div class="home-team-grid">
          ${members.map((person) => `
            <a class="person-card home-team-card reveal" href="${url(person.url)}">
              <span class="person-photo">
                <img src="${researcherPhoto(person)}" alt="">
              </span>
              <span class="person-card-body">
                <small>Team Member</small>
                <h2>${text(person.name)}</h2>
                <p>${text(person.role)}</p>
              </span>
              <span class="person-card-action">View profile</span>
            </a>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderHome() {
    return `
      ${hero()}
      <section class="band stats-band">
        ${data.profile.stats.map((stat) => `<div class="metric reveal"><strong>${stat.value}</strong><span>${text(stat.label)}</span></div>`).join("")}
      </section>
      ${homeStatusBoard()}
      ${homeTabConsole()}
      <section class="content-grid">
        <div class="intro-panel reveal">
          <img src="${asset(data.profile.headshot)}" alt="${data.profile.name}" class="headshot">
          <div>
            <p class="eyebrow">Research profile</p>
            <h2>Clear, auditable, deployable intelligent systems.</h2>
            <p>${text(data.profile.shortBio)}</p>
            <div class="link-row">${data.profile.links.map((link) => `<a href="${link.href}">${link.label}</a>`).join("")}</div>
          </div>
        </div>
        <div class="notice-panel reveal">
          <p class="eyebrow">Current focus</p>
          <h2>2026 drafts and collaborations</h2>
          <p>Working papers, research notes, and collaboration pages are being organized here.</p>
        </div>
      </section>
      <section class="band">
        ${sectionHeader("Research", "Research directions", "Three editable themes with their own detail pages.")}
        <div class="card-grid">${data.research.map((item) => researchCard(item, true)).join("")}</div>
      </section>
      ${homeTeamPreview()}
      <section class="band split-band">
        <div>
          ${sectionHeader("Recent record", "News and writing", "Latest placeholder updates from the research program.")}
        </div>
        <div class="stacked-list">
          ${data.news.slice(0, 2).map((item) => collectionCard(item, "news")).join("")}
          ${data.blog.slice(0, 1).map((item) => collectionCard(item, "blog")).join("")}
        </div>
      </section>
      ${homeCapabilityGrid()}
    `;
  }

  function renderAbout() {
    const owner = data.team.find((person) => person.slug === "brandon-chen") || {};
    const linkedin = data.profile.links.find((link) => link.label === "LinkedIn");
    return `
      <section class="page-hero">${sectionHeader(page.kicker, page.title, page.intro)}</section>
      <section class="two-column">
        <div class="portrait-card reveal">
          <img src="${asset(data.profile.headshot)}" alt="${data.profile.name}">
          <h2>${data.profile.name}</h2>
          <p>${text(data.profile.title)}</p>
        </div>
        <article class="prose reveal">
          ${text(page.paragraphs).map((paragraph) => `<p>${paragraph}</p>`).join("")}
          ${linkedin ? `<p><a class="button primary" href="${attr(linkedin.href)}">View experience and interests on LinkedIn</a></p>` : ""}
          <h2>Research interests</h2>
          <ul>${(owner.interests || []).map((interest) => `<li>${text(interest)}</li>`).join("")}</ul>
        </article>
      </section>
    `;
  }

  function renderResearchIndex() {
    return `
      <section class="page-hero">${sectionHeader(page.kicker, page.title, page.intro)}</section>
      <section class="band">
        <div class="card-grid">${data.research.map(researchCard).join("")}</div>
      </section>
      <section class="band quick-links">
        <a href="${url("research/experience/")}">Experience</a>
        <a href="${url("research/profile/")}">Research Profile</a>
        <a href="${url("research/team/")}">Team</a>
        <a href="${url("research/publications/")}">Working Papers</a>
      </section>
    `;
  }

  function researchProfileOverrides() {
    try {
      return JSON.parse(window.localStorage.getItem(researchProfileStorageKey) || "{}") || {};
    } catch (error) {
      return {};
    }
  }

  function resolvedTeamMember(person) {
    const overrides = researchProfileOverrides()[person.slug] || {};
    return { ...person, ...overrides, slug: person.slug };
  }

  function researcherPhoto(person) {
    const source = person.photo || data.profile.headshot;
    return String(source).startsWith("data:") ? source : asset(source);
  }

  const fingerprintStopwords = new Set([
    "about", "after", "also", "among", "based", "been", "between", "both", "could", "data", "from", "have", "into", "more", "most", "other", "over", "paper", "research", "results", "study", "such", "than", "that", "their", "these", "this", "through", "using", "were", "which", "while", "with", "within"
  ]);

  const fingerprintWeights = Object.freeze({
    interest: 4,
    keyword: 6,
    titleToken: 1.5,
    titlePhrase: 3,
    abstractToken: 0.35,
    abstractPhrase: 0.7
  });

  function inferredPublicationTopics(publication, paperId) {
    const weights = new Map();
    const add = (label, weight, source) => {
      const clean = String(label || "").replace(/\s+/g, " ").trim();
      if (!clean) return;
      const key = clean.toLowerCase();
      const previous = weights.get(key) || { label: clean, weight: 0, signals: new Set() };
      previous.weight += weight;
      previous.signals.add(source);
      weights.set(key, previous);
    };
    (publication.keywords || []).forEach((keyword) => add(keyword, fingerprintWeights.keyword, "keyword"));
    const ingest = (source, tokenWeight, phraseWeight, sourceLabel) => {
      const tokens = String(source || "").match(/[A-Za-z][A-Za-z0-9-]{3,}/g) || [];
      const useful = tokens.filter((token) => !fingerprintStopwords.has(token.toLowerCase()));
      useful.forEach((token) => add(token, tokenWeight, `${sourceLabel} token`));
      for (let index = 0; index < useful.length - 1; index += 1) {
        const phrase = `${useful[index]} ${useful[index + 1]}`;
        if (phrase.length <= 46) add(phrase, phraseWeight, `${sourceLabel} phrase`);
      }
    };
    ingest(publication.title, fingerprintWeights.titleToken, fingerprintWeights.titlePhrase, "title");
    ingest(publication.abstract, fingerprintWeights.abstractToken, fingerprintWeights.abstractPhrase, "abstract");
    return Array.from(weights.values())
      .map((topic) => ({ ...topic, paperId, signals: Array.from(topic.signals) }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 14);
  }

  function publicationsFor(person) {
    const names = [person.name].concat(person.publicationNames || []).map((name) => String(name).toLowerCase());
    return data.publications.filter((publication) => {
      const authors = String(publication.authors || "").toLowerCase();
      return (publication.profileSlugs || []).includes(person.slug) || names.some((name) => name && authors.includes(name));
    });
  }

  function calculateResearchProfile(person) {
    const outputs = publicationsFor(person);
    const citations = outputs.map((item) => Number(item.citationCount) || 0).sort((a, b) => b - a);
    const hIndex = citations.reduce((score, count, index) => count >= index + 1 ? index + 1 : score, 0);
    const years = outputs.map((item) => Number(item.year)).filter(Number.isFinite);
    const activity = {};
    years.forEach((year) => { activity[year] = (activity[year] || 0) + 1; });
    const outputTypes = {};
    outputs.forEach((item) => {
      const type = text(item.type) || "Research output";
      outputTypes[type] = (outputTypes[type] || 0) + 1;
    });

    const aliases = [person.name].concat(person.publicationNames || []).map((name) => String(name).toLowerCase());
    const collaborators = new Set();
    (person.profileCollaborators || []).forEach((name) => collaborators.add(name));
    outputs.forEach((item) => {
      String(item.authors || "").split(/\s*(?:,|&|\band\b)\s*/i).filter(Boolean).forEach((author) => {
        if (!aliases.includes(author.toLowerCase())) collaborators.add(author);
      });
    });

    const displayOutputs = [];
    const seenOutputs = new Set();
    [...(person.featuredOutputs || []), ...outputs].forEach((item) => {
      const key = String(item.doi || item.title || "").toLowerCase();
      if (!key || seenOutputs.has(key)) return;
      seenOutputs.add(key);
      displayOutputs.push(item);
    });

    const topicWeights = new Map();
    const ensureTopic = (topic, thesaurus = "Automatically extracted") => {
      const clean = String(topic || "").trim();
      if (!clean) return null;
      const key = clean.toLowerCase();
      const previous = topicWeights.get(key) || {
        label: clean,
        interestWeight: 0,
        paperWeight: 0,
        paperIds: new Set(),
        signals: new Set(),
        thesaurus
      };
      if (thesaurus !== "Automatically extracted") previous.thesaurus = thesaurus;
      topicWeights.set(key, previous);
      return previous;
    };
    (person.fingerprint || []).forEach((topic) => {
      const configured = typeof topic === "string" ? { label: topic, thesaurus: "Profile topics" } : topic;
      if (configured && configured.label) ensureTopic(configured.label, configured.thesaurus || "Profile topics");
    });
    (person.interests || []).forEach((topic) => {
      const entry = ensureTopic(topic, "Profile interests");
      if (!entry) return;
      entry.interestWeight += fingerprintWeights.interest;
      entry.signals.add("profile interest");
    });
    displayOutputs.forEach((item, index) => {
      const paperId = String(item.doi || item.slug || item.title || index);
      inferredPublicationTopics(item, paperId).forEach((topic) => {
        const entry = ensureTopic(topic.label);
        if (!entry) return;
        entry.paperWeight += topic.weight;
        entry.paperIds.add(paperId);
        topic.signals.forEach((signal) => entry.signals.add(signal));
      });
    });
    const fingerprint = Array.from(topicWeights.values())
      .map((topic) => ({
        label: topic.label,
        thesaurus: topic.thesaurus,
        interestWeight: Number(topic.interestWeight.toFixed(2)),
        paperWeight: Number(topic.paperWeight.toFixed(2)),
        rawWeight: Number((topic.interestWeight + topic.paperWeight).toFixed(2)),
        paperCount: topic.paperIds.size,
        signals: Array.from(topic.signals).sort()
      }))
      .filter((topic) => topic.rawWeight > 0)
      .sort((a, b) => b.rawWeight - a.rawWeight || b.paperCount - a.paperCount || a.label.localeCompare(b.label));
    const maxWeight = Math.max(1, ...fingerprint.map((topic) => topic.rawWeight));
    fingerprint.forEach((topic) => {
      topic.score = Math.max(8, Math.round((topic.rawWeight / maxWeight) * 100));
      topic.formula = `${topic.interestWeight} interest + ${topic.paperWeight} paper evidence`;
    });

    const external = person.bibliometrics || {};
    const configuredTypes = person.outputBreakdown || [];
    const effectiveActivity = person.activity || activity;

    const configuredSimilarProfiles = (person.similarProfileSlugs || []).filter((slug) => slug && slug !== person.slug);

    return {
      outputs: displayOutputs,
      totalOutputs: Number.isFinite(Number(external.totalOutputs)) ? Number(external.totalOutputs) : outputs.length,
      citations: Number.isFinite(Number(external.citations)) ? Number(external.citations) : citations.reduce((total, count) => total + count, 0),
      hIndex: Number.isFinite(Number(external.hIndex)) ? Number(external.hIndex) : hIndex,
      activity: effectiveActivity,
      outputTypes: configuredTypes.length ? configuredTypes : Object.entries(outputTypes).map(([label, count]) => ({ label, count })),
      collaborators: Array.from(collaborators),
      openAccess: displayOutputs.filter((item) => item.openAccess).length,
      firstYear: Number.isFinite(Number(external.firstYear)) ? Number(external.firstYear) : (years.length ? Math.min(...years) : null),
      latestYear: Number.isFinite(Number(external.latestYear)) ? Number(external.latestYear) : (years.length ? Math.max(...years) : null),
      similarProfiles: configuredSimilarProfiles.length || Number(external.similarProfiles) || 0,
      prizeCount: Number(external.prizeCount) || (person.prizes || []).length,
      activityCount: Number(external.activityCount) || (person.activities || []).length,
      metricSource: external.source || "Local research records",
      fingerprint
    };
  }

  function researchMetric(value, label, note) {
    return `<article class="rp-metric"><strong>${value}</strong><span>${text(label)}</span><small>${text(note)}</small></article>`;
  }

  function renderActivityChart(activity, recordLabel = "research records") {
    const years = Object.keys(activity).map(Number).sort((a, b) => a - b);
    if (!years.length) return `<div class="rp-empty">Add authored research records to generate activity.</div>`;
    const max = Math.max(...years.map((year) => activity[year]));
    const visualScale = Math.max(2, max);
    const density = years.length <= 3 ? "is-sparse" : years.length >= 14 ? "is-dense" : "";
    return `<div class="rp-chart ${density}" style="--year-count:${years.length}" role="img" aria-label="${attr(recordLabel)} per year">
      ${years.map((year, index) => `<div class="rp-chart-column" title="${year}: ${activity[year]} ${attr(recordLabel)}"><span>${activity[year]}</span><i style="--bar:${Math.max(12, Math.round((activity[year] / visualScale) * 100))}%"></i><small>${years.length < 12 || index % 3 === 0 || index === years.length - 1 ? year : ""}</small></div>`).join("")}
    </div>`;
  }

  function renderResearchProfileLegacy() {
    const people = data.team.map(resolvedTeamMember);
    let person = people.find((entry) => entry.slug === activeResearcherSlug) || people[0];
    if (!person) return `<section class="page-hero">${sectionHeader(page.kicker, page.title, "Add a team member to begin.")}</section>`;
    activeResearcherSlug = person.slug;
    const metrics = calculateResearchProfile(person);
    const activeRange = metrics.firstYear ? `${metrics.firstYear}${metrics.latestYear !== metrics.firstYear ? `–${metrics.latestYear}` : ""}` : "No outputs yet";
    const scholarHref = person.scholarUrl && person.scholarUrl !== "#" ? person.scholarUrl : "";
    const outputCount = metrics.outputs.length;

    return `
      <section class="rp-page">
        <div class="rp-masthead">
          ${backLink("research/", "Back to research")}
          <div class="rp-masthead-copy reveal">
            <p class="eyebrow">${text(page.kicker)}</p>
            <h1>${text(page.title)}</h1>
            <p>${text(page.intro)}</p>
          </div>
          <div class="rp-person-tabs reveal" role="tablist" aria-label="Researcher profiles">
            ${people.map((entry) => `<button type="button" role="tab" aria-selected="${entry.slug === person.slug}" class="${entry.slug === person.slug ? "active" : ""}" data-researcher="${attr(entry.slug)}"><img src="${researcherPhoto(entry)}" alt=""><span>${text(entry.name)}</span></button>`).join("")}
          </div>
        </div>

        <section class="rp-profile-header reveal">
          <div class="rp-portrait-wrap">
            <img class="rp-portrait" src="${researcherPhoto(person)}" alt="${attr(person.name)}">
            <button class="rp-photo-button" type="button" data-edit-profile aria-label="Edit ${attr(person.name)} profile">Edit profile</button>
          </div>
          <div class="rp-identity">
            <span class="rp-availability"><i></i> Profile active</span>
            <h2>${text(person.name)}</h2>
            <p class="rp-role">${text(person.role)}</p>
            <p>${text(person.bio)}</p>
            <div class="rp-link-row">
              ${person.email ? `<a href="mailto:${attr(person.email)}">Email</a>` : ""}
              ${person.orcid ? `<a href="${attr(person.orcid)}">ORCID</a>` : ""}
              ${scholarHref ? `<a href="${attr(scholarHref)}">Google Scholar</a>` : `<button type="button" data-edit-profile>Add Scholar profile</button>`}
            </div>
          </div>
          <aside class="rp-index-card">
            <span>Research record</span>
            <strong>${activeRange}</strong>
            <small>Calculated locally from ${outputCount} matched ${outputCount === 1 ? "record" : "records"}</small>
          </aside>
        </section>

        <nav class="rp-section-tabs reveal" aria-label="Profile sections">
          <button type="button" data-profile-jump="rp-overview">Overview</button>
          <button type="button" data-profile-jump="rp-fingerprint">Fingerprint</button>
          <button type="button" data-profile-jump="rp-activity">Activity</button>
          <button type="button" data-profile-jump="rp-outputs">Outputs</button>
        </nav>

        <section id="rp-overview" class="rp-metrics reveal">
          ${researchMetric(outputCount, "Research outputs", "Matched by author name")}
          ${researchMetric(metrics.citations, "Citations", "From local citation fields")}
          ${researchMetric(metrics.hIndex, "h-index", "Calculated automatically")}
          ${researchMetric(metrics.collaborators.length, "Collaborators", "Unique matched co-authors")}
          ${researchMetric(metrics.openAccess, "Open access", "Marked open records")}
        </section>

        <section id="rp-fingerprint" class="rp-section rp-fingerprint-section reveal">
          <header><div><p class="eyebrow">Expertise map</p><h2>Research fingerprint</h2></div><p>Weighted from the profile's interests and publication keywords. Larger terms have a stronger signal.</p></header>
          ${metrics.fingerprint.length ? `<div class="rp-fingerprint-cloud">${metrics.fingerprint.map((topic, index) => `<button type="button" style="--score:${topic.score};--delay:${index}" title="Topic strength ${topic.score}%"><span>${text(topic.label)}</span><small>${topic.score}%</small></button>`).join("")}</div>` : `<div class="rp-empty">Add interests or publication keywords to create a fingerprint.</div>`}
        </section>

        <section id="rp-activity" class="rp-activity-grid reveal">
          <article class="rp-section">
            <header><div><p class="eyebrow">Timeline</p><h2>Research output per year</h2></div></header>
            ${renderActivityChart(metrics.activity)}
          </article>
          <article class="rp-section rp-collaboration-card">
            <header><div><p class="eyebrow">Network</p><h2>Collaboration signals</h2></div></header>
            ${metrics.collaborators.length ? `<ul>${metrics.collaborators.map((name) => `<li><span>${text(name).split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><strong>${text(name)}</strong><small>Matched co-author</small></div></li>`).join("")}</ul>` : `<div class="rp-empty">No co-authors matched yet.</div>`}
          </article>
        </section>

        <section id="rp-outputs" class="rp-section rp-output-section reveal">
          <header><div><p class="eyebrow">Record</p><h2>Research output</h2></div><a href="${url("research/publications/")}">View all publications</a></header>
          <div class="rp-output-list">
            ${metrics.outputs.length ? metrics.outputs.map((item) => `<a href="${url(item.url)}"><span class="rp-output-year">${item.year}</span><div><small>${text(item.type)}</small><h3>${text(item.title)}</h3><p>${text(item.authors)} · ${text(item.venue)}</p></div><strong>${Number(item.citationCount) || 0}<small>citations</small></strong></a>`).join("") : `<div class="rp-empty">No publications currently match this researcher's author names.</div>`}
          </div>
        </section>

        <dialog class="rp-editor" data-profile-editor>
          <form method="dialog" data-profile-form>
            <div class="rp-editor-heading"><div><p class="eyebrow">Local editor</p><h2>Edit research profile</h2></div><button type="button" data-close-editor aria-label="Close editor">×</button></div>
            <p class="rp-editor-note">Changes are saved in this browser. Publication metrics remain calculated from the JSON records in <code>content/publications</code>.</p>
            <div class="rp-editor-photo"><img src="${researcherPhoto(person)}" alt=""><label>Profile photo<input type="file" name="photo" accept="image/png,image/jpeg,image/webp,image/gif"><small>PNG, JPEG, WebP, or GIF up to 1.5 MB.</small></label></div>
            <div class="rp-form-grid">
              <label>Display name<input name="name" value="${attr(person.name)}" required></label>
              <label>Role / affiliation<input name="role" value="${attr(person.role)}"></label>
              <label>Email<input name="email" type="email" value="${attr(person.email || "")}"></label>
              <label>ORCID URL<input name="orcid" type="url" value="${attr(person.orcid || "")}" placeholder="https://orcid.org/..."></label>
              <label class="wide">Google Scholar URL<input name="scholarUrl" type="url" value="${attr(scholarHref)}" placeholder="https://scholar.google.com/citations?user=..."></label>
              <label class="wide">Biography<textarea name="bio" rows="5">${attr(person.bio)}</textarea></label>
              <label class="wide">Research interests<textarea name="interests" rows="3" placeholder="One topic per line">${attr((person.interests || []).join("\n"))}</textarea></label>
            </div>
            <p class="rp-form-status" aria-live="polite"></p>
            <div class="rp-editor-actions"><button type="button" class="button" data-reset-profile>Reset local edits</button><button type="submit" class="button primary">Save profile</button></div>
          </form>
        </dialog>
      </section>
    `;
  }

  function renderProfileRecordSection(id, kicker, title, items, totalLabel) {
    if (!items || !items.length) return "";
    return `
      <section id="${id}" class="rp-pure-section rp-record-section reveal" data-profile-search-section>
        <header class="rp-pure-section-head">
          <div><p class="eyebrow">${text(kicker)}</p><h2>${text(title)}</h2></div>
          ${totalLabel ? `<span class="rp-section-total">${text(totalLabel)}</span>` : ""}
        </header>
        <div class="rp-record-list">
          ${items.map((item) => `
            <article class="rp-record-item" data-profile-search-item>
              <div><small>${text(item.date || item.year || item.type)}</small><h3>${text(item.title)}</h3><p>${text(item.type)}</p></div>
              <span aria-hidden="true">-&gt;</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function researchProfileLoader() {
    return `
      <div class="rp-entry-loader" data-profile-loader aria-hidden="true">
        <div class="rp-entry-loader-panel" role="status" aria-live="polite">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle class="rp-loader-orbit orbit-one" cx="60" cy="60" r="45" pathLength="100"></circle>
            <circle class="rp-loader-orbit orbit-two" cx="60" cy="60" r="34" pathLength="100"></circle>
            <circle class="rp-loader-orbit orbit-three" cx="60" cy="60" r="23" pathLength="100"></circle>
            <circle class="rp-loader-core" cx="60" cy="60" r="7"></circle>
          </svg>
          <span>Mapping research fingerprint</span>
          <strong data-profile-loader-name>Opening researcher profile</strong>
        </div>
      </div>
    `;
  }

  function renderResearchProfileDirectory(people) {
    return `
      <section class="page-hero rp-card-directory-hero">
        ${sectionHeader("Research profiles", "Explore researcher profiles", "Choose a researcher to view their complete record, research activity, network, and automatically generated fingerprint.")}
      </section>
      <section class="people-grid rp-profile-card-grid" aria-label="Researcher profile directory">
        ${people.map((person) => `
          <a class="person-card reveal" data-profile-entry data-profile-name="${attr(person.name)}" href="${url(`research/profile/?person=${encodeURIComponent(person.slug)}`)}">
            <span class="person-photo"><img src="${researcherPhoto(person)}" alt=""></span>
            <span class="person-card-body">
              <small>Research profile</small>
              <h2>${text(person.name)}</h2>
              <p>${text(person.role)}</p>
            </span>
            <span class="person-card-action">View full profile</span>
          </a>
        `).join("")}
      </section>
      <section class="rp-directory-actions">
        <p>Verified researchers can maintain their own public record.</p>
        <a href="${url("admin/")}">Add or manage a profile</a>
      </section>
      ${researchProfileLoader()}
    `;
  }

  function renderResearchProfile() {
    const people = data.team.map(resolvedTeamMember);
    const requestedSlug = new URLSearchParams(window.location.search).get("person");
    if (!requestedSlug) return renderResearchProfileDirectory(people);
    let person = people.find((entry) => entry.slug === activeResearcherSlug) || people[0];
    if (!person) return `<section class="page-hero">${sectionHeader(page.kicker, page.title, "Add a team member to begin.")}</section>`;
    activeResearcherSlug = person.slug;
    const metrics = calculateResearchProfile(person);
    const isOwnerProfile = person.slug === "brandon-chen";
    const scholarHref = person.scholarUrl && person.scholarUrl !== "#" ? person.scholarUrl : "";
    const activeRange = metrics.firstYear ? `${metrics.firstYear} - ${metrics.latestYear || metrics.firstYear}` : "No records yet";
    const education = person.education || [];
    const affiliations = person.affiliations && person.affiliations.length ? person.affiliations : [person.role];
    const collaborationLocations = person.collaborationLocations || [];
    const contactLines = [
      person.phone ? `<span><b>Phone</b>${text(formatPhone(person.phone))}</span>` : "",
      person.email ? `<a href="mailto:${attr(person.email)}"><span>Email</span>${text(person.email)}</a>` : "",
      person.linkedin ? `<a href="${attr(person.linkedin)}"><span>LinkedIn</span>Professional profile</a>` : "",
      scholarHref ? `<a href="${attr(scholarHref)}"><span>Scholar</span>Google Scholar</a>` : ""
    ].filter(Boolean).join("");
    const similarProfiles = (person.similarProfileSlugs || [])
      .map((slug) => people.find((entry) => entry.slug === slug))
      .filter(Boolean);

    return `
      <section class="rp-page rp-pure-page">
        <section class="rp-profile-directory" aria-label="Researcher profiles">
          <header>
            <div><span>Research profiles</span><strong>${people.length} researcher${people.length === 1 ? "" : "s"}</strong></div>
            <nav aria-label="Research profile actions"><a href="${url("research/profile/")}">Return to research profiles</a><a href="${url("admin/")}#curated-profiles">+ Add researcher profile</a></nav>
          </header>
          <div role="tablist">${people.map((entry) => `<button type="button" role="tab" aria-selected="${entry.slug === person.slug}" class="${entry.slug === person.slug ? "active" : ""}" data-researcher="${attr(entry.slug)}"><img src="${researcherPhoto(entry)}" alt=""><span>${text(entry.name)}<small>${text(entry.role)}</small></span></button>`).join("")}</div>
        </section>
        <section class="rp-pure-hero reveal">
          <div class="rp-pure-photo">
            <img src="${researcherPhoto(person)}" alt="${attr(person.name)}">
            ${person.scopusUrl ? `<a class="rp-scopus-link" href="${attr(person.scopusUrl)}">View Scopus Profile</a>` : ""}
            <a class="rp-manage-profile" href="${url("admin/")}">Edit your profile</a>
          </div>
          <div class="rp-pure-identity">
            <h1>${text(person.name)}</h1>
            <ul class="rp-affiliations">${affiliations.map((item) => `<li>${text(item)}</li>`).join("")}</ul>
            ${person.orcid ? `<a class="rp-orcid-line" href="${attr(person.orcid)}"><i aria-hidden="true">iD</i>${text(person.orcid)}</a>` : ""}
            ${contactLines ? `<div class="rp-contact-lines">${contactLines}</div>` : ""}
          </div>
          <aside class="rp-bibliometrics">
            <strong class="rp-biblio-tab">${isOwnerProfile ? "working papers" : "h-index"}</strong>
            <div class="rp-biblio-values">
              ${isOwnerProfile
                ? `<div><strong>${metrics.totalOutputs}</strong><span>Working drafts</span></div><div><strong>WIP</strong><span>Not published</span></div>`
                : `<div><strong>${metrics.citations.toLocaleString()}</strong><span>Citations</span></div><div><strong>${metrics.hIndex}</strong><span>h-index</span></div>`}
              <i title="${attr(metrics.metricSource)}">i</i>
            </div>
            <div class="rp-biblio-chart ${metrics.firstYear && metrics.firstYear === metrics.latestYear ? "single-year" : ""}"><span>${metrics.firstYear || ""}</span>${renderActivityChart(metrics.activity, isOwnerProfile ? "working-paper drafts" : "research outputs")}<span>${metrics.latestYear && metrics.latestYear !== metrics.firstYear ? metrics.latestYear : ""}</span></div>
            <small>${isOwnerProfile ? "Working-paper activity" : "Research activity per year"}</small>
          </aside>
        </section>

        <nav class="rp-pure-nav reveal" aria-label="Profile sections">
          <button type="button" class="active" data-icon="person" data-profile-jump="rp-personal">Overview</button>
          <button type="button" data-icon="fingerprint" data-profile-jump="rp-fingerprint">Fingerprint</button>
          <button type="button" data-icon="network" data-profile-jump="rp-collaborations">Network</button>
          <button type="button" data-icon="output" data-profile-jump="rp-outputs">${isOwnerProfile ? "Working papers" : "Research output"} (${metrics.totalOutputs})</button>
          ${(person.prizes || []).length ? `<button type="button" data-icon="prize" data-profile-jump="rp-prizes">Prizes (${metrics.prizeCount})</button>` : ""}
          ${(person.activities || []).length ? `<button type="button" data-icon="activity" data-profile-jump="rp-activities">Activities (${metrics.activityCount})</button>` : ""}
          ${(person.media || []).length ? `<button type="button" data-icon="media" data-profile-jump="rp-media">Press/Media (${person.media.length})</button>` : ""}
          <button type="button" data-icon="similar" data-profile-jump="${similarProfiles.length ? "rp-similar" : "rp-fingerprint"}">Similar Profiles (${metrics.similarProfiles})</button>
        </nav>

        <section id="rp-personal" class="rp-pure-section rp-personal-section reveal" data-profile-search-section>
          <header class="rp-pure-section-head"><div><h2><i class="rp-section-icon person" aria-hidden="true"></i>Personal profile</h2></div><a class="rp-manage-profile" href="${url("admin/")}">Manage my profile</a></header>
          <div class="rp-personal-grid">
            <article><h3>Biography</h3><p>${text(person.bio)}</p></article>
            <aside>
              ${education.length ? `<h3>Education / academic qualification</h3><ul class="rp-education-list">${education.map((item) => `<li><span>${text(item.year)}</span><strong>${text(item.qualification)}</strong><small>${text(item.institution)}</small></li>`).join("")}</ul>` : ""}
              <h3>Research interests</h3><div class="rp-keyword-list">${(person.interests || []).map((item) => `<span>${text(item)}</span>`).join("")}</div>
            </aside>
          </div>
        </section>

        <section id="rp-fingerprint" class="rp-pure-section rp-pure-fingerprint reveal" data-profile-search-section>
          <header class="rp-pure-section-head">
            <div><h2><i class="rp-section-icon fingerprint" aria-hidden="true"></i>Fingerprint</h2><p>Dive into the research topics where ${text(person.name)} is active. These topic labels come from profile interests${isOwnerProfile ? (metrics.totalOutputs ? " and verified working-paper drafts" : "") : " and research records"}. Together they form a unique fingerprint.</p></div>
            <div class="rp-similar-badge"><strong>${metrics.similarProfiles}</strong><span>Similar profiles</span></div>
          </header>
          ${metrics.fingerprint.length ? `<div class="rp-fingerprint-cloud" data-fingerprint-cloud>${metrics.fingerprint.map((topic, index) => `<button type="button" class="${index >= 8 ? "rp-fingerprint-extra" : ""}" data-fingerprint-topic="${attr(topic.label)}" data-label="${attr(topic.label)}" data-score="${topic.score}" style="--score:${topic.score};--delay:${index}" title="Open ${attr(topic.label)} details"><i class="rp-rank-donut" aria-hidden="true"></i><span><b>${text(topic.label)}</b><small>${text(topic.thesaurus || "Keyphrases")}</small></span></button>`).join("")}</div>` : `<div class="rp-empty">Add interests or research-record keywords to create a fingerprint.</div>`}
          ${metrics.fingerprint.length ? `<details class="rp-fingerprint-method"><summary>How the fingerprint score is calculated</summary><p><code>raw topic weight = 4 × profile interest + 6 × paper keyword + 3 × title phrase + 1.5 × title token + 0.7 × abstract phrase + 0.35 × abstract token</code></p><p>Each score is normalized against the strongest topic: <code>score = round(100 × topic raw weight / maximum raw weight)</code>. Only this profile's interests and matched research records contribute weight.</p></details>` : ""}
          ${metrics.fingerprint.length > 8 ? `<div class="rp-fingerprint-action"><button type="button" data-fingerprint-toggle aria-expanded="false">View full fingerprint (${metrics.fingerprint.length}) <span aria-hidden="true">›</span></button></div>` : ""}
        </section>

        ${similarProfiles.length ? `
        <section id="rp-similar" class="rp-pure-section rp-similar-section reveal" data-profile-search-section>
          <header class="rp-pure-section-head">
            <div><h2><i class="rp-section-icon similar" aria-hidden="true"></i>Similar profiles</h2><p>Researchers with closely related interests, methods, and research topics.</p></div>
            <span class="rp-section-total">${similarProfiles.length} profile${similarProfiles.length === 1 ? "" : "s"}</span>
          </header>
          <div class="rp-similar-grid">
            ${similarProfiles.map((entry) => {
              const sharedTopics = (person.interests || []).filter((topic) => (entry.interests || []).some((candidate) => candidate.toLowerCase() === topic.toLowerCase()));
              const topics = sharedTopics.length ? sharedTopics : (entry.interests || []).slice(0, 3);
              return `<a class="rp-similar-card" data-profile-search-item href="${url(`research/profile/?person=${encodeURIComponent(entry.slug)}`)}">
                <img src="${researcherPhoto(entry)}" alt="${attr(entry.name)}">
                <div><small>Similar researcher</small><h3>${text(entry.name)}</h3><p>${text(entry.role)}</p><div>${topics.slice(0, 3).map((topic) => `<span>${text(topic)}</span>`).join("")}</div></div>
                <b aria-hidden="true">-&gt;</b>
              </a>`;
            }).join("")}
          </div>
        </section>` : ""}

        <section id="rp-collaborations" class="rp-pure-section rp-network-section reveal" data-profile-search-section>
          <header class="rp-pure-section-head"><div><h2><i class="rp-section-icon network" aria-hidden="true"></i>Research network and connected locations</h2><p>Locations shown here are configured from the researcher's public profile and research record.${collaborationLocations.length ? ` Explore the markers or <button type="button" data-map-list>select a location from the list</button>.` : " No verified location data has been added yet."}</p></div></header>
          <div class="rp-world-map" aria-label="World collaboration map">
            <img src="${asset("assets/world-map-blank.png")}" alt="World map showing collaboration locations">
            ${collaborationLocations.map((location) => `<button type="button" data-map-location="${attr(location.label)}" style="left:${Number(location.x) || 50}%;top:${Number(location.y) || 50}%" aria-label="${attr(location.label)}: ${attr(location.detail || "Connected location")}"><span><b>${text(location.label)}</b>${location.detail ? `<small>${text(location.detail)}</small>` : ""}</span></button>`).join("")}
            ${collaborationLocations.length ? "" : `<div class="rp-map-empty"><strong>Location data pending</strong><span>Add locations in this researcher's JSON profile.</span></div>`}
          </div>
          ${collaborationLocations.length ? `<div class="rp-map-list" data-map-panel hidden><h3>Select a connected location</h3>${collaborationLocations.map((location) => `<button type="button" data-map-location-select="${attr(location.label)}">${text(location.label)}${location.detail ? ` - ${text(location.detail)}` : ""}</button>`).join("")}</div>` : ""}
          ${person.sourceUrl ? `<a class="rp-map-explore" href="${attr(person.sourceUrl)}">Explore the source profile</a>` : `<a class="rp-map-explore" href="${url("research/profile/")}">Return to research profiles</a>`}
        </section>

        <section id="rp-outputs" class="rp-pure-section rp-pure-outputs reveal" data-profile-search-section>
          <header class="rp-pure-section-head"><div><p class="eyebrow">${isOwnerProfile ? "Work in progress" : "Research record"}</p><h2>${isOwnerProfile ? "Working papers" : "Research output"}</h2></div><span class="rp-section-total">${metrics.totalOutputs} ${isOwnerProfile ? "unpublished drafts" : "total outputs"}</span></header>
          <div class="rp-output-overview">
            <div class="rp-output-types" data-output-types>
              ${metrics.outputTypes.map((item, index) => `<div class="${index > 3 ? "rp-output-more" : ""}"><strong>${item.count}</strong><span>${text(item.label)}</span></div>`).join("")}
              ${metrics.outputTypes.length > 4 ? `<button type="button" data-output-toggle aria-expanded="false">${metrics.outputTypes.length - 4} more output types</button>` : ""}
            </div>
            <div class="rp-output-chart"><h3>${isOwnerProfile ? "Working papers by year" : "Research output per year"}</h3>${renderActivityChart(metrics.activity, isOwnerProfile ? "working-paper drafts" : "research outputs")}</div>
          </div>
          <div class="rp-pure-output-list">
            ${metrics.outputs.length ? metrics.outputs.map((item) => {
              const href = item.href || (item.url ? url(item.url) : "#");
              return `<a class="rp-pure-output-item" data-profile-search-item href="${attr(href)}"><span class="rp-output-year">${item.year}</span><div><small>${text(item.type)}</small><h3>${text(item.title)}</h3><p>${text(item.authors)} - ${text(item.venue)}</p><div>${item.openAccess ? `<em>Open access</em>` : ""}${Number(item.citationCount) ? `<em>${Number(item.citationCount)} citation${Number(item.citationCount) === 1 ? "" : "s"}</em>` : ""}</div></div><span aria-hidden="true">-&gt;</span></a>`;
            }).join("") : `<div class="rp-empty">No research records currently match this researcher's author names.</div>`}
          </div>
          ${person.sourceUrl ? `<a class="rp-text-link" href="${attr(person.sourceUrl)}">View all ${metrics.totalOutputs} research outputs -&gt;</a>` : `<a class="rp-text-link" href="${url("research/publications/")}">View all working papers -&gt;</a>`}
        </section>

        ${renderProfileRecordSection("rp-prizes", "Recognition", "Prizes", person.prizes, `${metrics.prizeCount} total prizes`)}
        ${renderProfileRecordSection("rp-activities", "Engagement", "Activities", person.activities, `${metrics.activityCount} total activities`)}
        ${renderProfileRecordSection("rp-media", "Press / media", "Media contributions", person.media, (person.media || []).length ? `${person.media.length} media contribution` : "")}

        <aside class="rp-share-rail" aria-label="Share profile">
          <button type="button" data-share-profile title="Copy profile link">↗</button>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" aria-label="Share on Facebook">f</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" aria-label="Share on LinkedIn">in</a>
          <a href="mailto:?subject=${encodeURIComponent(person.name + " research profile")}&body=${encodeURIComponent(window.location.href)}" aria-label="Share by email">@</a>
        </aside>
        <a class="rp-floating-top" href="#top" aria-label="Back to top">⌃</a>

        <dialog class="rp-fingerprint-dialog" data-fingerprint-dialog>
          <button type="button" class="rp-dialog-close" data-fingerprint-close aria-label="Close fingerprint details">×</button>
          <div class="rp-dialog-topic"><i class="rp-rank-donut" data-dialog-donut aria-hidden="true"></i><div><small data-dialog-thesaurus></small><h2 data-dialog-title></h2></div></div>
          <div class="rp-dialog-score"><strong data-dialog-score></strong><span>Fingerprint strength</span></div>
          <p data-dialog-description></p>
          <section><h3>${isOwnerProfile ? "Supporting working-paper drafts" : "Supporting research outputs"}</h3><div data-dialog-outputs></div></section>
          <section><h3>Related topics</h3><div class="rp-dialog-related" data-dialog-related></div></section>
          ${person.sourceUrl ? `<a class="rp-dialog-source" href="${attr(person.sourceUrl)}">Open source fingerprint</a>` : ""}
        </dialog>

        ${researchProfileLoader()}

        <footer class="rp-source-note">
          <p>${isOwnerProfile ? `This profile currently lists ${metrics.totalOutputs} local working-paper record${metrics.totalOutputs === 1 ? "" : "s"} and does not claim peer-reviewed publications. Topics recalculate from profile interests and any verified working-paper JSON.` : "Profile metrics with an external source are a saved snapshot and may change at the provider. Local profiles recalculate automatically from this site's research-record JSON."}</p>
          ${person.sourceUrl ? `<a href="${attr(person.sourceUrl)}">Open source profile</a>` : ""}
        </footer>

      </section>
    `;
  }

  function renderResearchDetail(item) {
    return `
      <section class="page-hero detail-hero">
        ${backLink("research/", "Back to research")}
        ${sectionHeader(`Research ${item.number}`, item.title, item.dek)}
        <div class="tag-row reveal">${item.tags.map((tag) => `<em>${tag}</em>`).join("")}</div>
      </section>
      <section class="article-layout">
        <aside class="side-index reveal">
          <a href="${url("research/")}">All research</a>
          <a href="${url("research/publications/")}">Related working papers</a>
          <a href="${url("get-involved/contact/")}">Collaborate</a>
        </aside>
        <article class="prose reveal">
          ${text(item.body).map((paragraph) => `<p>${paragraph}</p>`).join("")}
          <h2>Representative questions</h2>
          <ul>
            <li>How should systems communicate uncertainty when signals are limited?</li>
            <li>How can small teams build reproducible evaluation at low cost?</li>
            <li>How can prototypes stay connected to real field needs?</li>
          </ul>
        </article>
      </section>
    `;
  }

  function renderTimeline() {
    const back = pageKey.includes("/") ? backLink("research/", "Back to research") : "";
    return `
      <section class="page-hero">${back}${sectionHeader(page.kicker, page.title, page.intro)}</section>
      <section class="timeline">
        ${page.entries.map((entry) => `
          <article class="timeline-item reveal">
            <time>${entry.year}</time>
            <div><h2>${text(entry.title)}</h2><p>${text(entry.text)}</p>${entry.href ? `<a href="${attr(entry.href)}" target="_blank" rel="noopener noreferrer">${text(entry.linkLabel || "View on LinkedIn")} -&gt;</a>` : ""}</div>
          </article>
        `).join("")}
      </section>
    `;
  }

  function renderTeam() {
    const people = data.team.map(resolvedTeamMember);
    return `
      <section class="page-hero">${sectionHeader(page.kicker, page.title, page.intro)}</section>
      <section class="people-grid">
        ${people.map((person) => `
          <a class="person-card reveal" href="${url(person.url)}">
            <span class="person-photo">
              <img src="${researcherPhoto(person)}" alt="">
            </span>
            <span class="person-card-body">
              <small>Team Member</small>
              <h2>${text(person.name)}</h2>
              <p>${text(person.role)}</p>
            </span>
            <span class="person-card-action">View profile</span>
          </a>
        `).join("")}
      </section>
    `;
  }

  function renderPerson(person) {
    person = resolvedTeamMember(person);
    return `
      <section class="page-hero">${backLink("research/team/", "Back to team")}${sectionHeader("Team member", person.name, person.role)}</section>
      <section class="two-column">
        <div class="portrait-card reveal"><img src="${researcherPhoto(person)}" alt="${text(person.name)}"></div>
        <article class="prose reveal">
          <p>${text(person.bio)}</p>
          ${person.linkedin ? `<p><a class="button primary" href="${attr(person.linkedin)}">View LinkedIn profile</a></p>` : ""}
          <h2>Research interests</h2>
          <ul>${(person.interests || []).map((interest) => `<li>${text(interest)}</li>`).join("")}</ul>
        </article>
      </section>
    `;
  }

  function renderPublications() {
    return `
      <section class="page-hero">${sectionHeader(page.kicker, page.title, page.intro)}</section>
      <section class="publication-list">${data.publications.map(publicationCard).join("")}</section>
    `;
  }

  function renderPublication(item) {
    return `
      <section class="page-hero">${backLink("research/publications/", "Back to working papers")}${sectionHeader(item.type, item.title, item.abstract)}</section>
      <section class="article-layout">
        <aside class="side-index reveal">
          <span>${item.year}</span>
          <span>${item.authors}</span>
          <span>${text(item.venue)}</span>
          ${item.status ? `<span>Status: ${text(item.status)}</span>` : ""}
        </aside>
        <article class="prose reveal">
          <h2>Draft abstract</h2>
          <p>${text(item.abstract)}</p>
          <p><strong>Disclosure:</strong> This is a working paper in progress, not a peer-reviewed or formally published article.</p>
          <h2>Resources</h2>
          ${item.paperUrl ? `<p><a class="button primary" href="${attr(item.paperUrl)}">Download working draft</a></p>` : `<p>No public working draft has been attached.</p>`}
          ${item.doi ? `<p><a href="https://doi.org/${attr(String(item.doi).replace(/^https?:\/\/(?:dx\.)?doi\.org\//, ""))}">View DOI record</a></p>` : ""}
        </article>
      </section>
    `;
  }

  function renderFirebaseAdmin() {
    return `
      <section class="page-hero admin-hero">${sectionHeader(page.kicker, page.title, page.intro)}</section>
      <section class="admin-shell">
        <aside class="admin-auth-card reveal" data-admin-auth>
          <span class="admin-lock" aria-hidden="true"></span>
          <div><h2>Researcher access</h2><p data-admin-auth-copy>Checking backend configuration...</p></div>
          <button class="button primary" type="button" data-admin-sign-in>Sign in with Google</button>
          <button class="button" type="button" data-admin-sign-out hidden>Sign out</button>
        </aside>
        <div class="admin-setup notice-panel" data-admin-setup hidden>
          <h2>Connect Firebase once</h2>
          <p>Add the Firebase web configuration to <code>js/firebase-config.js</code>, enable Google Authentication, and deploy the included rules. Any Google account with a verified email can create and maintain its own profile; optional <code>admins/YOUR_UID</code> records grant site-wide management access.</p>
          <a href="https://console.firebase.google.com/">Open Firebase Console</a>
        </div>
        <div class="admin-denied notice-panel" data-admin-denied hidden>
          <h2 data-admin-denied-title>Verified email required</h2>
          <p data-admin-denied-copy>Verify the email address attached to this account before editing. Your UID is <code data-admin-uid></code>.</p>
        </div>
        <div class="admin-workspace" data-admin-workspace hidden>
          <form class="admin-profile-form" data-own-profile-form>
            <div class="admin-form-heading"><div><span>Researcher identity</span><h2>Edit your public profile</h2></div><strong data-profile-save-state></strong></div>
            <div class="admin-profile-layout">
              <label class="admin-photo-field"><span>Profile photo</span><img data-own-profile-preview src="${asset(data.profile.headshot)}" alt="Profile photo preview"><input type="file" name="photo" accept="image/jpeg,image/png,image/webp"><small>JPEG, PNG, or WebP; maximum 5 MB</small></label>
              <div class="admin-field-grid">
                <label>Display name<input required name="name" autocomplete="name"></label>
                <label>Profile URL slug<input required name="slug" pattern="[a-z0-9-]+"></label>
                <label>Role or title<input required name="role"></label>
                <label>Profile visibility<select name="status"><option value="public">Public</option><option value="private">Private</option></select></label>
                <label class="admin-field-wide">Affiliations <small>One per line</small><textarea name="affiliations" rows="3"></textarea></label>
                <label class="admin-field-wide">Biography<textarea required name="bio" rows="6"></textarea></label>
                <label>Google Scholar URL<input type="url" name="scholarUrl"></label>
                <label>ORCID URL<input type="url" name="orcid"></label>
                <label>Phone<input name="phone" autocomplete="tel"></label>
                <label>Public contact email<input type="email" name="publicEmail"></label>
                <label class="admin-field-wide">Research interests <small>Comma-separated; also used by fingerprinting</small><textarea name="interests" rows="3"></textarea></label>
              </div>
            </div>
            <div class="admin-form-actions"><button class="button primary" type="submit">Save my profile</button><span data-profile-progress></span></div>
          </form>
          <section class="admin-managed-profiles" id="curated-profiles" data-managed-profiles hidden>
            <form data-managed-profile-form>
              <input type="hidden" name="id">
              <div class="admin-form-heading"><div><span>Site administrator</span><h2>Add a curated researcher profile</h2></div><button type="reset">Clear form</button></div>
              <div class="admin-field-grid">
                <label>Display name<input required name="name"></label>
                <label>Profile slug<input required name="slug" pattern="[a-z0-9-]+"></label>
                <label>Role or title<input required name="role"></label>
                <label>Visibility<select name="status"><option value="public">Public</option><option value="private">Private</option></select></label>
                <label class="admin-field-wide">Profile photo URL<input name="photo" placeholder="https://... or assets/photo.jpg"></label>
                <label class="admin-field-wide">Affiliations <small>One per line</small><textarea name="affiliations" rows="3"></textarea></label>
                <label class="admin-field-wide">Biography<textarea required name="bio" rows="5"></textarea></label>
                <label class="admin-field-wide">Research interests <small>Comma-separated</small><textarea name="interests" rows="3"></textarea></label>
                <label>Source profile URL<input type="url" name="sourceUrl"></label>
                <label>Google Scholar URL<input type="url" name="scholarUrl"></label>
                <label>ORCID URL<input type="url" name="orcid"></label>
                <label>Public email<input type="email" name="publicEmail"></label>
              </div>
              <div class="admin-form-actions"><button class="button primary" type="submit">Save curated profile</button><span data-managed-profile-progress></span></div>
            </form>
            <aside><header><div><span>Profile directory</span><h2>Managed researchers</h2></div><strong data-managed-profile-count>0</strong></header><div data-managed-profile-list></div></aside>
          </section>
          <form class="admin-publication-form" data-publication-form>
            <input type="hidden" name="id">
            <div class="admin-form-heading"><div><span>Publication record</span><h2>Add or edit a paper</h2></div><button type="reset">Clear form</button></div>
            <div class="admin-field-grid">
              <label class="admin-field-wide">Title<input required name="title"></label>
              <label>URL slug<input required name="slug" pattern="[a-z0-9-]+" placeholder="paper-title"></label>
              <label>Year<input required name="year" inputmode="numeric" pattern="[0-9]{4}"></label>
              <label>Output type<input required name="type" value="Journal article"></label>
              <label>Status<select name="status"><option value="published">Published</option><option value="draft">Draft</option></select></label>
              <label class="admin-field-wide">Authors<input required name="authors" placeholder="Name One, Name Two"></label>
              <label class="admin-field-wide">Journal or venue<input name="venue"></label>
              <label class="admin-field-wide">Abstract<textarea required name="abstract" rows="7"></textarea></label>
              <label class="admin-field-wide">Keywords <small>Optional — leave empty to extract them automatically</small><textarea name="keywords" rows="3" placeholder="GNSS, Urban positioning, Sensor fusion"></textarea></label>
              <label>Citation count<input type="number" min="0" name="citationCount" value="0"></label>
              <label>DOI<input name="doi" placeholder="10.xxxx/xxxxx"></label>
              <label class="admin-checkbox"><input type="checkbox" name="openAccess"> Open access</label>
              <fieldset class="admin-field-wide"><legend>Researcher profiles</legend><div class="admin-profile-options">${data.team.map((person) => `<label><input type="checkbox" name="profileSlugs" value="${attr(person.slug)}"> ${text(person.name)}</label>`).join("")}</div></fieldset>
              <label class="admin-field-wide">Paper PDF <small>Optional, maximum 25 MB</small><input type="file" name="paper" accept="application/pdf"></label>
            </div>
            <div class="admin-form-actions"><button class="button primary" type="submit">Save publication</button><span data-admin-progress></span></div>
          </form>
          <section class="admin-library">
            <header><div><span>Library</span><h2>Uploaded publications</h2></div><strong data-admin-count>0</strong></header>
            <div data-admin-list></div>
          </section>
        </div>
      </section>
    `;
  }

  function renderAdmin() {
    const repository = "https://github.com/blxchen/blxchen.github.io";
    return `
      <section class="page-hero admin-hero">${backLink("research/profile/", "Return to research profiles")}${sectionHeader(page.kicker, page.title, page.intro)}</section>
      <section class="static-admin-shell" data-static-admin>
        <header class="static-admin-status reveal">
          <span aria-hidden="true">$0</span>
          <div><p class="eyebrow">GitHub Pages content system</p><h2>No database, subscription, or cloud storage required</h2><p>Every public change is version-controlled, reviewable, and recoverable through Git.</p></div>
        </header>

        <div class="static-admin-grid">
          <article class="static-admin-card reveal">
            <strong>01</strong><span>Researcher profiles</span>
            <h2>Edit people and fingerprints</h2>
            <p>Add or edit one JSON file per researcher. Brandon's photo path, LinkedIn, biography, interests, CV text, and experience link are centralized in <code>content/team/brandon-chen.json</code>.</p>
            <div><a href="${repository}/blob/main/content/team/brandon-chen.json" target="_blank" rel="noopener noreferrer">Edit Brandon's central profile</a><a href="${repository}/tree/main/content/team" target="_blank" rel="noopener noreferrer">Open all profiles</a><a href="${repository}/blob/main/content/templates/research-profile.example.json" target="_blank" rel="noopener noreferrer">View profile template</a></div>
          </article>
          <article class="static-admin-card reveal">
            <strong>02</strong><span>Working papers</span>
            <h2>Maintain drafts without overclaiming</h2>
            <p>Create one JSON file per working paper. Keep its unpublished status explicit; add keywords, profile slugs, and an optional draft PDF under <code>assets/papers/</code>.</p>
            <div><a href="${repository}/tree/main/content/publications" target="_blank" rel="noopener noreferrer">Open papers on GitHub</a><a href="${repository}/blob/main/content/templates/publication.example.json" target="_blank" rel="noopener noreferrer">View paper template</a></div>
          </article>
          <article class="static-admin-card reveal">
            <strong>03</strong><span>Recruitment</span>
            <h2>Create recruitment opportunities</h2>
            <p>Copy the recruitment template to add opportunities with perks, requirements, fit indicators, preferences, and a clear engagement note.</p>
            <div><a href="${repository}/tree/main/content/recruitment" target="_blank" rel="noopener noreferrer">Open recruitment content</a><a href="${repository}/blob/main/content/templates/recruitment.example.json" target="_blank" rel="noopener noreferrer">View recruitment template</a></div>
          </article>
          <article class="static-admin-card reveal">
            <strong>04</strong><span>Build and publish</span>
            <h2>Regenerate the website</h2>
            <p>Run the generator after editing JSON. It rebuilds the public data bundle and creates each matching profile and working-paper page.</p>
            <div class="static-command"><code>node tools/generate-pages.js</code><button type="button" data-copy-command="node tools/generate-pages.js">Copy</button></div>
          </article>
        </div>

        <section class="static-publish-flow reveal">
          <header><p class="eyebrow">VS Code workflow</p><h2>Four steps from edit to live site</h2></header>
          <ol>
            <li><span>1</span><div><strong>Edit</strong><p>Change files in <code>content/team/</code>, <code>content/publications/</code>, or <code>content/recruitment/</code>.</p></div></li>
            <li><span>2</span><div><strong>Generate</strong><p>Run <code>node tools/generate-pages.js</code>.</p></div></li>
            <li><span>3</span><div><strong>Preview</strong><p>Run <code>py -m http.server 8080</code> and open localhost.</p></div></li>
            <li><span>4</span><div><strong>Publish</strong><p>Commit and push to <code>main</code>; GitHub Pages deploys automatically.</p></div></li>
          </ol>
          <div class="static-publish-actions"><a class="button primary" href="${repository}/blob/main/EDITING-GUIDE.md" target="_blank" rel="noopener noreferrer">Open full editing guide</a><a class="button" href="${repository}/actions" target="_blank" rel="noopener noreferrer">View deployments</a></div>
        </section>
      </section>
    `;
  }

  function renderCollection() {
    const items = data[page.collection] || [];
    return `
      <section class="page-hero">${sectionHeader(page.kicker, page.title, page.intro)}</section>
      <section class="collection-grid">${items.map((item) => collectionCard(item, page.collection)).join("")}</section>
    `;
  }

  function renderEntry(item, type, backPath) {
    const bodyText = item.body ? text(item.body) : [text(item.dek)];
    return `
      <section class="page-hero">${backLink(backPath, `Back to ${type}`)}${sectionHeader(type, item.title, item.dek)}</section>
      <section class="article-layout">
        <aside class="side-index reveal"><span>${item.date || ""}</span><a href="${url(backPath)}">Back to list</a></aside>
        <article class="prose reveal">${bodyText.map((paragraph) => `<p>${paragraph}</p>`).join("")}</article>
      </section>
    `;
  }

  function renderCv() {
    const owner = data.team.find((person) => person.slug === "brandon-chen") || {};
    const workingPapers = publicationsFor(owner).filter((item) => item.type === "Working paper");
    const configuredGroups = owner.cv || [];
    const groups = configuredGroups.length ? configuredGroups.map((group) => {
      if (group.source === "workingPapers") return { ...group, items: workingPapers.map((item) => ({ label: item.title, href: url(item.url), note: "In progress — not published" })) };
      if (group.source === "profiles") return { ...group, items: [
        owner.linkedin ? { label: "LinkedIn", href: owner.linkedin, note: "Current professional profile" } : null,
        owner.orcid ? { label: "ORCID", href: owner.orcid } : null,
        owner.github ? { label: "GitHub", href: owner.github } : null
      ].filter(Boolean) };
      return group;
    }) : [
      { title: "Research interests", items: (owner.interests || []).map((label) => ({ label })) },
      { title: "Experience", items: [{ label: "Professional experience and project history", href: owner.linkedin, note: "Maintained on LinkedIn" }] },
      { title: "Working papers", items: workingPapers.map((item) => ({ label: item.title, href: url(item.url), note: "In progress — not published" })) }
    ];
    return `
      <section class="page-hero">${sectionHeader(page.kicker, page.title, page.intro)}</section>
      <section class="cv-grid">
        ${groups.map((group) => `
          <article class="cv-card reveal">
            <h2>${text(group.title)}</h2>
            <ul>${group.items.map((item) => `<li>${item.href ? `<a href="${attr(item.href)}"${String(item.href).startsWith("http") ? ` target="_blank" rel="noopener noreferrer"` : ""}>${text(item.label)}</a>` : text(item.label)}${item.note ? `<small>${text(item.note)}</small>` : ""}</li>`).join("")}</ul>
          </article>
        `).join("")}
      </section>
    `;
  }

  function renderContact() {
    return `
      <section class="page-hero">${pageKey.includes("/") ? backLink("get-involved/", "Back to get involved") : ""}${sectionHeader(page.kicker, page.title, page.intro)}</section>
      <section class="contact-layout">
        <form class="contact-form reveal" id="contact-form">
          <label>Name<input required name="name" autocomplete="name"></label>
          <label>Email<input required type="email" name="email" autocomplete="email"></label>
          <label>Subject<input required name="subject"></label>
          <label>Message<textarea required name="message" rows="7"></textarea></label>
          <button class="button primary" type="submit">Send email</button>
        </form>
        <aside class="contact-card reveal">
          <h2>${data.profile.name}</h2>
          <p>${text(data.contact.location)}</p>
          <a href="mailto:${data.contact.email}">${data.contact.email}</a>
        </aside>
      </section>
    `;
  }

  function renderGetInvolved() {
    const cards = [
      {
        label: "Contact",
        title: "Start a conversation",
        copy: "Send a note about collaborations, talks, media requests, student projects, or research ideas.",
        action: "Open contact form",
        href: "get-involved/contact/"
      },
      {
        label: "Recruitment",
        title: "Open roles and project slots",
        copy: "Browse editable position cards for research assistants, collaborators, and project-based opportunities.",
        action: "View recruitment",
        href: "get-involved/recruitment/"
      }
    ];

    return `
      <section class="page-hero">${sectionHeader(page.kicker, page.title, page.intro)}</section>
      <section class="involved-grid">${cards.map(getInvolvedCard).join("")}</section>
    `;
  }

  function searchItems() {
    const pageItems = Object.entries(data.pages)
      .filter(([key]) => key !== "home")
      .map(([key, value]) => ({
        title: value.title,
        dek: value.intro || value.kicker || "",
        url: `${key}/`,
        type: "Page"
      }));

    return [
      ...pageItems,
      ...data.research.map((item) => ({ ...item, type: "Research" })),
      ...data.publications.map((item) => ({ ...item, dek: item.abstract, type: item.type || "Working paper" })),
      ...data.team.map((item) => ({ title: item.name, dek: `${item.role}. ${item.bio}`, url: item.url, type: "Team" })),
      ...data.media.map((item) => ({ ...item, type: "Media" })),
      ...data.news.map((item) => ({ ...item, type: "News" })),
      ...data.blog.map((item) => ({ ...item, type: "Blog" })),
      ...data.recruitment.map((item) => ({ ...item, type: "Recruitment" }))
    ];
  }

  function renderSearchResults(query) {
    const needle = query.trim().toLowerCase();
    const safeQuery = attr(query);
    const results = searchItems()
      .map((item) => {
        const haystack = [
          item.title,
          item.name,
          item.dek,
          item.abstract,
          item.role,
          item.type,
          ...(item.tags || []),
          ...(item.keywords || [])
        ].join(" ").toLowerCase();
        const title = String(item.title || item.name || "");
        const score = title.toLowerCase().includes(needle) ? 2 : haystack.includes(needle) ? 1 : 0;
        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || String(a.title || a.name).localeCompare(String(b.title || b.name)));

    return `
      <section class="page-hero search-hero">
        ${sectionHeader("Search", `Results for "${safeQuery}"`, results.length ? `${results.length} matching page${results.length === 1 ? "" : "s"} found.` : "No matching pages found. Try another term.")}
      </section>
      <section class="collection-grid search-results">
        ${results.map((item) => `
          <a class="collection-card search-card reveal" href="${url(item.url)}">
            <span>${text(item.type)}</span>
            <h2>${text(item.title || item.name)}</h2>
            <p>${text(item.dek || item.abstract || item.role)}</p>
          </a>
        `).join("")}
      </section>
    `;
  }

  function renderRecruitment() {
    return `
      <section class="page-hero">${backLink("get-involved/", "Back to get involved")}${sectionHeader(page.kicker, page.title, page.intro)}</section>
      <section class="recruitment-grid">${data.recruitment.map(recruitmentCard).join("")}</section>
    `;
  }

  function renderRecruitmentDetail(item) {
    return `
      <section class="page-hero detail-hero">
        ${backLink("get-involved/recruitment/", "Back to recruitment")}
        ${sectionHeader(text(item.type), item.title, item.dek)}
        <div class="tag-row reveal">${(item.tags || []).map((tag) => `<em>${tag}</em>`).join("")}</div>
      </section>
      <section class="article-layout">
        <aside class="side-index reveal">
          <span>${text(item.location)}</span>
          <span>Deadline: ${text(item.deadline)}</span>
          <a href="#apply">Apply now</a>
        </aside>
        <article class="prose reveal">
          ${text(item.body).map((paragraph) => `<p>${paragraph}</p>`).join("")}
          ${item.perks && item.perks.length ? `<h2>Perks</h2><ul>${item.perks.map((entry) => `<li>${text(entry)}</li>`).join("")}</ul>` : ""}
          ${item.requirements && item.requirements.length ? `<h2>Requirements</h2><ul>${item.requirements.map((entry) => `<li>${text(entry)}</li>`).join("")}</ul>` : ""}
          ${item.fitIf && item.fitIf.length ? `<h2>You might be a fit if</h2><ul>${item.fitIf.map((entry) => `<li>${text(entry)}</li>`).join("")}</ul>` : ""}
          ${item.preferred && item.preferred.length ? `<h2>We prefer</h2><ul>${item.preferred.map((entry) => `<li>${text(entry)}</li>`).join("")}</ul>` : ""}
          ${item.engagementNote ? `<p><strong>Collaboration note:</strong> ${text(item.engagementNote)}</p>` : ""}
          <section class="application-panel" id="apply">
            <h2>Apply</h2>
            <form class="contact-form application-form" data-position="${text(item.title)}">
              <label>Name<input required name="name" autocomplete="name"></label>
              <label>Email<input required type="email" name="email" autocomplete="email"></label>
              <label>Portfolio or CV link<input name="link" autocomplete="url"></label>
              <label>Message<textarea required name="message" rows="7"></textarea></label>
              <button class="button primary" type="submit">Email application</button>
            </form>
          </section>
        </article>
      </section>
    `;
  }

  function bindContactForm() {
    const form = $("#contact-form");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const subject = encodeURIComponent(formData.get("subject"));
      const bodyLines = [
        `Name: ${formData.get("name")}`,
        `Email: ${formData.get("email")}`,
        "",
        formData.get("message")
      ];
      window.location.href = `mailto:${data.contact.email}?subject=${subject}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    });
  }

  function bindApplicationForms() {
    document.querySelectorAll(".application-form").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const position = form.dataset.position || "Application";
        const subject = encodeURIComponent(`Application: ${position}`);
        const bodyLines = [
          `Position: ${position}`,
          `Name: ${formData.get("name")}`,
          `Email: ${formData.get("email")}`,
          `Portfolio/CV: ${formData.get("link") || ""}`,
          "",
          formData.get("message")
        ];
        window.location.href = `mailto:${data.contact.email}?subject=${subject}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
      });
    });
  }

  function bindRevealAnimations() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("visible", "is-revealed", "is-reveal-complete"));
      return;
    }

    items.forEach((item) => item.classList.add("reveal-target"));

    const parseDelay = (value, fallback) => {
      const parsed = Number.parseFloat(String(value || "").trim());
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
    };

    const parseDuration = (value) => {
      const match = String(value || "").trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+))(ms|s)$/);
      if (!match) return 700;
      const amount = Number.parseFloat(match[1]);
      if (!Number.isFinite(amount) || amount < 0) return 700;
      return match[2] === "s" ? amount * 1000 : amount;
    };

    const revealEffectCard = (item, delay) => {
      if (item.classList.contains("is-reveal-complete")) {
        item.classList.add("visible", "is-revealed");
        item.classList.remove("is-revealing");
        return;
      }
      let complete = false;
      const duration = parseDuration(getComputedStyle(item).getPropertyValue("--effect-card-reveal-duration"));
      let fallbackTimer;
      const finish = () => {
        if (complete) return;
        complete = true;
        window.clearTimeout(fallbackTimer);
        item.removeEventListener("transitionend", onTransitionEnd);
        item.style.transitionDelay = "";
        item.classList.remove("is-revealing");
        item.classList.add("is-reveal-complete");
      };
      const onTransitionEnd = (event) => {
        if (event.target === item && (event.propertyName === "opacity" || event.propertyName === "transform")) finish();
      };

      item.classList.add("is-revealing");
      item.style.transitionDelay = `${delay}ms`;
      item.addEventListener("transitionend", onTransitionEnd);
      item.classList.add("visible", "is-revealed");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
      } else {
        fallbackTimer = window.setTimeout(finish, delay + duration + 100);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const item = entry.target;
          const fallbackDelay = item.parentNode ? [...item.parentNode.children].indexOf(item) * 80 : [...items].indexOf(item) * 42;
          const delay = Math.min(parseDelay(item.dataset.revealDelay, fallbackDelay), 600);
          if (item.classList.contains("motion-card") || item.classList.contains("metric")) {
            revealEffectCard(item, delay);
          } else {
            item.style.transitionDelay = `${delay}ms`;
            item.classList.add("visible", "is-revealed");
          }
          observer.unobserve(item);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach((item) => observer.observe(item));
  }

  function bindInteractiveCards() {
    const cards = document.querySelectorAll(".research-card, .collection-card, .publication-card, .person-card, .cv-card, .notice-panel, .intro-panel, .portrait-card, .contact-card, .home-tab-panel, .cap-card, .status-panel, .status-card, .involved-card, .recruitment-card, .application-panel");
    cards.forEach((card) => card.classList.add("motion-card", "effect-card"));

    if (window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;

    cards.forEach((card) => {
      let rect = null;
      const revealDone = () => !card.classList.contains("is-revealing") && (!card.classList.contains("effect-card") || card.classList.contains("is-reveal-complete"));
      const setTilt = (clientX, clientY) => {
        if (!rect) rect = card.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const px = x / rect.width - 0.5;
        const py = y / rect.height - 0.5;
        card.style.setProperty("--mx", `${x}px`);
        card.style.setProperty("--my", `${y}px`);
        card.style.setProperty("--rx", `${(-py * 7).toFixed(2)}deg`);
        card.style.setProperty("--ry", `${(px * 9).toFixed(2)}deg`);
      };
      card.addEventListener("pointermove", (event) => {
        if (!revealDone()) return;
        if (!card.classList.contains("is-tilting")) card.classList.add("is-tilting", "is-tracking");
        setTilt(event.clientX, event.clientY);
      });
      card.addEventListener("pointerenter", (event) => {
        if (!revealDone()) return;
        rect = card.getBoundingClientRect();
        card.classList.add("is-hovered", "is-tracking", "is-tilting");
        setTilt(event.clientX, event.clientY);
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-hovered", "is-tracking", "is-tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        rect = null;
      });
      card.addEventListener("focusin", () => {
        card.classList.add("is-hovered");
        card.style.setProperty("--mx", "50%");
        card.style.setProperty("--my", "38%");
        card.style.setProperty("--rx", "2.5deg");
        card.style.setProperty("--ry", "-3deg");
      });
      card.addEventListener("focusout", () => {
        card.classList.remove("is-hovered");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  function bindAnimatedCounters() {
    const counters = document.querySelectorAll(".metric strong");
    const parseStat = (value) => {
      const match = String(value || "").trim().match(/^([\d.]+)([KMB]?)([+xX])?$/);
      if (!match) return null;
      const number = Number.parseFloat(match[1]);
      if (!Number.isFinite(number)) return null;
      return {
        value: number,
        magnitude: match[2] || "",
        tail: match[3] || "",
        decimals: match[1].includes(".") ? 1 : 0
      };
    };
    const format = (value, info) => `${info.decimals ? value.toFixed(info.decimals) : Math.round(value)}${info.magnitude}${info.tail}`;
    const animate = (counter, info) => {
      const start = performance.now();
      const duration = 1100;
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = format(info.value * eased, info);
        if (progress < 1) requestAnimationFrame(tick);
        else counter.textContent = format(info.value, info);
      };
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const counter = entry.target;
        const original = counter.dataset.originalText || counter.textContent;
        counter.dataset.originalText = original;
        const info = parseStat(original);
        if (info) {
          counter.textContent = format(0, info);
          animate(counter, info);
        }
        observer.unobserve(counter);
      });
    }, { threshold: 0.5 });
    counters.forEach((counter) => observer.observe(counter));
  }

  function bindHomeTabs() {
    document.querySelectorAll("[data-home-tabs]").forEach((tabs) => {
      const buttons = [...tabs.querySelectorAll("[data-home-tab]")];
      const panels = [...tabs.querySelectorAll("[data-home-panel]")];
      const setActive = (key) => {
        buttons.forEach((button) => {
          const active = button.dataset.homeTab === key;
          button.classList.toggle("active", active);
          button.setAttribute("aria-selected", String(active));
        });
        panels.forEach((panel) => {
          const active = panel.dataset.homePanel === key;
          panel.classList.toggle("active", active);
          panel.classList.remove("is-hovered", "is-tracking", "is-tilting");
          panel.style.setProperty("--rx", "0deg");
          panel.style.setProperty("--ry", "0deg");
          if (active) {
            panel.classList.remove("is-revealing");
            panel.classList.add("visible", "is-revealed", "is-reveal-complete");
            panel.style.animation = "none";
            panel.offsetHeight;
            panel.style.animation = "";
          }
        });
      };
      buttons.forEach((button) => {
        button.addEventListener("click", () => setActive(button.dataset.homeTab));
        button.addEventListener("focus", () => setActive(button.dataset.homeTab));
      });
    });
  }

  function bindSatelliteReadout() {
    const sat = $("[data-sat-count]");
    const hdop = $("[data-hdop]");
    if (!sat || !hdop || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tick = () => {
      const visible = 13 + Math.floor(Math.random() * 5);
      const total = 24;
      const quality = (0.7 + Math.random() * 0.5).toFixed(1);
      sat.textContent = `${visible} / ${total}`;
      hdop.textContent = quality;
      sat.classList.remove("pulse-text");
      hdop.classList.remove("pulse-text");
      sat.offsetHeight;
      sat.classList.add("pulse-text");
      hdop.classList.add("pulse-text");
    };

    tick();
    window.setInterval(tick, 2800);
  }

  function bindParallax() {
    const heroImage = $(".hero-image");
    if (!heroImage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.addEventListener("scroll", () => {
      heroImage.style.transform = `translateY(${window.scrollY * 0.06}px) scale(1.04)`;
    }, { passive: true });
  }

  function bindNewTabLinks() {
    const selectors = [
      ".site-footer a:not(.back-to-top)",
      ".cap-links a",
      ".link-row a",
      ".contact-card a",
      ".footer-button",
      ".involved-card",
      ".recruitment-card",
      ".search-card"
    ];
    document.querySelectorAll(selectors.join(", ")).forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (!href || href === "#top") return;
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }

  function bindResearchProfile() {
    if (pageKey !== "research/profile") return;
    const editor = $("[data-profile-editor]");
    const form = $("[data-profile-form]");
    const status = form ? $(".rp-form-status", form) : null;
    const loader = $("[data-profile-loader]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const enterProfile = (name, navigate) => {
      if (!loader) return navigate();
      const loaderName = $("[data-profile-loader-name]", loader);
      if (loaderName) loaderName.textContent = name || "Opening researcher profile";
      loader.classList.add("active");
      loader.setAttribute("aria-hidden", "false");
      body.classList.add("profile-is-loading");
      window.setTimeout(navigate, reducedMotion ? 80 : 900);
    };

    document.querySelectorAll("[data-profile-entry]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        enterProfile(link.dataset.profileName, () => { window.location.href = link.href; });
      });
    });

    document.querySelectorAll("[data-researcher]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = data.team.find((entry) => entry.slug === button.dataset.researcher);
        enterProfile(target && target.name, () => {
          activeResearcherSlug = button.dataset.researcher;
          const location = new URL(window.location.href);
          location.searchParams.set("person", activeResearcherSlug);
          window.history.replaceState({}, "", location);
          body.classList.remove("profile-is-loading");
          render();
        });
      });
    });

    document.querySelectorAll("[data-profile-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        const section = document.getElementById(button.dataset.profileJump);
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
        if (button.closest(".rp-pure-nav")) {
          document.querySelectorAll(".rp-pure-nav [data-profile-jump]").forEach((item) => item.classList.toggle("active", item === button));
        }
      });
    });

    const fingerprintCloud = $("[data-fingerprint-cloud]");
    const fingerprintToggle = $("[data-fingerprint-toggle]");
    if (fingerprintToggle && fingerprintCloud) {
      fingerprintToggle.addEventListener("click", () => {
        const expanded = fingerprintToggle.getAttribute("aria-expanded") === "true";
        fingerprintToggle.setAttribute("aria-expanded", String(!expanded));
        fingerprintCloud.classList.toggle("show-all", !expanded);
        fingerprintToggle.innerHTML = expanded
          ? `View full fingerprint (${fingerprintCloud.children.length}) <span aria-hidden="true">›</span>`
          : `Show overview fingerprint <span aria-hidden="true">‹</span>`;
      });
    }

    const fingerprintDialog = $("[data-fingerprint-dialog]");
    if (fingerprintDialog && fingerprintCloud) {
      const activePerson = resolvedTeamMember(data.team.find((entry) => entry.slug === activeResearcherSlug) || data.team[0]);
      const profileMetrics = calculateResearchProfile(activePerson);
      const meaningfulTerms = (label) => String(label || "").toLowerCase().match(/[a-z0-9-]{3,}/g) || [];
      const matchingOutputs = (topic) => {
        const label = topic.label.toLowerCase();
        const terms = meaningfulTerms(topic.label);
        return profileMetrics.outputs.filter((item) => {
          const haystack = [item.title, item.abstract, item.venue, ...(item.keywords || [])].join(" ").toLowerCase();
          return haystack.includes(label) || (terms.length && terms.filter((term) => haystack.includes(term)).length >= Math.min(2, terms.length));
        });
      };
      fingerprintCloud.querySelectorAll("[data-fingerprint-topic]").forEach((button) => {
        button.addEventListener("click", () => {
          const topic = profileMetrics.fingerprint.find((item) => item.label === button.dataset.fingerprintTopic);
          if (!topic) return;
          const evidence = matchingOutputs(topic);
          $("[data-dialog-title]", fingerprintDialog).textContent = topic.label;
          $("[data-dialog-thesaurus]", fingerprintDialog).textContent = topic.thesaurus || "Automatically extracted";
          $("[data-dialog-score]", fingerprintDialog).textContent = `${topic.score}%`;
          $("[data-dialog-donut]", fingerprintDialog).style.setProperty("--score", topic.score);
          const ownerDraft = activePerson.slug === "brandon-chen";
          const evidenceCopy = evidence.length
            ? `${topic.label} appears across ${evidence.length} ${ownerDraft ? "working-paper draft" : "research output"}${evidence.length === 1 ? "" : "s"} connected to ${activePerson.name}. The score is recalculated from profile topics and research-record metadata.`
            : `${topic.label} is part of ${activePerson.name}'s source or curated research fingerprint. Add matching research records to provide supporting evidence and recalculate its weight.`;
          $("[data-dialog-description]", fingerprintDialog).textContent = `${evidenceCopy} Raw weight ${topic.rawWeight}: ${topic.interestWeight} from profile interests plus ${topic.paperWeight} from paper evidence across ${topic.paperCount} matched record${topic.paperCount === 1 ? "" : "s"}. The displayed ${topic.score}% is normalized to the strongest topic.`;
          $("[data-dialog-outputs]", fingerprintDialog).innerHTML = evidence.length ? evidence.slice(0, 8).map((item) => {
            const href = item.href || item.paperUrl || item.url;
            const content = `<span>${attr(item.year || "")}</span><div><h4>${attr(item.title)}</h4><p>${attr(item.authors || item.venue || "")}</p></div>`;
            return href ? `<a href="${attr(String(href).startsWith("http") ? href : url(href))}">${content}</a>` : `<article>${content}</article>`;
          }).join("") : `<div class="rp-empty">No uploaded paper is linked to this topic yet.</div>`;
          const related = profileMetrics.fingerprint.filter((item) => item.label !== topic.label)
            .sort((a, b) => Number(b.thesaurus === topic.thesaurus) - Number(a.thesaurus === topic.thesaurus) || b.score - a.score)
            .slice(0, 6);
          $("[data-dialog-related]", fingerprintDialog).innerHTML = related.map((item) => `<button type="button" data-related-topic="${attr(item.label)}">${attr(item.label)} <small>${item.score}%</small></button>`).join("");
          $("[data-dialog-related]", fingerprintDialog).querySelectorAll("[data-related-topic]").forEach((relatedButton) => relatedButton.addEventListener("click", () => {
            const target = fingerprintCloud.querySelector(`[data-fingerprint-topic="${CSS.escape(relatedButton.dataset.relatedTopic)}"]`);
            if (target) target.click();
          }));
          if (typeof fingerprintDialog.showModal === "function") fingerprintDialog.showModal();
          else fingerprintDialog.setAttribute("open", "");
        });
      });
      $("[data-fingerprint-close]", fingerprintDialog).addEventListener("click", () => fingerprintDialog.close());
      fingerprintDialog.addEventListener("click", (event) => {
        if (event.target === fingerprintDialog) fingerprintDialog.close();
      });
    }

    document.querySelectorAll("[data-fingerprint-sort]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-fingerprint-sort]").forEach((item) => item.classList.toggle("active", item === button));
        if (!fingerprintCloud) return;
        const topics = Array.from(fingerprintCloud.children);
        topics.sort((a, b) => button.dataset.fingerprintSort === "alpha"
          ? a.dataset.label.localeCompare(b.dataset.label)
          : Number(b.dataset.score) - Number(a.dataset.score));
        topics.forEach((topic) => fingerprintCloud.appendChild(topic));
      });
    });

    const outputToggle = $("[data-output-toggle]");
    if (outputToggle) {
      outputToggle.addEventListener("click", () => {
        const container = $("[data-output-types]");
        const expanded = outputToggle.getAttribute("aria-expanded") === "true";
        outputToggle.setAttribute("aria-expanded", String(!expanded));
        container.classList.toggle("expanded", !expanded);
        outputToggle.textContent = expanded ? `${container.querySelectorAll(".rp-output-more").length} more output types` : "Show fewer output types";
      });
    }

    const profileSearch = $("[data-profile-search]");
    if (profileSearch) {
      profileSearch.addEventListener("input", () => {
        const query = profileSearch.value.trim().toLowerCase();
        document.querySelectorAll("[data-profile-search-item]").forEach((item) => {
          item.hidden = Boolean(query) && !item.textContent.toLowerCase().includes(query);
        });
      });
    }

    const networkSelect = $("[data-network-select]");
    if (networkSelect) {
      networkSelect.addEventListener("change", () => {
        document.querySelectorAll(".rp-network-map > button").forEach((node) => {
          node.classList.toggle("active", node.title === networkSelect.value);
        });
      });
    }
    const networkExplore = $("[data-network-explore]");
    if (networkExplore) {
      networkExplore.addEventListener("click", () => {
        $(".rp-network-map").classList.toggle("expanded");
        networkExplore.textContent = $(".rp-network-map").classList.contains("expanded") ? "Collapse network" : "Explore network further";
      });
    }

    const mapListButton = $("[data-map-list]");
    if (mapListButton) {
      mapListButton.addEventListener("click", () => {
        const panel = $("[data-map-panel]");
        if (!panel) return;
        panel.hidden = !panel.hidden;
        mapListButton.setAttribute("aria-expanded", String(!panel.hidden));
      });
    }

    document.querySelectorAll("[data-map-location-select]").forEach((button) => {
      button.addEventListener("click", () => {
        const label = button.dataset.mapLocationSelect;
        document.querySelectorAll("[data-map-location]").forEach((marker) => {
          const active = marker.dataset.mapLocation === label;
          marker.classList.toggle("active", active);
          marker.setAttribute("aria-pressed", String(active));
          if (active) marker.focus({ preventScroll: true });
        });
      });
    });

    const shareButton = $("[data-share-profile]");
    if (shareButton) {
      shareButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          shareButton.textContent = "✓";
          window.setTimeout(() => { shareButton.textContent = "↗"; }, 1400);
        } catch (error) {
          window.prompt("Copy profile link", window.location.href);
        }
      });
    }

    document.querySelectorAll(".rp-pure-page a[href^='http']").forEach((link) => {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });

    if (!editor || !form) return;

    document.querySelectorAll("[data-edit-profile]").forEach((button) => {
      button.addEventListener("click", () => {
        if (typeof editor.showModal === "function") editor.showModal();
        else editor.setAttribute("open", "");
      });
    });
    $("[data-close-editor]", editor).addEventListener("click", () => editor.close());

    $("[data-reset-profile]", editor).addEventListener("click", () => {
      const overrides = researchProfileOverrides();
      delete overrides[activeResearcherSlug];
      window.localStorage.setItem(researchProfileStorageKey, JSON.stringify(overrides));
      render();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const fields = new FormData(form);
      const photo = fields.get("photo");
      const save = (photoData) => {
        const overrides = researchProfileOverrides();
        const current = overrides[activeResearcherSlug] || {};
        overrides[activeResearcherSlug] = {
          ...current,
          name: String(fields.get("name") || "").trim(),
          role: String(fields.get("role") || "").trim(),
          email: String(fields.get("email") || "").trim(),
          phone: String(fields.get("phone") || "").trim(),
          orcid: String(fields.get("orcid") || "").trim(),
          scopusUrl: String(fields.get("scopusUrl") || "").trim(),
          scholarUrl: String(fields.get("scholarUrl") || "").trim(),
          bio: String(fields.get("bio") || "").trim(),
          interests: String(fields.get("interests") || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
          ...(photoData ? { photo: photoData } : {})
        };
        try {
          window.localStorage.setItem(researchProfileStorageKey, JSON.stringify(overrides));
          editor.close();
          render();
        } catch (error) {
          status.textContent = "This photo is too large for browser storage. Try a smaller image.";
        }
      };

      if (photo && photo.size) {
        if (photo.size > 1.5 * 1024 * 1024) {
          status.textContent = "Choose an image smaller than 1.5 MB.";
          return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", () => save(reader.result));
        reader.addEventListener("error", () => { status.textContent = "The image could not be read."; });
        reader.readAsDataURL(photo);
      } else {
        save("");
      }
    });
  }

  function bindBackToTop() {
    const button = $(".back-to-top");
    if (!button) return;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    });
  }

  function bindAdmin() {
    if (pageKey !== "admin") return;
    const staticAdmin = $("[data-static-admin]");
    if (staticAdmin) {
      staticAdmin.querySelectorAll("[data-copy-command]").forEach((button) => {
        button.addEventListener("click", async () => {
          const command = button.dataset.copyCommand;
          try {
            await navigator.clipboard.writeText(command);
            button.textContent = "Copied";
            window.setTimeout(() => { button.textContent = "Copy"; }, 1400);
          } catch (error) {
            window.prompt("Copy command", command);
          }
        });
      });
      return;
    }
    const backend = window.RESEARCH_BACKEND;
    const authCopy = $("[data-admin-auth-copy]");
    const signInButton = $("[data-admin-sign-in]");
    const signOutButton = $("[data-admin-sign-out]");
    const setup = $("[data-admin-setup]");
    const denied = $("[data-admin-denied]");
    const workspace = $("[data-admin-workspace]");
    const profileForm = $("[data-own-profile-form]");
    const profileProgress = $("[data-profile-progress]");
    const managedSection = $("[data-managed-profiles]");
    const managedForm = $("[data-managed-profile-form]");
    const managedList = $("[data-managed-profile-list]");
    const managedCount = $("[data-managed-profile-count]");
    const managedProgress = $("[data-managed-profile-progress]");
    const form = $("[data-publication-form]");
    const list = $("[data-admin-list]");
    const count = $("[data-admin-count]");
    const progress = $("[data-admin-progress]");
    let adminRecords = [];
    let ownProfile = null;
    let currentUser = null;
    let administrator = false;
    let managedProfiles = [];

    const setMessage = (message, error = false) => {
      progress.textContent = message;
      progress.classList.toggle("error", error);
    };

    const populateForm = (record) => {
      ["id", "title", "slug", "year", "type", "status", "authors", "venue", "abstract", "citationCount", "doi"].forEach((field) => {
        if (form.elements[field]) form.elements[field].value = record[field] == null ? "" : record[field];
      });
      form.elements.keywords.value = (record.keywords || []).join(", ");
      form.elements.openAccess.checked = Boolean(record.openAccess);
      const selected = new Set(record.profileSlugs || []);
      form.querySelectorAll('input[name="profileSlugs"]').forEach((input) => { input.checked = selected.has(input.value); });
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const populateProfileForm = (profile, user) => {
      const value = profile || {};
      profileForm.elements.name.value = value.name || user.displayName || "";
      profileForm.elements.slug.value = value.profileHandle || value.slug || String(user.displayName || user.email.split("@")[0]).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      profileForm.elements.role.value = value.role || "Researcher";
      profileForm.elements.status.value = value.status || "public";
      profileForm.elements.affiliations.value = (value.affiliations || []).join("\n");
      profileForm.elements.bio.value = value.bio || "";
      profileForm.elements.scholarUrl.value = value.scholarUrl || "";
      profileForm.elements.orcid.value = value.orcid || "";
      profileForm.elements.phone.value = value.phone || "";
      profileForm.elements.publicEmail.value = value.email || user.email || "";
      profileForm.elements.interests.value = (value.interests || []).join(", ");
      $("[data-own-profile-preview]").src = value.photo || value.photoUrl || user.photoURL || asset(data.profile.headshot);
      $("[data-profile-save-state]").textContent = profile ? "Profile connected" : "New profile";
    };

    const renderRecords = () => {
      count.textContent = adminRecords.length;
      list.innerHTML = adminRecords.length ? adminRecords.map((record) => `
        <article class="admin-record">
          <div><small>${attr(record.status || "draft")} · ${attr(record.year || "")}</small><h3>${attr(record.title)}</h3><p>${attr(record.authors)}</p></div>
          <span>${(record.profileSlugs || []).length} profile${(record.profileSlugs || []).length === 1 ? "" : "s"}</span>
          <div><button type="button" data-admin-edit="${attr(record.id)}">Edit</button><button type="button" data-admin-delete="${attr(record.id)}">Delete</button></div>
        </article>
      `).join("") : `<div class="rp-empty">No backend publications yet.</div>`;
      list.querySelectorAll("[data-admin-edit]").forEach((button) => button.addEventListener("click", () => {
        const record = adminRecords.find((item) => item.id === button.dataset.adminEdit);
        if (record) populateForm(record);
      }));
      list.querySelectorAll("[data-admin-delete]").forEach((button) => button.addEventListener("click", async () => {
        const record = adminRecords.find((item) => item.id === button.dataset.adminDelete);
        if (!record || !window.confirm(`Delete “${record.title}”?`)) return;
        try {
          await backend.deletePublication(record.id);
          adminRecords = adminRecords.filter((item) => item.id !== record.id);
          renderRecords();
          setMessage("Publication deleted.");
        } catch (error) {
          setMessage(error.message || "Could not delete the publication.", true);
        }
      }));
    };

    const populateManagedProfile = (profile) => {
      ["id", "name", "role", "status", "photo", "sourceUrl", "scholarUrl", "orcid", "publicEmail"].forEach((field) => {
        if (managedForm.elements[field]) managedForm.elements[field].value = profile[field] || "";
      });
      managedForm.elements.slug.value = profile.profileHandle || "";
      managedForm.elements.affiliations.value = (profile.affiliations || []).join("\n");
      managedForm.elements.bio.value = profile.bio || "";
      managedForm.elements.interests.value = (profile.interests || []).join(", ");
      managedForm.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const renderManagedProfiles = () => {
      managedCount.textContent = managedProfiles.length;
      managedList.innerHTML = managedProfiles.length ? managedProfiles.map((profile) => `
        <article class="admin-record">
          <div><small>${attr(profile.status || "private")}</small><h3>${attr(profile.name)}</h3><p>${attr(profile.role || "")}</p></div>
          <div><button type="button" data-managed-edit="${attr(profile.id)}">Edit</button><button type="button" data-managed-delete="${attr(profile.id)}">Delete</button></div>
        </article>
      `).join("") : `<div class="rp-empty">No backend-managed profiles yet.</div>`;
      managedList.querySelectorAll("[data-managed-edit]").forEach((button) => button.addEventListener("click", () => {
        const profile = managedProfiles.find((entry) => entry.id === button.dataset.managedEdit);
        if (profile) populateManagedProfile(profile);
      }));
      managedList.querySelectorAll("[data-managed-delete]").forEach((button) => button.addEventListener("click", async () => {
        const profile = managedProfiles.find((entry) => entry.id === button.dataset.managedDelete);
        if (!profile || !window.confirm(`Delete the curated profile for “${profile.name}”?`)) return;
        try {
          await backend.deleteManagedProfile(profile.id);
          managedProfiles = managedProfiles.filter((entry) => entry.id !== profile.id);
          renderManagedProfiles();
        } catch (error) {
          managedProgress.textContent = error.message || "Could not delete the profile.";
        }
      }));
    };

    const loadManagedProfiles = async () => {
      const allProfiles = await backend.listProfiles({ includePrivate: true });
      managedProfiles = allProfiles.filter((profile) => profile.adminManaged);
      managedProfiles.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      renderManagedProfiles();
    };

    const loadAdminRecords = async () => {
      adminRecords = await backend.listPublications({ includeDrafts: true });
      adminRecords.sort((a, b) => String(b.year || "").localeCompare(String(a.year || "")) || String(a.title || "").localeCompare(String(b.title || "")));
      renderRecords();
    };

    if (!backend || !backend.isConfigured()) {
      authCopy.textContent = "The secure researcher backend has been added but still needs your Firebase project configuration.";
      setup.hidden = false;
      signInButton.hidden = true;
      return;
    }

    signInButton.addEventListener("click", async () => {
      try {
        authCopy.textContent = "Opening Google sign-in...";
        await backend.signIn();
      } catch (error) {
        authCopy.textContent = error.message || "Google sign-in failed.";
      }
    });
    signOutButton.addEventListener("click", () => backend.signOut());

    backend.subscribeAuth(async (user) => {
      setup.hidden = true;
      denied.hidden = true;
      workspace.hidden = true;
      signInButton.hidden = Boolean(user);
      signOutButton.hidden = !user;
      if (!user) {
        authCopy.textContent = "Sign in with a verified Google account to manage your profile and publications.";
        return;
      }
      currentUser = user;
      if (!user.emailVerified) {
        denied.hidden = false;
        $("[data-admin-uid]").textContent = user.uid;
        $("[data-admin-denied-title]").textContent = "Verify your email to continue";
        authCopy.textContent = "This account is signed in, but its email address is not verified.";
        return;
      }
      authCopy.textContent = `Signed in as ${user.email || user.displayName || "Google user"}. Checking access...`;
      try {
        administrator = await backend.isAdmin(user);
        ownProfile = await backend.getOwnProfile();
        populateProfileForm(ownProfile, user);
        authCopy.textContent = administrator
          ? `Site administrator: ${user.email || user.displayName}`
          : `Verified researcher: ${user.email || user.displayName}`;
        workspace.hidden = false;
        managedSection.hidden = !administrator;
        form.querySelectorAll('input[name="profileSlugs"]').forEach((input) => {
          input.disabled = !administrator;
          if (!administrator) input.checked = ownProfile ? input.value === ownProfile.slug : false;
        });
        await loadAdminRecords();
        if (administrator) await loadManagedProfiles();
      } catch (error) {
        authCopy.textContent = error.message || "Could not verify administrator access.";
      }
    });

    profileForm.elements.photo.addEventListener("change", () => {
      const file = profileForm.elements.photo.files[0];
      if (file) $("[data-own-profile-preview]").src = URL.createObjectURL(file);
    });

    profileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const fields = new FormData(profileForm);
      const profile = {
        slug: String(fields.get("slug") || "").trim(),
        name: String(fields.get("name") || "").trim(),
        role: String(fields.get("role") || "Researcher").trim(),
        title: String(fields.get("role") || "Researcher").trim(),
        status: String(fields.get("status") || "private"),
        affiliations: String(fields.get("affiliations") || "").split(/\n/).map((item) => item.trim()).filter(Boolean),
        bio: String(fields.get("bio") || "").trim(),
        scholarUrl: String(fields.get("scholarUrl") || "").trim(),
        orcid: String(fields.get("orcid") || "").trim(),
        phone: String(fields.get("phone") || "").trim(),
        publicEmail: String(fields.get("publicEmail") || "").trim(),
        interests: String(fields.get("interests") || "").split(/[,;\n]/).map((item) => item.trim()).filter(Boolean),
        publicationNames: [String(fields.get("name") || "").trim()],
        photo: ownProfile && ownProfile.photo ? ownProfile.photo : ""
      };
      try {
        profileProgress.textContent = "Saving profile...";
        const photo = fields.get("photo");
        if (photo && photo.size) profile.photo = await backend.uploadProfilePhoto(photo, (value) => { profileProgress.textContent = `Uploading photo: ${value}%`; });
        await backend.saveOwnProfile(profile);
        ownProfile = { ...profile, ownerUid: currentUser.uid };
        profileProgress.textContent = "Profile saved. Public pages will use these details automatically.";
        $("[data-profile-save-state]").textContent = "Profile connected";
        form.querySelectorAll('input[name="profileSlugs"]').forEach((input) => {
          if (!administrator) input.checked = input.value === profile.slug;
        });
      } catch (error) {
        profileProgress.textContent = error.message || "Could not save the profile.";
        profileProgress.classList.add("error");
      }
    });

    managedForm.addEventListener("reset", () => window.setTimeout(() => {
      managedForm.elements.id.value = "";
      delete managedForm.elements.slug.dataset.edited;
      managedProgress.textContent = "";
    }, 0));

    managedForm.elements.name.addEventListener("input", () => {
      if (managedForm.elements.id.value || managedForm.elements.slug.dataset.edited === "true") return;
      managedForm.elements.slug.value = managedForm.elements.name.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    });
    managedForm.elements.slug.addEventListener("input", () => { managedForm.elements.slug.dataset.edited = "true"; });

    managedForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const fields = new FormData(managedForm);
      const profile = {
        id: fields.get("id") || undefined,
        slug: String(fields.get("slug") || "").trim(),
        name: String(fields.get("name") || "").trim(),
        role: String(fields.get("role") || "Researcher").trim(),
        title: String(fields.get("role") || "Researcher").trim(),
        status: String(fields.get("status") || "private"),
        photo: String(fields.get("photo") || "").trim(),
        affiliations: String(fields.get("affiliations") || "").split(/\n/).map((item) => item.trim()).filter(Boolean),
        bio: String(fields.get("bio") || "").trim(),
        interests: String(fields.get("interests") || "").split(/[,;\n]/).map((item) => item.trim()).filter(Boolean),
        sourceUrl: String(fields.get("sourceUrl") || "").trim(),
        scholarUrl: String(fields.get("scholarUrl") || "").trim(),
        orcid: String(fields.get("orcid") || "").trim(),
        publicEmail: String(fields.get("publicEmail") || "").trim(),
        publicationNames: [String(fields.get("name") || "").trim()]
      };
      try {
        managedProgress.textContent = "Saving curated profile...";
        await backend.saveManagedProfile(profile);
        managedProgress.textContent = "Profile saved. Refresh the page to assign publications to it.";
        managedForm.reset();
        await loadManagedProfiles();
      } catch (error) {
        managedProgress.textContent = error.message || "Could not save the curated profile.";
      }
    });

    form.addEventListener("reset", () => window.setTimeout(() => {
      form.elements.id.value = "";
      setMessage("");
    }, 0));

    form.elements.title.addEventListener("input", () => {
      if (form.elements.id.value || form.elements.slug.dataset.edited === "true") return;
      form.elements.slug.value = form.elements.title.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    });
    form.elements.slug.addEventListener("input", () => { form.elements.slug.dataset.edited = "true"; });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const fields = new FormData(form);
      const publication = {
        id: fields.get("id") || undefined,
        slug: String(fields.get("slug") || "").trim(),
        title: String(fields.get("title") || "").trim(),
        year: String(fields.get("year") || "").trim(),
        type: String(fields.get("type") || "Journal article").trim(),
        status: String(fields.get("status") || "draft"),
        authors: String(fields.get("authors") || "").trim(),
        venue: String(fields.get("venue") || "").trim(),
        abstract: String(fields.get("abstract") || "").trim(),
        citationCount: Math.max(0, Number(fields.get("citationCount")) || 0),
        doi: String(fields.get("doi") || "").trim(),
        openAccess: fields.get("openAccess") === "on",
        profileSlugs: fields.getAll("profileSlugs").map(String),
        keywords: String(fields.get("keywords") || "").split(/[,;\n]/).map((item) => item.trim()).filter(Boolean)
      };
      if (!publication.keywords.length) publication.keywords = inferredPublicationTopics(publication).slice(0, 8).map((topic) => topic.label);
      try {
        setMessage("Saving publication...");
        const paper = fields.get("paper");
        if (paper && paper.size) {
          const uploaded = await backend.uploadPaper(paper, publication.id || publication.slug, (value) => setMessage(`Uploading PDF: ${value}%`));
          Object.assign(publication, uploaded);
        }
        await backend.savePublication(publication);
        setMessage("Publication saved. Profile metrics and fingerprint will update automatically.");
        form.reset();
        await loadAdminRecords();
      } catch (error) {
        setMessage(error.message || "Could not save the publication.", true);
      }
    });
  }

  function pageHtml() {
    const query = new URLSearchParams(window.location.search).get("q");
    if (pageKey === "home" && query && query.trim()) return renderSearchResults(query.trim());
    const paperSlug = new URLSearchParams(window.location.search).get("paper");
    if (pageKey === "research/publications" && paperSlug) {
      const requestedPublication = data.publications.find((item) => item.slug === paperSlug || item.id === paperSlug);
      if (requestedPublication) return renderPublication(requestedPublication);
    }

    const researchItem = data.research.find((item) => `research/${item.slug}` === pageKey);
    const person = data.team.find((item) => `research/team/${item.slug}` === pageKey);
    const publication = data.publications.find((item) => `research/publications/${item.slug}` === pageKey);
    const media = data.media.find((item) => `media/${item.slug}` === pageKey);
    const news = data.news.find((item) => `news/${item.slug}` === pageKey);
    const blog = data.blog.find((item) => `blog/${item.slug}` === pageKey);
    const position = data.recruitment.find((item) => `get-involved/recruitment/${item.slug}` === pageKey);

    if (researchItem) return renderResearchDetail(researchItem);
    if (person) return renderPerson(person);
    if (publication) return renderPublication(publication);
    if (media) return renderEntry(media, "Media", "media/");
    if (news) return renderEntry(news, "News", "news/");
    if (blog) return renderEntry(blog, "Blog", "blog/");
    if (position) return renderRecruitmentDetail(position);

    switch (page.template) {
      case "home": return renderHome();
      case "about": return renderAbout();
      case "research": return renderResearchIndex();
      case "researchProfile": return renderResearchProfile();
      case "admin": return renderAdmin();
      case "timeline": return renderTimeline();
      case "team": return renderTeam();
      case "publications": return renderPublications();
      case "collection": return renderCollection();
      case "cv": return renderCv();
      case "getInvolved": return renderGetInvolved();
      case "recruitment": return renderRecruitment();
      case "contact": return renderContact();
      default: return renderHome();
    }
  }

  function render() {
    setPageMeta();
    renderShell();
    $("#main").innerHTML = pageHtml();
    bindResearchProfile();
    bindAdmin();
    bindContactForm();
    bindApplicationForms();
    bindInteractiveCards();
    bindRevealAnimations();
    bindAnimatedCounters();
    bindHomeTabs();
    bindSatelliteReadout();
    bindParallax();
    bindNewTabLinks();
    bindBackToTop();
  }

  async function bootstrap() {
    const backend = window.RESEARCH_BACKEND;
    render();
    if (backend && backend.isConfigured()) {
      try {
        const [remotePublications, remoteProfiles] = await Promise.all([backend.listPublications(), backend.listProfiles()]);
        const merged = new Map(data.publications.map((publication) => [publication.slug, publication]));
        remotePublications.forEach((publication) => merged.set(publication.slug, publication));
        data.publications = Array.from(merged.values()).sort((a, b) => String(b.year || "").localeCompare(String(a.year || "")) || String(a.title || "").localeCompare(String(b.title || "")));
        const team = new Map(data.team.map((person) => [person.slug, person]));
        remoteProfiles.forEach((profile) => team.set(profile.slug, {
          ...profile,
          photo: profile.photo || data.profile.headshot,
          publicationNames: profile.publicationNames || [profile.name],
          url: `research/profile/?person=${encodeURIComponent(profile.slug)}`
        }));
        data.team = Array.from(team.values());
        if ((remotePublications.length || remoteProfiles.length) && pageKey !== "admin") render();
      } catch (error) {
        console.warn("Remote publications are unavailable; using bundled records.", error);
      }
    }
  }

  bootstrap();
})();
