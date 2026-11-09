/* ==========================================================================
   Quang Hiếu (Worgzek) — Terminal Portfolio Scripts
   Clean Vanilla JS — Lightweight, Fast & Accessible (Light/Dark Theme)
   ========================================================================== */

const CONFIG = {
  githubHandle: 'worgzek',
  linkedinHandle: 'qt-hieu',
  email: 'hieuqt@gdscptit.dev',
};

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- 1. Dynamic Links from CONFIG ---------- */
  const github = `https://github.com/${CONFIG.githubHandle}`;
  const links = {
    github,
    linkedin: `https://www.linkedin.com/in/${CONFIG.linkedinHandle}`,
    email: `mailto:${CONFIG.email}`,
  };
  const texts = {
    email: CONFIG.email,
    githubHandle: `@${CONFIG.githubHandle}`,
    linkedinHandle: CONFIG.linkedinHandle,
  };

  $$('[data-link]').forEach((el) => {
    if (links[el.dataset.link]) el.href = links[el.dataset.link];
  });
  $$('[data-repo]').forEach((el) => {
    el.href = `${github}/${el.dataset.repo}`;
  });
  $$('[data-text]').forEach((el) => {
    if (texts[el.dataset.text]) el.textContent = texts[el.dataset.text];
  });

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 2. Theme Toggle (Light / Dark Mode) ---------- */
  const themeToggle = $('#theme-toggle');
  const themeIcon = $('#theme-icon');
  const themeText = $('#theme-text');

  const updateThemeUI = (theme) => {
    if (themeIcon && themeText) {
      if (theme === 'light') {
        themeIcon.textContent = '☾';
        themeText.textContent = 'dark';
        themeToggle?.setAttribute('aria-label', 'Switch to dark theme');
      } else {
        themeIcon.textContent = '☀';
        themeText.textContent = 'light';
        themeToggle?.setAttribute('aria-label', 'Switch to light theme');
      }
    }
  };

  // Sync initial state from html attribute
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  updateThemeUI(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = active === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeUI(next);
      showToast(`Switched to ${next} mode`);
    });
  }

  /* ---------- 3. Mobile Menu ---------- */
  const toggle = $('#menu-toggle');
  const menu = $('#mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('hidden');
      menu.hidden = menu.classList.contains('hidden');
    });
    $$('a', menu).forEach((a) => a.addEventListener('click', () => {
      menu.classList.add('hidden');
      menu.hidden = true;
    }));
  }

  /* ---------- 4. Tab Switching (Setup / Hardware) ---------- */
  $$('[data-tabs]').forEach((group) => {
    const tabs = $$('[data-tab]', group);
    const panels = $$('[data-panel]', group);

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
        panels.forEach((p) => {
          p.hidden = p.dataset.panel !== target;
        });
      });
    });
  });

  /* ---------- 5. Copy Email Action ---------- */
  const toast = $('#toast');
  let toastTimer;
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (!ok) throw new Error('copy failed');
  };

  const copyBtns = $$('[data-copy-email], #copy-email');
  copyBtns.forEach((btn) => {
    const label = $('.copy-label', btn) || btn;
    btn.addEventListener('click', async () => {
      try {
        await copyText(CONFIG.email);
        label.textContent = '[copied to clipboard ✓]';
        showToast(`✓ ${CONFIG.email} copied`);
      } catch {
        label.textContent = '[copy failed]';
        showToast('✗ Please copy manually');
      }
      setTimeout(() => {
        label.textContent = 'copy to clipboard';
      }, 2000);
    });
  });

  /* ---------- 6. Project & Experience Detail Modal (Popup) ---------- */
  const PROJECT_DETAILS = {
    neo: {
      title: 'NASA NEO ETL Pipeline',
      heading: 'Real-time & Scheduled NASA NEO ETL Pipeline',
      type: 'Stream & Batch Ingestion · Dockerized Architecture',
      overview: 'An automated data ingestion engine fetching asteroid approach data from NASA’s Near-Earth Object Web Service (NeoWs) API. Built to test high resilience against API rate-limits, network timeouts, and raw payload anomalies.',
      arch: `[ NASA NeoWs API ]
        │  poll / hourly cron schedule
        ▼
[ extractor.py ] ──► raw_feed_landing/ (JSON buffer)
        │
        ▼  schema validation & deduplication
[ transformer.py ] ──► Loguru structured logs
        │
        ▼  idempotent upsert (ON CONFLICT DO UPDATE)
[ PostgreSQL DB ] ──► analytical marts`,
      decisions: [
        'Idempotent Upserts: Ensures that running backfills or retrying failed pipeline runs produces zero duplicate asteroid telemetry rows in PostgreSQL.',
        'Structured Observability: Loguru logging with JSON sink, tracking duration, batch throughput, and quarantine counters for corrupt JSON records.',
        'Docker Compose Stack: Bundles Postgres, extractor worker, and environment variables for 1-command local replication.',
      ],
      tech: ['Python 3.11', 'PostgreSQL 16', 'Loguru', 'Docker Compose', 'Requests', 'SQLAlchemy'],
      repo: `${github}/nasa-neo-etl-pipeline`,
    },
    lakehouse: {
      title: 'Medallion Lakehouse on Delta Lake',
      heading: 'Modern Data Stack — Medallion Lakehouse on Delta Lake',
      type: 'Distributed Data Lakehouse · ACID Transactions',
      overview: 'End-to-end multi-hop lakehouse implementing Bronze → Silver → Gold layers with PySpark on Delta Lake tables. Orchestrated by Apache Airflow with cross-compatibility for Microsoft Fabric OneLake deployments.',
      arch: `[ Sources: APIs / Event Logs / OLTP ]
        │
        ▼  Append-only raw ingestion
[ 🥉 BRONZE ]  Delta table (immutable raw archive)
        │
        ▼  PySpark cleaning, typing, conformed dimensions (SCD-2)
[ 🥈 SILVER ]  Delta table (clean, conformed business events)
        │
        ▼  dbt / PySpark aggregation & dimensional modeling
[ 🥇 GOLD ]    Star-schema marts for Power BI / ad-hoc SQL
        ▲
[ Apache Airflow DAG ]  Orchestrator & Health Gates`,
      decisions: [
        'ACID Guarantees: Leverages Delta Lake transactional logs to prevent dirty reads during long-running distributed batch writes.',
        'SCD Type 2 Modeling: Maintains complete historical state tracking of dimension attributes without data loss.',
        'Quality Gates: Custom validation checks between Bronze and Silver to reject or quarantine bad schema payloads before reaching reporting layers.',
      ],
      tech: ['PySpark', 'Delta Lake', 'Apache Airflow', 'dbt', 'Microsoft Fabric', 'Python'],
      repo: `${github}/medallion-lakehouse`,
    },
    text2sql: {
      title: 'AI Text-to-SQL Analytics Copilot',
      heading: 'AI-Driven Text-to-SQL Analytics Copilot',
      type: 'Agentic AI · Fast In-Process OLAP · Guardrails',
      overview: 'An AI analytics assistant converting natural language questions into safe, highly optimized SQL queries executed directly against DuckDB datasets with automated error feedback and self-repair loops.',
      arch: `User Prompt: "Top 5 sales by profit margin last quarter?"
        │
        ▼
[ Dynamic Schema Catalog ] ──► LLM Prompt Engine
        │
        ▼  generates SQL
[ AST Query Validator ] ──► Enforces strictly read-only (SELECT)
        │
        ▼  executes in-process
[ DuckDB OLAP Engine ] ──► Parquet Query Result
        │
        ▼  syntax/column mismatch?
[ Self-Healing Loop ] ──► Resends error traceback to agent (max 3 retries)`,
      decisions: [
        'Deterministic AST Guardrails: Parses SQL syntax trees using sqlglot to guarantee no DROP, ALTER, UPDATE or destructive injection executes.',
        'DuckDB Speed: Replaces heavyweight cloud warehouse queries for local testing, yielding sub-50ms analytics turnaround.',
        'Autonomous Self-Correction: When an execution fails due to ambiguous columns, the agent self-heals by reviewing error feedback.',
      ],
      tech: ['Python', 'DuckDB', 'LangChain / LLM', 'SQLGlot', 'Rich CLI', 'Parquet'],
      repo: `${github}/text-to-sql-agent`,
    },
    ivina: {
      title: 'IVINA — Data Engineer Intern',
      heading: 'Data Engineer Intern — IVINA Joint Stock Company',
      type: 'Professional Experience · Data Engineering Internship',
      overview: 'Participated in building and maintaining automated data pipelines for diverse data sources. Designed ETL/ELT workflows, optimized SQL queries and database indexes, and ensured data consistency across staging and production warehouses.',
      arch: `[ External Data Sources & Client APIs ]
        │
        ▼  scheduled extraction & data validation
[ Ingestion & Staging Workers ] ──► Quarantine logs
        │
        ▼  transformation, normalization & enrichment
[ PostgreSQL Data Warehouse ] ──► Business intelligence & reporting`,
      decisions: [
        'Pipeline Automation: Built robust Python ingestion scripts with scheduled cron triggers and error notification hooks.',
        'Data Quality & Validation: Implemented pre-load schema validation preventing malformed records from polluting target tables.',
        'Performance Optimization: Analyzed query execution plans (EXPLAIN ANALYZE), added strategic indexing, and streamlined table joins.',
      ],
      tech: ['Python', 'SQL', 'PostgreSQL', 'Docker', 'ETL/ELT', 'Data Warehousing'],
      repo: `${github}`,
    },
    gdgoc: {
      title: 'GDGoC PTIT — NutriBudget Hackathon',
      heading: 'GDGoC PTIT Internal Mini Hackathon — 2nd Prize Winner',
      type: '🥈 2nd Prize (Giải Nhì) · Team Leader (7 Members) · NutriBudget',
      image: 'assets/img/gdgoc-hackathon.jpg',
      overview: 'Participated in the GDGoC PTIT Internal Mini Hackathon as Team Leader of a 7-member cross-functional engineering team. Architected and developed "NutriBudget" — an intelligent dietary budget optimizer leveraging PuLP Linear Programming, Google ADK, and a FastAPI backend. The system calculates personal macronutrient targets (protein, carbs, fats, calories) against financial budget limits, outputting cost-effective meal plans. Secured 2nd Prize overall.',
      arch: `[ User Input: Macro Targets & Financial Ceiling ]
        │
        ▼  REST API (FastAPI)
[ PuLP Linear Optimization Solver ] ──► Cost-minimizing nutritional matrix
        │
        ▼  Ingredient & Recipe Queries
[ PostgreSQL Database ] ──► Structured nutritional & pricing datasets
        │
        ▼
[ Google ADK + Meal Generator ] ──► Synthesizes recipes & dynamic budget reports
        │
        ▼
[ Output: Tailored Meal Plan ] ──► Multi-container Dockerized deployment`,
      decisions: [
        'PuLP Linear Optimization: Modeled meal planning as a constrained linear optimization problem (LP solver), finding optimal food combinations that satisfy strict macro thresholds while minimizing financial cost.',
        'FastAPI High-Throughput REST: Built asynchronous endpoints handling user input profiles, parameter constraints, and real-time optimization response times under 200ms.',
        'PostgreSQL & Docker Containerization: Structured recipe datasets, pricing indexes, and nutritional matrices in Postgres, containerized with Docker for seamless dev-to-demo execution.',
        'Team Leadership (7 Members): Organized sprint backlogs, assigned roles across 7 developers, coordinated integration under strict hackathon deadlines, and presented winning demo pitch.',
      ],
      tech: ['FastAPI', 'Docker', 'PostgreSQL', 'Google ADK', 'PuLP', 'Team Lead (7 devs)', '2nd Prize 🥈'],
      repo: `${github}`,
    },
  };

  const modal = $('#project-modal');
  const modalBackdrop = $('#modal-backdrop');
  const modalClose = $('#modal-close');
  const modalTitle = $('#modal-title');
  const modalBody = $('#modal-body');

  const openModal = (key) => {
    const data = PROJECT_DETAILS[key];
    if (!data || !modal) return;

    modalTitle.textContent = data.title;
    modalBody.innerHTML = `
      <div class="space-y-4 text-[var(--term-fg)]">
        <div>
          <span class="text-xs text-[var(--term-green-bright)] font-semibold">${data.type}</span>
          <h2 class="text-lg sm:text-xl font-bold text-[var(--term-bright)] mt-1">${data.heading}</h2>
        </div>

        ${data.image ? `
        <div class="border border-[var(--term-border)] rounded overflow-hidden bg-[var(--term-subtle)]">
          <div class="bg-[var(--term-panel)] px-3 py-1.5 border-b border-[var(--term-border)] flex items-center justify-between text-xs text-[var(--term-muted)]">
            <span>GDGoC Team Award Ceremony</span>
            <span class="text-[var(--term-green-bright)] font-semibold">🥈 2nd Prize Winner</span>
          </div>
          <div class="aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-[var(--term-bg)]">
            <img src="${data.image}" alt="GDGoC Hackathon Team 2nd Prize" class="w-full h-full object-cover filter contrast-[1.02]" />
          </div>
          <div class="p-2 bg-[var(--term-panel)] border-t border-[var(--term-border)] text-[11px] text-[var(--term-muted)]">
            Team Leader (7 members) · GDGoC PTIT Internal Mini Hackathon · Project: NutriBudget
          </div>
        </div>
        ` : ''}

        <div>
          <span class="text-xs text-[var(--term-muted)] font-semibold uppercase tracking-wider block mb-1">// Overview</span>
          <p class="text-xs sm:text-sm text-[var(--term-fg)] leading-relaxed">${data.overview}</p>
        </div>

        <div>
          <span class="text-xs text-[var(--term-cyan)] font-semibold uppercase tracking-wider block mb-1">// Architecture Flow</span>
          <pre class="bg-[var(--term-bg)] p-3 rounded border border-[var(--term-border)] overflow-x-auto text-xs text-[var(--term-muted)] font-mono leading-snug">${data.arch}</pre>
        </div>

        <div>
          <span class="text-xs text-[var(--term-purple)] font-semibold uppercase tracking-wider block mb-1">// Engineering Highlights</span>
          <ul class="list-disc list-inside space-y-1.5 text-xs text-[var(--term-fg)]">
            ${data.decisions.map((d) => `<li>${d}</li>`).join('')}
          </ul>
        </div>

        <div class="pt-3 border-t border-[var(--term-border)] flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-1 text-[11px]">
            ${data.tech.map((t) => `<span class="term-tag">${t}</span>`).join('')}
          </div>
          <a href="${data.repo}" target="_blank" rel="noopener noreferrer" class="term-btn term-btn-primary">
            <span>open github repository ↗</span>
          </a>
        </div>
      </div>
    `;

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
  };

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
  };

  $$('.btn-open-detail').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const proj = btn.dataset.project;
      openModal(proj);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) {
      closeModal();
    }
  });

  /* ---------- 7. View Switcher: Projects vs Experiences ---------- */
  const viewBtns = $$('.view-filter-btn');
  const viewProjects = $('#view-projects');
  const viewExperiences = $('#view-experiences');

  viewBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      viewBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      if (viewProjects && viewExperiences) {
        const showProjects = view === 'projects';
        viewProjects.hidden = !showProjects;
        viewProjects.classList.toggle('hidden', !showProjects);
        viewExperiences.hidden = showProjects;
        viewExperiences.classList.toggle('hidden', showProjects);
      }
    });
  });

  if (window.location.hash === '#experiences' && viewBtns.length > 0) {
    const expBtn = Array.from(viewBtns).find((b) => b.dataset.view === 'experiences');
    if (expBtn) expBtn.click();
  }
})();
