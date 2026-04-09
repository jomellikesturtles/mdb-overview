window.addEventListener("load", () => {
  // Feature Toggle Configuration
  const FEATURES = {
    mdbProject: false,
    chat: false,
    lighthouseBadge: false,
    blueprint: false,
    workflow: false,
    technologies: false
  };

  // Apply Feature Toggles (including URL parameter overrides)
  const applyFeatureToggles = () => {
    const params = new URLSearchParams(window.location.search);

    // Process each toggle
    Object.keys(FEATURES).forEach(key => {
      // Check URL for overrides (e.g., ?feature:chat=false)
      const urlOverride = params.get(`feature:${key}`);
      if (urlOverride !== null) {
        FEATURES[key] = urlOverride === 'true';
      }

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

  // Spotlight Cursor Effect Logic
  const spotlight = document.getElementById('cursor-spotlight');
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
// ...
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
    'assets/about/20240420_170020.webp',
    // 'assets/about/20231103_093902.webp'
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
        font-size: 5rem; /* Big Apple-style numbers */
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

    this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="styles.css">
    <article class="project-card ${isGolden ? 'golden-project' : ''}">
      <div class="project-content">
        <div class="project-header">
           <h3 class="project-title">${val.title}</h3>
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
                <li><strong>Frontend:</strong> Angular v17+ / Electron</li>
                <li><strong>Backend:</strong> Java Spring Boot (BFF & API)</li>
                <li><strong>Services:</strong> Media Gateway, User Gateway</li>
                <li><strong>Messaging:</strong> Apache Kafka (Event-driven)</li>
                <li><strong>Storage:</strong> PostgreSQL / S3</li>
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
          </div>
        ` : ''}
      </div>
      <div class="project-image-wrapper">
         <img src="${val.imgUrl}" alt="${val.title}" loading="lazy">
         ${isGolden && !this._isArchitectureView ? `
            <div class="mini-player-overlay">
               <div class="play-icon"></div>
               <span class="stream-text">8K Stream Ready</span>
            </div>
         ` : ''}
      </div>
    </article>
    <style>
      :host {
        display: block;
      }
      .project-card {
        background-color: var(--bg-secondary);
        border-radius: 30px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255,255,255,0.05);
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
      }

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

      .source-icon {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }

      .project-image-wrapper {
        flex: 1;
        position: relative;
        overflow: hidden;
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
    this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="styles.css">
    <div class="prof-timeline-item">
      <div class="prof-timeline-marker"></div>
      <div class="prof-timeline-content">
          <span class="prof-date">${val.date}</span>
          <h3 class="prof-title">${val.title}</h3>
          <p class="prof-desc">${val.description}</p>
      </div>
    </div>
    <style>
      /* Ensure host behaves like a block to not break layout */
      :host {
        display: block;
      }
      /* Re-apply specific timeline styles if they don't cascade into Shadow DOM */
      .prof-timeline-item {
        position: relative;
        margin-bottom: 60px;
        /* Reset border since the parent container has the border-left */
      }
      .prof-timeline-marker {
        position: absolute;
        left: -46px; /* Match the global CSS */
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

// Define the custom elements
window.customElements.define("stats-span", StatsSpan);
window.customElements.define("project-article", ProjectArticle);
window.customElements.define("experience-article", ExperienceArticle);

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
    chatPill.addEventListener('click', () => {
      chatModal.classList.toggle('show');
    });

    chatClose.addEventListener('click', () => {
      chatModal.classList.remove('show');
    });

    const addMessage = (text, sender) => {
      const msg = document.createElement('div');
      msg.classList.add('chat-message', sender);
      msg.textContent = text;
      chatMessages.appendChild(msg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const handleSend = () => {
      const text = chatInput.value.trim();
      if (text) {
        addMessage(text, 'user');
        chatInput.value = '';
        setTimeout(() => {
          addMessage("I've received your message! I'll get back to you soon.", 'bot');
        }, 1000);
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
        addMessage(btn.textContent, 'user');

        setTimeout(() => {
          let response = "";
          switch(reply) {
            case 'projects': response = "Check out my work in the Projects section above! I've worked on many enterprise modernization tasks."; break;
            case 'stack': response = "I specialize in Angular, Java Spring Boot, and Architecting for Scale."; break;
            case 'resume': response = "You can find my CV download link in the About section of this page."; break;
            default: response = "Thanks for your interest! How else can I help?";
          }
          addMessage(response, 'bot');
        }, 800);
      });
    });
  }
})();
