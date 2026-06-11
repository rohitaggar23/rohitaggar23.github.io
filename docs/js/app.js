import { fetchJson, qs, qsa } from "./utils.js";

function repoUrl(username, repoName = "") {
  if (!username || username.includes("<")) return "#";
  return repoName ? `https://github.com/${username}/${repoName}` : `https://github.com/${username}`;
}

function fileUrl(username, repoName, path) {
  if (!username || username.includes("<")) return "#";
  return `https://github.com/${username}/${repoName}/blob/main/${path}`;
}

function metricTiles(project) {
  return (project.metrics || [])
    .map(
      (metric) => `
        <div class="metric">
          <span>${metric.label}</span>
          <strong>${metric.value}</strong>
        </div>
      `,
    )
    .join("");
}

function projectCard(project, config) {
  const repoName = config.repos?.[project.repoKey] || project.repoKey;
  const username = config.profile?.githubUsername || "<your-username>";
  const repo = repoUrl(username, repoName);

  return `
    <article class="project-card accent-${project.accent}" data-category="${project.category}">
      <div class="project-card__image">
        <img src="${project.cover}" alt="${project.title} output preview" loading="lazy" />
        <span class="project-card__tag">${project.evidenceType}</span>
      </div>
      <div class="project-card__body">
        <div class="project-card__meta">
          <span>${project.category}</span>
          <span>${project.datasetScope}</span>
        </div>
        <h3>${project.title}</h3>
        <p class="project-card__desc">${project.description}</p>
        <div class="metric-grid">${metricTiles(project)}</div>
        <div class="project-card__actions">
          <a class="button button--ghost" href="${repo}" target="_blank" rel="noreferrer">Repository</a>
          <button class="button" data-project="${project.id}">Details</button>
        </div>
      </div>
    </article>
  `;
}

function evidenceCard(project) {
  return `
    <article class="evidence-card">
      <span>${project.title}</span>
      <strong>${project.metrics?.[0]?.value || ""}</strong>
      <p>${project.dataset}: ${project.datasetScope}</p>
    </article>
  `;
}

function visualCard(project) {
  const image = project.gallery?.[0] || project.cover;
  return `
    <button class="visual-card" data-project="${project.id}">
      <img src="${image}" alt="${project.title} generated visual" loading="lazy" />
      <div>${project.title}</div>
    </button>
  `;
}

function profileLinks(config) {
  const profile = config.profile || {};
  const username = profile.githubUsername || "<your-username>";
  const links = [];
  links.push(`<a class="button" href="${repoUrl(username)}" target="_blank" rel="noreferrer">GitHub</a>`);
  if (profile.linkedin && !profile.linkedin.includes("<")) {
    links.push(`<a class="button button--ghost" href="${profile.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>`);
  }
  if (profile.email && !profile.email.includes("<")) {
    links.push(`<a class="button button--ghost" href="mailto:${profile.email}">Email</a>`);
  }
  if (profile.resumeUrl) {
    links.push(`<a class="button button--ghost" href="${profile.resumeUrl}" target="_blank" rel="noreferrer">Resume</a>`);
  }
  return links.join("");
}

function timelineItem(item) {
  return `
    <article class="timeline-item">
      <span>${item.period || item.year || ""}</span>
      <strong>${item.degree || item.title || item.role}</strong>
      <p>${item.institution || item.authors || item.organization || ""}</p>
      <p>${item.detail || item.venue || ""}</p>
    </article>
  `;
}

function skillCard(skill) {
  return `
    <article class="skill-card">
      <div class="skill-card__top">
        <span>${skill.name}</span>
        <span>${skill.value}%</span>
      </div>
      <div class="skill-bar"><i style="width: ${skill.value}%"></i></div>
    </article>
  `;
}

function renderTerminal(profile) {
  const username = profile.githubUsername || "rohitaggar23";
  const lines = [
    "$ whoami",
    "> rohit_aggarwal",
    "",
    "$ cat focus.txt",
    "> retrieval_augmented_generation",
    "> tool_using_agents",
    "> llm_evaluation_and_safety",
    "> recommender_systems",
    "",
    "$ cat education.txt",
    "> M.Tech CS-AI @ IIT Roorkee",
    "> B.Tech CSAI @ IIIT Delhi",
    "",
    "$ git remote -v",
    `> github.com/${username}`,
    "",
    "$ echo $STATUS",
    "> building measured AI systems"
  ];
  qs("#terminalText").textContent = lines.join("\n");
}

function openProject(project, config) {
  const dialog = qs("#projectDialog");
  const content = qs("#dialogContent");
  const username = config.profile?.githubUsername || "<your-username>";
  const repoName = config.repos?.[project.repoKey] || project.repoKey;
  const repo = repoUrl(username, repoName);
  const gallery = (project.gallery || [project.cover])
    .map((src) => `<img src="${src}" alt="${project.title} evidence visual" />`)
    .join("");
  const bullets = (project.highlights || []).map((item) => `<li>${item}</li>`).join("");
  const artifacts = (project.evidence || [])
    .map((path) => `<a href="${fileUrl(username, repoName, path)}" target="_blank" rel="noreferrer">${path}</a>`)
    .join("");

  content.innerHTML = `
    <div class="dialog-layout">
      <div class="dialog-gallery">${gallery}</div>
      <div class="dialog-body">
        <p class="eyebrow">${project.category}</p>
        <h2>${project.title}</h2>
        <p class="dialog-copy">${project.subtitle}</p>
        <div class="metric-grid">${metricTiles(project)}</div>
        <p class="dialog-copy"><strong>Dataset:</strong> ${project.dataset}. ${project.datasetScope}.</p>
        <ul class="dialog-list">${bullets}</ul>
        <h3>Artifacts</h3>
        <div class="artifact-list">${artifacts}</div>
        <p><a class="button button--primary" href="${repo}" target="_blank" rel="noreferrer">Open Repository</a></p>
      </div>
    </div>
  `;
  dialog.showModal();
}

function renderFilters(projects) {
  const categories = ["All", ...new Set(projects.map((project) => project.category))];
  qs("#filters").innerHTML = categories
    .map((category, index) => `<button class="filter ${index === 0 ? "is-active" : ""}" data-filter="${category}">${category}</button>`)
    .join("");
}

function applyFilter(category) {
  qsa(".filter").forEach((button) => button.classList.toggle("is-active", button.dataset.filter === category));
  qsa(".project-card").forEach((card) => {
    const visible = category === "All" || card.dataset.category === category;
    card.style.display = visible ? "" : "none";
  });
}

function revealOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );
  qsa(".evidence-card, .project-card, .timeline-item, .visual-card, .skill-card").forEach((element) => observer.observe(element));
}

function renderTicker(projects) {
  const items = projects
    .map((project) => `<div class="ticker__item"><strong>${project.title}</strong><span>${project.datasetScope}</span></div>`)
    .join("");
  qs("#tickerTrack").innerHTML = items + items;
}

function animateNetwork() {
  const canvas = qs("#networkCanvas");
  const ctx = canvas.getContext("2d");
  const points = Array.from({ length: 54 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0007,
    vy: (Math.random() - 0.5) * 0.0007,
  }));

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
  }

  function frame() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = window.devicePixelRatio;
    points.forEach((point) => {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < 0 || point.x > 1) point.vx *= -1;
      if (point.y < 0 || point.y > 1) point.vy *= -1;
    });

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i];
        const b = points[j];
        const dx = (a.x - b.x) * w;
        const dy = (a.y - b.y) * h;
        const distance = Math.hypot(dx, dy);
        if (distance < 150 * window.devicePixelRatio) {
          const alpha = 1 - distance / (150 * window.devicePixelRatio);
          ctx.strokeStyle = `rgba(0, 124, 137, ${alpha * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(a.x * w, a.y * h);
          ctx.lineTo(b.x * w, b.y * h);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  frame();
}

async function main() {
  const [config, projects] = await Promise.all([
    fetchJson("data/config.json"),
    fetchJson("data/projects.json"),
  ]);

  const profile = config.profile || {};
  const username = profile.githubUsername || "<your-username>";
  qs("#profileName").textContent = profile.name || "Rohit Aggarwal";
  qs("#profileTitle").textContent = profile.title || "AI/ML Engineer";
  qs("#profileTagline").textContent = profile.tagline || "";
  qs("#profileHeading").textContent = profile.name || "Rohit Aggarwal";
  qs("#heroLocation").textContent = profile.location || "";
  qs("#githubLink").href = repoUrl(username);
  qs("#profileLinks").innerHTML = profileLinks(config);
  if (profile.resumeUrl) qs("#resumeLink").href = profile.resumeUrl;
  if (profile.photo) qs("#profilePhoto").src = profile.photo;

  qs("#heroStats").innerHTML = [
    { label: "Repositories", value: projects.length },
    { label: "Real dataset runs", value: 3 },
    { label: "TruthfulQA cases", value: "817" },
    { label: "Spider tasks", value: "7,000" },
  ]
    .map((item) => `<div class="stat"><span>${item.label}</span><strong>${item.value}</strong></div>`)
    .join("");

  renderTicker(projects);
  qs("#evidenceStrip").innerHTML = projects.map(evidenceCard).join("");
  qs("#projectGrid").innerHTML = projects.map((project) => projectCard(project, config)).join("");
  qs("#visualGrid").innerHTML = projects.map(visualCard).join("");
  qs("#skillsGrid").innerHTML = [
    { name: "Python / ML Engineering", value: 95 },
    { name: "RAG and Hybrid Retrieval", value: 92 },
    { name: "LLM Evaluation and Safety", value: 90 },
    { name: "FastAPI / Backend Systems", value: 86 },
    { name: "PyTorch / Deep Learning", value: 84 },
    { name: "SQL, pandas, NumPy", value: 88 },
  ].map(skillCard).join("");
  qs("#experienceList").innerHTML = (config.experience || []).map(timelineItem).join("");
  qs("#publicationList").innerHTML = (config.publications || []).map(timelineItem).join("");
  qs("#educationList").innerHTML = (config.education || []).map(timelineItem).join("");
  renderFilters(projects);
  renderTerminal(profile);
  revealOnScroll();
  animateNetwork();

  qs("#filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (button) applyFilter(button.dataset.filter);
  });

  document.body.addEventListener("click", (event) => {
    const button = event.target.closest("[data-project]");
    if (!button) return;
    const project = projects.find((item) => item.id === button.dataset.project);
    if (project) openProject(project, config);
  });

  qs("#dialogClose").addEventListener("click", () => qs("#projectDialog").close());
}

main();
