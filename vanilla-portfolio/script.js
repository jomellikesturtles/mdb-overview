const pageLoadTime = performance.now();
var lazyLoading = false
var tracking_feature = false
const BASE_API_URL = 'https://qnvezz6gmtw3vxwmc2oxvvgncy0jnxqg.lambda-url.ap-southeast-1.on.aws';
function trackEvent(eventName, eventArgs) {
  if (window.umami && !!tracking_feature) {
    !!eventArgs ? umami.track(eventName, eventArgs) : umami.track(eventName)
  } else {
    console.log('[Mock Umami]', eventName, eventArgs);
  }
}


function simpleMarkdownParser(text) {
    return text
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')     // Headers
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>') // Bold text
        .replace(/\*(.*)\*/gim, '<em>$1</em>');     // Italic text
}


window.addEventListener("load", () => {
  // Feature Toggle Configuration
  const FEATURES = {
    mdbProject: isFeatureEnabled('mdbProject'),
    chat: isFeatureEnabled('chat'),
    lighthouseBadge: isFeatureEnabled('lighthouseBadge'),
    blueprint: isFeatureEnabled('blueprint'),
    workflow: isFeatureEnabled('workflow'),
    technologies: isFeatureEnabled('technologies'),
    tracking: isFeatureEnabled('tracking'),
    spotlight: isFeatureEnabled('spotlight'),
    lazyLoading: isFeatureEnabled('lazyLoading'),
    download: isFeatureEnabled('download'),
    blog: isFeatureEnabled('blog'),
    autoOpenChat: isFeatureEnabled('autoOpenChat')
  };

  if (window.location.pathname.includes('blog.html') && !FEATURES.blog) {
    window.location.replace('index.html');
    return;
  }

  lazyLoading = FEATURES.lazyLoading;
  tracking_feature = FEATURES.tracking;

  if (tracking_feature) {
    // 1. Dynamic Umami Script Injection
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://cloud.umami.is/script.js';
    script.setAttribute('data-website-id', '6ae06870-f0c7-43d6-9241-126542baf989');
    document.head.appendChild(script);
  }

  const spotlight = document.getElementById('cursor-spotlight');
  if (FEATURES.spotlight) {
    spotlight.classList.add('spotlight-overlay');
  }

  // Image Lazy Loading Engine
  const initLazyLoading = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.onload = () => {
              img.classList.add('loaded');
            };
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    window.lazyImageObserver = imageObserver;
    document.querySelectorAll('.lazy-img').forEach(img => imageObserver.observe(img));
  };

  if (FEATURES.lazyLoading) {
    initLazyLoading();
  }

  // Apply Feature Toggles (including URL parameter overrides)
  const applyFeatureToggles = () => {
    // Process each toggle
    Object.keys(FEATURES).forEach(key => {
      // If feature is disabled, hide all matching elements
      if (!FEATURES[key]) {
        const elements = document.querySelectorAll(`[data-feature="${key}"]`);
        elements.forEach(el => {
          el.style.display = 'none';
          // If it's a chat modal, we also want to remove 'show' class just in case
          if (key === 'chat') el.classList.remove('show');
        });
        console.log(`Feature [${key}] is DISABLED`);
      }
    });
  };

  applyFeatureToggles();

  // Track CV Downloads and Project Links globally
  document.addEventListener('click', (e) => {
    if (!window.umami && !!FEATURES.tracking) return;

    // CV Download
    const cvBtn = e.target.closest('.cv-button');
    if (cvBtn) {
      trackEvent('cv_downloaded');
    }

    // Project Links
    const projectLink = e.target;
    if (projectLink && projectLink.tagName.toUpperCase() == 'PROJECT-ARTICLE') {

      const articleAttr = projectLink.getAttribute('aria-label');
      const title = articleAttr ? articleAttr : 'Unknown Project';
      trackEvent('project_link_clicked', { project: title });
    }

    // Contact Methods (Email, Phone)
    const contactLink = e.target.closest('.contact-link');
    if (contactLink) {
      const href = contactLink.getAttribute('href');
      const type = href.startsWith('mailto:') ? 'email' : 'phone';
      trackEvent('contact_link_clicked', { type: type, value: href });
    }

    // Social Circles (GitHub, LinkedIn)
    const socialBtn = e.target.closest('.circle-btn');
    if (socialBtn) {
      const label = socialBtn.getAttribute('aria-label');
      trackEvent('social_link_clicked', { platform: label });
    }
  });

  // Track Section Views (3s Linger)
  const initSectionTracking = () => {
    const sectionTimers = new Map();

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.id;

        if (entry.isIntersecting) {
          if (!sectionTimers.has(sectionId)) {
            const timer = setTimeout(() => {

              console.log(`[Analytics] User lingered on section [${sectionId}] for 5s`);
              trackEvent('section_viewed', { section_id: sectionId });

              sectionObserver.unobserve(entry.target);
              sectionTimers.delete(sectionId);
            }, 5000);
            sectionTimers.set(sectionId, timer);
          }
        } else {
          if (sectionTimers.has(sectionId)) {
            clearTimeout(sectionTimers.get(sectionId));
            sectionTimers.delete(sectionId);
          }
        }
      });
    }, {
      threshold: 0.2 // Trigger for tall sections
    });

    document.querySelectorAll('section[id]').forEach(section => {
      sectionObserver.observe(section);
    });
  };

  initSectionTracking();

  // Scroll Depth Tracker
  let milestonesTracked = { 25: false, 50: false, 75: false, 100: false };
  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    [25, 50, 75, 100].forEach(milestone => {
      if (scrollPercent >= milestone && !milestonesTracked[milestone]) {
        milestonesTracked[milestone] = true;
        const seconds = Math.round((performance.now() - pageLoadTime) / 1000);
        trackEvent('scroll_milestone', { percent: milestone, duration_seconds: seconds });
      }
    });
  });


  window.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--mouse-x', `${x}px`);
      document.documentElement.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Intersection Observer for Fade In
  const fadeElements = document.querySelectorAll('.fade-in-on-scroll');
  const appearOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px"
  };

  const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      } else {
        entry.target.classList.add('is-visible');
        appearOnScroll.unobserve(entry.target);
      }
    });
  }, appearOptions);

  fadeElements.forEach(fader => {
    appearOnScroll.observe(fader);
  });

  // Intersection Observer for Zoom Effect (Hero Image)
  const heroImage = document.querySelector('.hero-image-container');
  if (heroImage) {
      const zoomObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('zoom-in');
            } else {
                entry.target.classList.remove('zoom-in');
            }
        });
      }, { threshold: 0.1 });
      zoomObserver.observe(heroImage);
  }

  // Profile Mood Toggle Interactivity
  const moodToggle = document.getElementById('mood-toggle');
  const profileImg = document.getElementById('profile-img');
  const moods = [
    'assets/about/20240421_090514.webp',
    'assets/about/20240420_170010.webp',
    'assets/about/PXL_20250630_132541732-EDIT.webp',
    'assets/about/PXL_20250913_102805329.webp',
    'assets/about/20240420_170020.webp'
  ];
  let currentMoodIndex = 0;

  if (moodToggle && profileImg) {
    moodToggle.addEventListener('click', () => {
      currentMoodIndex = (currentMoodIndex + 1) % moods.length;
      profileImg.style.opacity = '0';
      setTimeout(() => {
        profileImg.src = moods[currentMoodIndex];
        profileImg.style.opacity = '1';
      }, 300);
    });
  }

  // Role-Cycling Logic
  const roleElement = document.getElementById('role-cycle');
  if (roleElement) {
    const roles = [
      'Angular',
      'Java Spring Boot',
      'Architecting for Scale',
      'Performance Tuning',
      'Security Hardening',
      'Enterprise Modernization'
    ];
    let roleIndex = 0;

    setInterval(() => {
      roleElement.style.opacity = '0';
      roleElement.style.transform = 'translateY(10px)';

      setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        roleElement.textContent = roles[roleIndex];
        roleElement.style.opacity = '1';
        roleElement.style.transform = 'translateY(0)';
      }, 500);
    }, 3000);
  }

  // Dynamic Download Link Logic
  const updateDownloadLinks = () => {
    // Respect feature toggle
    if (!FEATURES.mdbProject || !FEATURES.download) {
      const mdbDownloadLink = document.getElementById('mdb-download-link');
      if (mdbDownloadLink) mdbDownloadLink.style.display = 'none';

      document.querySelectorAll('project-article').forEach(article => {
        const cardLink = article.shadowRoot.getElementById('card-download-link');
        if (cardLink) cardLink.style.display = 'none';
      });
      return;
    }

    const userAgent = window.navigator.userAgent;
    const isMac = /Macintosh|Mac OS X/i.test(userAgent);
    const isWin = /Windows/i.test(userAgent);
    const downloadUrl = "https://github.com/jomellikesturtles/mdb-electron/releases/download/v1.0.0-alpha/mdb-darwin-arm64.zip";

    // 1. Hero Section Link
    const mdbDownloadLink = document.getElementById('mdb-download-link');
    if (mdbDownloadLink) {
      const btnText = mdbDownloadLink.querySelector('.btn-text');
      if (isMac) {
        mdbDownloadLink.href = downloadUrl;
        if (btnText) btnText.textContent = "Download MDB (macOS)";
        mdbDownloadLink.style.display = 'inline-flex';
      } else if (isWin) {
        mdbDownloadLink.href = downloadUrl;
        if (btnText) btnText.textContent = "Download MDB (Windows)";
        mdbDownloadLink.style.display = 'inline-flex';
      } else {
        // HIDE on mobile/other devices in Hero
        mdbDownloadLink.style.display = 'none';
      }
    }

    // 2. Project Card Link
    document.querySelectorAll('project-article').forEach(article => {
      const cardLink = article.shadowRoot.getElementById('card-download-link');
      if (cardLink) {
        const btnText = cardLink.querySelector('.btn-text');
        if (isMac || isWin) {
           cardLink.href = downloadUrl;
           if (btnText) btnText.textContent = isMac ? "Download MDB (macOS)" : "Download MDB (Windows)";
           cardLink.style.display = 'inline-flex';
           cardLink.classList.remove('info-only');
        } else {
           // SHOW informational badge in card for mobile/others
           if (btnText) btnText.textContent = "Available on Windows and macOS";
           cardLink.style.display = 'inline-flex';
           cardLink.classList.add('info-only');
           cardLink.removeAttribute('href');
        }
      }
    });
  };

  updateDownloadLinks();
});

class StatsSpan extends HTMLElement {
  static get observedAttributes() {
    return ["article"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set article(val) {
    this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="styles.css">
    <div class="stat-box">
      <span class="stat-number">${val.statsNumber}</span>
      <p class="stat-label">${val.statsLabel}</p>
    </div>
    <style>
      .stat-box {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .stat-number {
        font-size: 5rem;
        font-weight: 700;
        line-height: 1;
        background: linear-gradient(to bottom, #fff, #86868b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .stat-label {
        font-size: 1.2rem;
        font-weight: 600;
        color: #86868b;
        margin-top: 10px;
      }
    </style>
    `;
  }
  get article() {
    return this.getAttribute("article");
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (newVal) this.article = JSON.parse(newVal);
  }
}

class ProjectArticle extends HTMLElement {
  static get observedAttributes() {
    return ["article"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._isArchitectureView = false;
  }

  set article(val) {
    this._articleData = val;
    this.render();
  }

  get article() {
    return this.getAttribute("article");
  }

  toggleView() {
    this._isArchitectureView = !this._isArchitectureView;
    this.render();
  }

  render() {
    const val = this._articleData;
    if (!val) return;

    const isGolden = val.isGolden || val.title === 'MDB (Media Data Base)';
    const status = val.status || 'online';
    const statusConfig = {
      'online': { label: 'Online', class: 'online' },
      'sunset': { label: 'Archived', class: 'sunset' },
      'private': { label: 'Internal', class: 'private' },
      'showcase': { label: 'Showcase', class: 'showcase' },
      'progress': { label: 'In Progress', class: 'progress' }
    }[status] || { label: 'Online', class: 'online' };

    this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="styles.css">
    <article class="project-card ${isGolden ? 'golden-project' : ''}">
      ${val.projectUrl ? `
        <a href="${val.projectUrl}" ${val.projectUrl.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} class="main-card-link" aria-label="Visit ${val.title}"></a>
      ` : ''}
      <div class="project-content">
        <div class="project-header">
           <h3 class="project-title">${val.title}${val.projectUrl ? ` <span class="link-arrow">↗</span>` : ''}</h3>
           ${val.year ? `<span class="project-year">${val.year}</span>` : ''}
           <div class="status-badge ${statusConfig.class}">
             <span class="status-dot"></span>
             ${statusConfig.label}
           </div>
           ${isGolden ? '<span class="badge">Featured</span>' : ''}
           ${isGolden && val.deployCmd ? `
             <div class="deploy-badge" id="copy-deploy" title="Click to copy deployment command">
                <span class="prompt">>_</span>
                <code class="cmd-text">${val.deployCmd}</code>
                <span class="copy-feedback">Copied!</span>
             </div>
           ` : ''}
        </div>

        <div class="view-container ${this._isArchitectureView ? 'show-arch' : 'show-overview'}">
          <div class="overview-view">
            <p class="project-desc">${val.description}</p>
            <div class="tech-stack">
              ${val.techStacks.map(tech => `
                <span class="tech-tag">
                  <svg class="tech-icon"><use xlink:href="sprite.svg#${tech}"></use></svg>
                  ${tech}
                </span>
              `).join('')}
            </div>
          </div>

          <div class="architecture-view">
             <ul class="arch-list">
                 <li><strong>Frontend:</strong> Angular / Electron</li>
                 <li><strong>BFF Layers:</strong> Spring Boot BFFs with Redis Cache</li>
                 <li><strong>Services:</strong> user/media data gateways</li>
                 <li><strong>Integration:</strong> gRPC & Kafka Event Stream</li>
                 <li><strong>Database:</strong> PostgreSQL Database</li>
                <li><strong>DevOps:</strong> Docker / GitHub Actions</li>
                <li><strong>Perf:</strong> Hyperlight SSG & Aggressive Inlining</li>
             </ul>
          </div>
        </div>

        ${isGolden ? `
          <div class="project-actions">
            <button class="toggle-btn" id="view-toggle">
              ${this._isArchitectureView ? 'View Overview' : 'View Architecture'}
            </button>
            ${val.githubUrl ? `
              <a href="${val.githubUrl}" target="_blank" rel="noopener" class="source-btn">
                <svg class="source-icon" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"/></svg>
                View Source
              </a>
            ` : ''}
            <a id="card-download-link" href="#" class="download-card-btn" style="display:none">
              <svg class="btn-icon" viewBox="0 0 24 24"><path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/></svg>
              <span class="btn-text">Download MDB</span>
            </a>
          </div>
        ` : ''}
      </div>

      <div class="project-image-wrapper">
         <img src="${val.imgUrl}" alt="${val.title}" class="${lazyLoading ? 'lazy-img' : ''}">
         ${isGolden && !this._isArchitectureView ? `
            <div class="mini-player-overlay">
            <!--<div class="play-icon"></div>
            <span class="stream-text">8K Stream Ready</span>-->
         </div>
            ` : ''}
      </div>
    </article>
    <style>
      :host {
        display: block;
        margin-left: 20px;
      }
      .project-card {
        position: relative;
        background-color: var(--bg-secondary);
        border-radius: 30px;
        overflow: visible;
        display: flex;
        flex-direction: column;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255,255,255,0.05);
      }
      .timeline-marker {
        position: absolute;
        left: -40px;
        top: 40px;
        bottom: 40px;
        width: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 20;
      }
      .timeline-line {
        flex: 1;
        width: 1px;
        background: linear-gradient(to bottom, transparent, var(--accent-color), transparent);
        opacity: 0.3;
      }
      .timeline-year {
        writing-mode: vertical-lr;
        transform: rotate(180deg);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: var(--accent-color);
        padding: 15px 0;
        white-space: nowrap;
      }
      .main-card-link {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 5;
        border-radius: 30px;
      }
      .project-header, .project-actions, .tech-stack, .deploy-badge {
        position: relative;
        z-index: 10;
      }
      .project-card:hover {
        transform: translateY(-10px);
        border-color: rgba(255,255,255,0.1);
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      }
      .golden-project {
        background: linear-gradient(135deg, #1d1d1f 0%, #000 100%);
        border: 1px solid rgba(41, 151, 255, 0.3);
      }
      @media (min-width: 800px) {
        .project-card {
           flex-direction: row;
           align-items: stretch;
           min-height: 450px;
        }
      }
      .project-content {
        padding: 40px;
        flex: 1.2;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .project-header {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 20px;
      }
      .project-title {
        font-size: 36px;
        color: var(--text-primary);
        margin: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .link-arrow {
        color: var(--primary-color);
        font-size: 24px;
        opacity: 0.5;
        display: inline-block;
        transition: transform 0.3s ease, opacity 0.3s ease;
      }
      .project-card:hover .link-arrow {
        transform: translate(3px, -3px);
        opacity: 1;
      }
      .project-year {
        font-size: 14px;
        color: var(--text-secondary);
        font-weight: 500;
        background: rgba(255,255,255,0.03);
        padding: 4px 12px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.05);
      }
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255,255,255,0.05);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
        border: 1px solid rgba(255,255,255,0.1);
      }
      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
      .online .status-dot { background-color: #34c759; box-shadow: 0 0 8px #34c759; }
      .sunset .status-dot { background-color: #ff9500; box-shadow: 0 0 8px #ff9500; }
      .private .status-dot { background-color: #007aff; box-shadow: 0 0 8px #007aff; }
      .showcase .status-dot { background-color: #af52de; box-shadow: 0 0 8px #af52de; }
      .progress .status-dot { background-color: #ffcc00; box-shadow: 0 0 8px #ffcc00; }

      .badge {
        background: var(--accent-color);
        color: #fff;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 10px;
        text-transform: uppercase;
        font-weight: 700;
      }
      .deploy-badge {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #000;
        border: 1px solid rgba(41, 151, 255, 0.4);
        padding: 6px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .deploy-badge:hover {
        border-color: var(--accent-color);
        background: rgba(41, 151, 255, 0.05);
        box-shadow: 0 0 15px rgba(41, 151, 255, 0.2);
      }
      .prompt {
        color: var(--accent-color);
        font-family: monospace;
        font-weight: bold;
      }
      .cmd-text {
        color: #fff;
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 12px;
      }
      .copy-feedback {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--accent-color);
        color: #000;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 700;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .copy-feedback.show {
        opacity: 1;
      }
      .view-container {
        position: relative;
        min-height: 180px;
      }
      .overview-view, .architecture-view {
        transition: all 0.4s ease;
      }
      .show-overview .architecture-view {
        opacity: 0;
        transform: translateX(20px);
        pointer-events: none;
        position: absolute;
        top: 0;
      }
      .show-arch .overview-view {
        opacity: 0;
        transform: translateX(-20px);
        pointer-events: none;
        position: absolute;
        top: 0;
      }
      .project-desc {
        font-size: 19px;
        color: var(--text-secondary);
        line-height: 1.5;
        margin-bottom: 30px;
      }
      .tech-stack {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .tech-tag {
        font-size: 12px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255,255,255,0.05);
        padding: 6px 12px;
        border-radius: 20px;
        color: var(--text-secondary);
        transition: all 0.3s;
      }
      .tech-tag:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }
      .tech-icon {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }
      .arch-list {
        list-style: none;
        padding: 0;
      }
      .arch-list li {
        font-size: 16px;
        color: var(--text-secondary);
        margin-bottom: 10px;
        display: flex;
        align-items: center;
      }
      .arch-list li::before {
        content: "•";
        color: var(--accent-color);
        font-weight: bold;
        display: inline-block;
        width: 1em;
        margin-left: 0;
      }
      .arch-list strong {
        color: var(--text-primary);
        margin-right: 8px;
        min-width: 100px;
        display: inline-block;
      }
      .project-actions {
        margin-top: 40px;
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }
      .toggle-btn, .source-btn {
        background: transparent;
        color: var(--accent-color);
        border: 1px solid var(--accent-color);
        padding: 10px 24px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
      .toggle-btn:hover, .source-btn:hover {
        background: var(--accent-color);
        color: #fff;
      }
      .download-card-btn {
        background: var(--accent-color);
        color: #fff;
        border: 1px solid var(--accent-color);
        padding: 10px 24px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
      .download-card-btn:hover {
        background: #ff9d5c;
        border-color: #ff9d5c;
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(255, 130, 41, 0.4);
      }
      .download-card-btn.info-only {
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--text-secondary);
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: default;
        pointer-events: none;
      }
      .download-card-btn.info-only:hover {
        transform: none;
        box-shadow: none;
      }
      .download-card-btn.info-only .btn-icon {
        display: none;
      }
      .source-icon {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }
      .btn-icon {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }
      .project-image-wrapper {
        flex: 1;
        position: relative;
        overflow: hidden;
        border-top-right-radius: 30px;
        border-bottom-right-radius: 30px;
      }
      @media (max-width: 799px) {
        .project-image-wrapper {
          border-radius: 0;
          border-bottom-left-radius: 30px;
          border-bottom-right-radius: 30px;
        }
      }
      .project-image-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
      .project-card:hover .project-image-wrapper img {
        transform: scale(1.1);
      }
      .mini-player-overlay {
        position: absolute;
        bottom: 20px;
        left: 20px;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(10px);
        padding: 10px 20px;
        border-radius: 40px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        border: 1px solid rgba(255,255,255,0.1);
      }
      .play-icon {
        width: 0;
        height: 0;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-left: 10px solid var(--accent-color);
      }
    </style>
    `;

    const toggleBtn = this.shadowRoot.getElementById('view-toggle');
    if (toggleBtn) {
      toggleBtn.onclick = () => this.toggleView();
    }

    const copyBtn = this.shadowRoot.getElementById('copy-deploy');
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(val.deployCmd);
        const feedback = this.shadowRoot.querySelector('.copy-feedback');
        feedback.classList.add('show');
        setTimeout(() => feedback.classList.remove('show'), 2000);
      };
    }

    // Register with lazy image observer
    const img = this.shadowRoot.querySelector('.lazy-img');
    if (img && window.lazyImageObserver) {
      window.lazyImageObserver.observe(img);
    }
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    if (newVal) {
      this._articleData = JSON.parse(newVal);
      this.render();
    }
  }
}

class ExperienceArticle extends HTMLElement {
  static get observedAttributes() {
    return ["article"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set article(val) {
    const descContent = Array.isArray(val.description)
      ? `<ul>${val.description.map(item => `<li>${item}</li>`).join('')}</ul>`
      : `<p>${val.description}</p>`;

    this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="styles.css">
    <div class="prof-timeline-item">
      <div class="prof-timeline-marker"></div>
      <div class="prof-timeline-content">
          <span class="prof-date">${val.date}</span>
          <h3 class="prof-title">${val.title}</h3>
          <div class="prof-desc">${descContent}</div>
      </div>
    </div>
    <style>
      :host {
        display: block;
      }
      .prof-timeline-item {
        position: relative;
        margin-bottom: 60px;
      }
      .prof-timeline-marker {
        position: absolute;
        left: -46px;
        top: 5px;
        width: 12px;
        height: 12px;
        background-color: var(--accent-color, #2997ff);
        border-radius: 50%;
        box-shadow: 0 0 0 5px rgba(0,0,0,1);
      }
      .prof-date {
        font-size: 14px;
        font-weight: 600;
        color: var(--accent-color, #2997ff);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 5px;
        display: block;
      }
      .prof-title {
        font-size: 24px;
        color: var(--text-primary, #f5f5f7);
        margin-bottom: 10px;
        font-weight: 600;
      }
      .prof-desc {
        font-size: 18px;
        color: var(--text-secondary, #86868b);
        line-height: 1.5;
        max-width: 800px;
      }
      .prof-desc p {
        margin: 0;
      }
      .prof-desc ul {
        margin: 10px 0;
        padding-left: 20px;
        list-style-type: disc;
      }
      .prof-desc li {
        margin-bottom: 8px;
        line-height: 1.6;
        color: var(--text-secondary, #86868b);
      }
      .prof-desc li::marker {
        color: var(--accent-color, #2997ff);
      }
    </style>
    `;
  }
  get article() {
    return this.getAttribute("article");
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (newVal) this.article = JSON.parse(newVal);
  }
}

class BlogCard extends HTMLElement {
  static get observedAttributes() {
    return ["article"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set article(val) {
    this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="styles.css">
    <a href="#${val.slug}" class="card-link">
      <article class="blog-card">
        <div class="card-image-wrapper">
          <img src="${val.image}" alt="${val.title}">
        </div>
        <div class="card-content">
          <div class="blog-meta">
            <span class="blog-date">${val.date}</span>
            <span class="blog-category">${val.category}</span>
          </div>
          <h2 class="blog-title">${val.title}</h2>
        </div>
      </article>
    </a>
    <style>
      :host {
        display: block;
      }
      .card-link {
        text-decoration: none;
        color: inherit;
        display: block;
      }
      .blog-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        overflow: hidden;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .blog-card:hover {
        transform: translateY(-5px);
        border-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }
      .card-image-wrapper {
        width: 100%;
        height: 200px;
        overflow: hidden;
      }
      .card-image-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
      .blog-card:hover .card-image-wrapper img {
        transform: scale(1.05);
      }
      .card-content {
        padding: 24px;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .blog-meta {
        display: flex;
        gap: 15px;
        margin-bottom: 12px;
        font-size: 13px;
        font-weight: 500;
      }
      .blog-date {
        color: var(--text-secondary, #86868b);
      }
      .blog-category {
        color: var(--accent-color, #2997ff);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .blog-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary, #f5f5f7);
        line-height: 1.4;
        margin: 0;
      }
    </style>
    `;
  }

  get article() {
    return this.getAttribute("article");
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (newVal) this.article = JSON.parse(newVal);
  }
}

class BlogDetail extends HTMLElement {
  static get observedAttributes() {
    return ["article"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set article(val) {
    this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="styles.css">
    <div class="blog-detail">
      <a href="#" class="back-link">&larr; Back to Articles</a>
      <div class="detail-hero">
        <img src="${val.image}" alt="${val.title}">
      </div>
      <div class="blog-meta">
        <span class="blog-date">${val.date}</span>
        <span class="blog-category">${val.category}</span>
      </div>
      <h1 class="blog-title">${val.title}</h1>
      <div class="blog-content">${val.content}</div>
    </div>
    <style>
      :host {
        display: block;
      }
      .blog-detail {
        max-width: 800px;
        margin: 0 auto;
      }
      .back-link {
        display: inline-block;
        color: var(--accent-color, #2997ff);
        text-decoration: none;
        font-weight: 600;
        margin-bottom: 30px;
        transition: transform 0.2s;
      }
      .back-link:hover {
        transform: translateX(-4px);
      }
      .detail-hero {
        width: 100%;
        height: 400px;
        border-radius: 20px;
        overflow: hidden;
        margin-bottom: 30px;
        border: 1px solid rgba(255,255,255,0.05);
      }
      .detail-hero img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .blog-meta {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
        font-size: 14px;
        font-weight: 500;
      }
      .blog-date {
        color: var(--text-secondary, #86868b);
      }
      .blog-category {
        color: var(--accent-color, #2997ff);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .blog-title {
        font-size: clamp(2rem, 1.5rem + 1.5vw, 2.75rem);
        font-weight: 800;
        color: var(--text-primary, #f5f5f7);
        margin-bottom: 30px;
        line-height: 1.2;
      }
      .blog-content {
        font-size: 18px;
        color: var(--text-secondary, #86868b);
        line-height: 1.7;
      }
      .blog-content p {
        margin-bottom: 20px;
      }
      .blog-content p:last-child {
        margin-bottom: 0;
      }
      .blog-content img {
        width: 100%;
        max-height: 400px;
        object-fit: cover;
        border-radius: 12px;
        margin: 24px 0;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
    </style>
    `;
  }

  get article() {
    return this.getAttribute("article");
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (newVal) this.article = JSON.parse(newVal);
  }
}

class BlogApp extends HTMLElement {
  connectedCallback() {
    this.render();
    this.hashHandler = () => this.render();
    window.addEventListener('hashchange', this.hashHandler);
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.hashHandler);
  }

  render() {
    const slug = window.location.hash.slice(1);
    const posts = [
      {
        slug: "legacy-evolution",
        date: "August 4, 2026",
        category: "Engineering Philosophy",
        title: "Architecting the Future: Embracing legacy evolution without fear",
        image: "assets/laptop-with-code.jpg",
        content: "<p>Enterprise software systems are organic. Over years of rapid feature shipping and organizational pivots, even the cleanest design accumulates cruft. As a Senior Full-Stack Engineer, I have witnessed first-hand the dread that legacy systems can instill in development teams.</p><p>But legacy code isn\u0027t a failure; it\u0027s proof of survival. When migrating critical applications—like the core fintech tools I rewrote from Angular 5 to 17—the goal is never just to replace old code with new code. It is to capture the business intelligence baked into that legacy system and package it in a modern, resilient, high-performance architecture.</p><p>My engineering philosophy revolves around three core tenets: clean decoupling, observability first, and developer tooling automation. By setting up robust build pipelines, strict linting, and automated sanity gates, we enable teams to push changes to production with absolute confidence.</p>"
      },
      {
        slug: "decoupling-strategy",
        date: "July 15, 2026",
        category: "System Design",
        title: "The Decoupling Strategy: Event-driven workflows in enterprise platforms",
        image: "assets/about/20240421_090514.webp",
        content: "<p>When we built the MDB (Media Data Base) platform, our core performance bottleneck lay in media ingestion sync events blocking main thread database transactions. A typical video upload would stall standard REST controllers, causing memory leaks and network socket starvation under high load.</p><img src=\"assets/mdb-dashboard-screen.png\" alt=\"MDB Dashboard System\"><p>To solve this, we decoupled the architecture entirely. We designed a lightweight Gateway BFF acting as a high-availability entry-point, which forwards events to message brokers powered by Apache Kafka. Downstream worker nodes process the stream asynchronously, keeping database operations stateless and independent.</p><img src=\"assets/laptop-with-code.jpg\" alt=\"Developer Coding Interface\"><p>Choosing the right message serialization models (like gRPC protocol buffers over raw JSON) saved 40% of standard transport latency, proving that extreme optimization doesn\u0027t always mean rewriting code—it means redesigning how code talks to each other.</p><p>Beyond performance, decoupling enhances system observability. When a microservice undergoes maintenance, the message broker absorbs incoming payloads, ensuring zero downtime for client-facing interfaces. Scalability is no longer a theoretical goal; it is a built-in property of our network topology.</p>"
      }
    ];

    if (slug) {
      const post = posts.find(p => p.slug === slug);
      if (post) {
        this.innerHTML = `<blog-detail article='${JSON.stringify(post).replace(/'/g, "&apos;")}'></blog-detail>`;
        window.scrollTo(0, 0);
        return;
      }
    }

    // List View
    this.innerHTML = `
      <div class="blog-grid">
        ${posts.map(post => `<blog-card article='${JSON.stringify(post).replace(/'/g, "&apos;")}'></blog-card>`).join('')}
      </div>
    `;
  }
}

// Define the custom elements
window.customElements.define("stats-span", StatsSpan);
window.customElements.define("project-article", ProjectArticle);
window.customElements.define("experience-article", ExperienceArticle);
window.customElements.define("blog-card", BlogCard);
window.customElements.define("blog-detail", BlogDetail);
window.customElements.define("blog-app", BlogApp);

/* --- Chat Modal Logic --- */
(function() {
  const chatPill = document.getElementById('chat-pill');
  const chatModal = document.getElementById('chat-modal');
  const chatClose = document.getElementById('chat-close');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatMessages = document.getElementById('chat-messages');
  const quickReplies = document.querySelectorAll('.quick-reply-btn');

  if (chatPill && chatModal) {
    let currentInterval = 120000; // default 2 minutes
    let healthTimeoutId = null;

    const checkHealth = async (isInitialLoad = false) => {
      const statusDot = document.querySelector('.chat-status-dot');
      const statusText = document.querySelector('.chat-status-text');
      if (!statusDot || !statusText) return;

      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`${BASE_API_URL}/health`, {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(id);
        if (response.ok) {
          statusDot.style.backgroundColor = '#34c759'; // Green
          currentInterval = 120000; // reset on success
        } else {
          statusDot.style.backgroundColor = '#86868b'; // Grey (Offline)
          statusText.textContent = 'Offline';
          currentInterval = isInitialLoad ? 3000 : Math.min(currentInterval * 2, 120000);
        }
      } catch (error) {
        statusDot.style.backgroundColor = '#86868b'; // Grey (Offline)
        currentInterval = isInitialLoad ? 3000 : Math.min(currentInterval * 2, 120000);
      }

      if (healthTimeoutId) clearTimeout(healthTimeoutId);
      healthTimeoutId = setTimeout(() => checkHealth(false), currentInterval);
    };

    // Run initial health check
    checkHealth(true);

    // Auto-open chat modal on load if toggles are enabled
    if (isFeatureEnabled('chat') && isFeatureEnabled('autoOpenChat')) {
      chatModal.classList.add('show');
      trackEvent('chat_opened');
    }

    chatPill.addEventListener('click', () => {
      const isShowing = chatModal.classList.toggle('show');
      if (isShowing) {
        trackEvent('chat_opened');
        checkHealth(false);
      }
    });

    chatClose.addEventListener('click', () => {
      chatModal.classList.remove('show');
    });

    const addMessage = (text, sender, isLoading = false) => {
      const msg = document.createElement('div');
      msg.classList.add('chat-message', sender);
      if (isLoading) {
        msg.classList.add('loading');
        msg.innerHTML = `<div class="loading-dots"><span></span><span></span><span></span></div>`;
      } else {
        // Regex to detect URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = simpleMarkdownParser(text);
        msg.innerHTML = text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);


      }
      chatMessages.appendChild(msg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return msg;
    };

    const getSessionId = () => {
      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15) + '-' + Date.now();
        sessionStorage.setItem('session_id', sessionId);
      }
      return sessionId;
    };

    const checkRateLimit = () => {
      const today = new Date().toISOString().split('T')[0];
      let rateData = localStorage.getItem('chat_rate_limit');
      if (rateData) {
        try {
          rateData = JSON.parse(rateData);
        } catch (e) {
          rateData = null;
        }
      }

      if (!rateData || rateData.day !== today) {
        rateData = { day: today, count: 0 };
      }

      if (rateData.count >= 10) {
        return false;
      }

      rateData.count++;
      localStorage.setItem('chat_rate_limit', JSON.stringify(rateData));
      return true;
    };

    const sendMessage = async (text) => {
      const loadingMsg = addMessage('', 'bot', true);

      if (!checkRateLimit()) {
        chatMessages.removeChild(loadingMsg);
        addMessage("Rate limit exceeded. You can only send 10 messages per day. Please try again tomorrow!", 'bot');
        return;
      }

      try {
        const chatHeaders = {
          'Content-Type': 'application/json',
          'session_id': getSessionId()
        };
        const chatCookie = sessionStorage.getItem('chat_cookie');
        if (chatCookie) {
          chatHeaders['Cookie'] = chatCookie;
        }

        // const response = await fetch(`http://127.0.0.1:7003/chat/owner`, {
        const response = await fetch(`${BASE_API_URL}/chat/owner`, {
          method: 'POST',
          headers: chatHeaders,
          body: JSON.stringify({ message: text })
        });

        const setCookie = response.headers.get('set-cookie') || response.headers.get('Set-Cookie');
        if (setCookie) {
          const parsedCookie = setCookie.split(';')[0].trim();
          sessionStorage.setItem('chat_cookie', parsedCookie);
        }
        const data = await response.json();
        chatMessages.removeChild(loadingMsg);
        if (data && data.final_answer) {
          addMessage(data.final_answer, 'bot');
        } else {
          addMessage("I've received your message! I'll get back to you soon.", 'bot');
        }
      } catch (error) {
        console.error("Chat Error:", error);
        chatMessages.removeChild(loadingMsg);
        addMessage("Oops! Something went wrong. Please try again later.", 'bot');
      }
    };

    const handleSend = async () => {
      const text = chatInput.value.trim();
      if (text) {
        addMessage(text, 'user');
        chatInput.value = '';
        trackEvent('chat_message_sent', { message: text.substring(0, 100) });
        await sendMessage(text);
      }
    };

    if (chatSend) {
      chatSend.addEventListener('click', handleSend);
    }

    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }

    quickReplies.forEach(btn => {
      btn.addEventListener('click', () => {
        const reply = btn.getAttribute('data-reply');
        const text = btn.textContent;
        const query = btn.getAttribute('data-query') || text;

        const loadingMsg = addMessage('', 'bot', true);

        // Enforce rate limiting on quick reply clicks
        if (!checkRateLimit()) {
          chatMessages.removeChild(loadingMsg);
          addMessage("Rate limit exceeded. You can only send 10 messages per day. Please try again tomorrow!", 'bot');
          return;
        }

        // Show user message instantly
        chatMessages.removeChild(loadingMsg);
        addMessage(query, 'user');
        trackEvent('quick_reply_clicked', { reply_type: reply });
        trackEvent('chat_message_sent', { message: query.substring(0, 100) });

        const nextLoadingMsg = addMessage('', 'bot', true);

        setTimeout(() => {
          chatMessages.removeChild(nextLoadingMsg);
          let response = "";
          switch(reply) {
            case 'fun':
              response = `The craziest thing I did in life was hiking Mt. Guiting-Guiting in the summer of 2025 under constant torrential rain.<br><br>With no clearing of clouds, it rained all day and night for 3 straight days. I almost fell down a 90-degree cliff, slipped and fell between jagged rocks on the notorious Knife's Edge trail, and slept with half of my body submerged in water because our camp flooded. We stayed wet for the entire 3 days. The irony? The exact moment we finally got back down to the trail head, the sky cleared and it became completely sunny!<br><br><div style="text-align:center;"><img src="assets/about/g2_hike.jpg" alt="Mt. Guiting-Guiting Knife's Edge" style="max-width:240px; width:100%; border-radius:10px; margin:5px auto; border:1px solid rgba(255,255,255,0.1);"><br><span style="display:block; font-size:11px; color:var(--text-secondary); margin-bottom:10px; font-style:italic;">Navigating Mt. Guiting-Guiting's Knife's Edge in the rain.</span></div><br>This wild hike reminded me that even the most volatile, stormy deployments eventually clear up. In systems engineering, I design for the worst-case storm expecting failures and building resilient, decoupled components that can survive being "submerged" under unexpected conditions.`;
              break;
            case 'skills':
              response = `<strong>My Technical Skills Portfolio:</strong><br><br><span style="display:inline-block; background:rgba(0,122,255,0.15); color:#007aff; padding:4px 10px; border-radius:10px; font-size:13px; font-weight:700; margin-bottom:4px;">FRONTEND</span><br>Angular, React, JavaScript, TypeScript, Tailwind CSS, Core Web Vitals Optimization<br><br><span style="display:inline-block; background:rgba(0,122,255,0.15); color:#007aff; padding:4px 10px; border-radius:10px; font-size:13px; font-weight:700; margin-bottom:4px;">BACKEND</span><br>Java Spring Boot, Node.js (Express), REST, gRPC, Apache Kafka, Keycloak (OAuth2/OIDC)<br><br><span style="display:inline-block; background:rgba(0,122,255,0.15); color:#007aff; padding:4px 10px; border-radius:10px; font-size:13px; font-weight:700; margin-bottom:4px;">FULLSTACK</span><br>PostgreSQL, Redis caching and session validation, Docker, Kubernetes, GitHub Actions CI/CD, AWS, Azure<br><br><span style="display:inline-block; background:rgba(0,122,255,0.15); color:#007aff; padding:4px 10px; border-radius:10px; font-size:13px; font-weight:700; margin-bottom:4px;">SOFT SKILLS</span><br>Technical Leadership, Team Mentorship & Brownbag Sessions, Agile Engineering Coordination, Decoupling Architectures<br><br><em>Do I have the right skills for your team? Let's connect!</em>`;
              break;
            case 'contact':
              response = `You can reach me via the following channels:<br><br><strong>Email:</strong> <a href="mailto:jommelsaligumba@gmail.com" style="color:var(--accent-color);">jommelsaligumba@gmail.com</a><br><strong>Phone:</strong> +639291419400<br><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/jommelsaligumba/" target="_blank" style="color:var(--accent-color);">linkedin.com/in/jommelsaligumba</a>`;
              break;
            case 'me':
              response = `👤 <strong>About Jommel Saligumba:</strong><br><br>I am a Senior Full-Stack Developer specializing in building decoupled, high-performance web systems and automated DevOps pipelines.<br><br>🎓 <strong>Education:</strong><br>Bachelor of Science in Computer Engineering from <strong>STI College Fairview</strong> (Class of 2016, Academic Awardee).<br><br><div style="text-align:center;"><img src="assets/about/PXL_20250630_132541732-EDIT.webp" alt="Jommel Saligumba" style="max-width:120px; width:100%; border-radius:50%; border:2px solid var(--accent-color); margin:5px auto;"></div>`;
              break;
            case 'projects':
              response = `<strong>My Featured Projects:</strong><br><br>
<div style="display:flex; gap:15px; overflow-x:auto; padding-bottom:10px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; width:100%;">
  <a href="./mdb.html" style="text-decoration:none; color:inherit; flex:0 0 200px; scroll-snap-align:start; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; display:flex; flex-direction:column; box-sizing:border-box;">
    <img src="assets/mdb-dashboard-screen.png" alt="MDB" style="width:100%; height:100px; object-fit:cover; border-radius:8px; margin-bottom:8px;">
    <h4 style="margin:0 0 4px 0; color:var(--text-primary); font-size:14px; font-weight:600; white-space:normal; line-height:1.2;">MDB (Media Data Base)</h4>
    <p style="margin:0; font-size:12px; color:var(--text-secondary); line-height:1.3; flex-grow:1; white-space:normal;">High-performance media ecosystem with Spring Boot, Angular/Electron, and Kafka.</p>
  </a>
  <a href="https://google.com" target="_blank" style="text-decoration:none; color:inherit; flex:0 0 200px; scroll-snap-align:start; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; display:flex; flex-direction:column; box-sizing:border-box;">
    <img src="assets/denr.jpg" alt="DENR" style="width:100%; height:100px; object-fit:cover; border-radius:8px; margin-bottom:8px;">
    <h4 style="margin:0 0 4px 0; color:var(--text-primary); font-size:14px; font-weight:600; white-space:normal; line-height:1.2;">DENR Booking</h4>
    <p style="margin:0; font-size:12px; color:var(--text-secondary); line-height:1.3; flex-grow:1; white-space:normal;">Mountaineering booking portal with QR code ticketing for seasonal crowds.</p>
  </a>
  <a href="https://register.account-utradeph.com/#/open-an-account/registration/consent" target="_blank" style="text-decoration:none; color:inherit; flex:0 0 200px; scroll-snap-align:start; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; display:flex; flex-direction:column; box-sizing:border-box;">
    <img src="assets/utrade.jpg" alt="U-Trade" style="width:100%; height:100px; object-fit:cover; border-radius:8px; margin-bottom:8px;">
    <h4 style="margin:0 0 4px 0; color:var(--text-primary); font-size:14px; font-weight:600; white-space:normal; line-height:1.2;">U-Trade Platform</h4>
    <p style="margin:0; font-size:12px; color:var(--text-secondary); line-height:1.3; flex-grow:1; white-space:normal;">Real-time stock trading administration and onboarding registration platform.</p>
  </a>
  <a href="https://google.com" target="_blank" style="text-decoration:none; color:inherit; flex:0 0 200px; scroll-snap-align:start; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; display:flex; flex-direction:column; box-sizing:border-box;">
    <img src="assets/laptop-with-code.jpg" alt="XBin" style="width:100%; height:100px; object-fit:cover; border-radius:8px; margin-bottom:8px;">
    <h4 style="margin:0 0 4px 0; color:var(--text-primary); font-size:14px; font-weight:600; white-space:normal; line-height:1.2;">XBin Timekeeper</h4>
    <p style="margin:0; font-size:12px; color:var(--text-secondary); line-height:1.3; flex-grow:1; white-space:normal;">Enterprise remote employee shift tracking and dashboard timekeeper.</p>
  </a>
</div>`;
              break;
            case 'stack':
              response = "I specialize in Angular, Java Spring Boot, and Architecting for Scale.";
              break;
            case 'resume':
              response = "You can find my CV download link in the About section of this page.";
              break;
            default:
              response = "Thanks for your interest! How else can I help?";
          }
          addMessage(response, 'bot');
        }, 800);
      });
    });
  }

  // Trigger entry animation on load (skip in automated tests to prevent flakiness)
  if (!navigator.webdriver) {
    window.addEventListener('load', () => {
      const chatPill = document.getElementById('chat-pill');
      if (chatPill) {
        chatPill.classList.add('animate-in');
      }
    });
  }
})();
