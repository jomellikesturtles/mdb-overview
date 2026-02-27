window.addEventListener("load", () => {
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
  }

  set article(val) {
    this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="styles.css">
    <article class="project-card">
      <div class="project-content">
        <h3 class="project-title">${val.title}</h3>
        <p class="project-desc">${val.description}</p>
        <div class="tech-stack">
          ${val.techStacks.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
      </div>
      <div class="project-image-wrapper">
         <img src="${val.imgUrl}" alt="${val.title}" loading="lazy">
      </div>
    </article>
    <style>
      .project-card {
        background-color: var(--bg-secondary);
        border-radius: 30px;
        overflow: hidden;
        display: flex;
        flex-direction: column; /* Mobile first */
        transition: transform 0.3s ease;
      }
      .project-card:hover {
        transform: scale(1.02);
      }
      
      @media (min-width: 800px) {
        .project-card {
           flex-direction: row;
           align-items: center;
           min-height: 400px;
        }
      }

      .project-content {
        padding: 40px;
        flex: 1;
        z-index: 2;
      }

      .project-title {
        font-size: 32px;
        margin-bottom: 16px;
        color: var(--text-primary);
      }

      .project-desc {
        font-size: 18px;
        color: var(--text-secondary);
        line-height: 1.4;
        margin-bottom: 24px;
      }

      .tech-stack {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .tech-tag {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        border: 1px solid #424245;
        padding: 4px 10px;
        border-radius: 20px;
        color: var(--text-secondary);
      }

      .project-image-wrapper {
        flex: 1;
        height: 100%;
        min-height: 300px;
        position: relative;
        overflow: hidden;
      }

      .project-image-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: absolute;
        top: 0; left: 0;
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