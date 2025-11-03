window.addEventListener("load", () => {});
class NewsArticle extends HTMLElement {
  static get observedAttributes() {
    return ["article"];
  }

  constructor() {
    super();
    this.attachShadow({
      mode: "open",
    });
  }

  set article(val) {
    this.shadowRoot.innerHTML = `
    <style>@import "styles.css"</style>
    <section class="grid-item">
      <header>
        <h3>${val.title}</h3>
      </header>
      <div class="grid-item-content content-centered">
        <div>
          <picture>
            <source srcset="${val.imgUrl} 800w">
            <img src="${val.imgUrl}" width="100%" height="100%" alt="title" />
          </picture>
          <p class="typography-item-description text-align-left">${val.description}</p>
        </div>
      </div>
    </section>

    `;
  }
  get article() {
    return this.getAttribute("article");
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    this.article = JSON.parse(newVal);
  }
}

class ProjectArticle extends HTMLElement {
  static get observedAttributes() {
    return ["article"];
  }

  constructor() {
    super();
    this.attachShadow({
      mode: "open",
    });
  }

  set article(val) {
    let theTemplate = `<style>@import "styles.css"</style>
    <div class="section-content" style="background-color: ${val.backgroundColor}; display:flex">
      
      <div class="grid-item-content content-centered" style="width:40%">
        
        <span>
    `;
    for (let i = 0; i < val.techStacks.length; i++) {
      theTemplate = theTemplate + `<img id="home" width="1" height="1">`;
    }
    theTemplate += `</span>
        <header>
          <h3>${val.title}</h3>
        </header>
        <div>
        <p class="typography-item-description text-align-left">${val.description}</p>
        </div>
        </div>
      <div style="width:60%">
        <picture>
          <source srcset="${val.imgUrl} 800w">
          <img src="${val.imgUrl}" width="100%" height="100%" alt="title" />
        </picture>
      </div>
    </div>`;
    this.shadowRoot.innerHTML = theTemplate;
  }
  get article() {
    return this.getAttribute("article");
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    this.article = JSON.parse(newVal);
  }
}

class StatsSpan extends HTMLElement {
  static get observedAttributes() {
    return ["article"];
  }

  constructor() {
    super();
    this.attachShadow({
      mode: "open",
    });
  }

  set article(val) {
    this.shadowRoot.innerHTML = `<style>@import "styles.css"</style>

    <div class="flex-1 flex gap-4 items-center justify-center xl:justify-start"
      style="justify-content: flex-start; gap: 1rem; display: flex">
      <div class="flex items-center gap-4" style="opacity: 1;">
        <div class="flex items-center gap-4"
          style="filter: blur(0px); opacity: 1; display:flex; gap: 1rem; align-items:center">
          <span class="text-4xl xl:text-6xl font-extrabold">${val.statsNumber}</span>
          <p class="max-w-[100px] leading-snug text-white/80">${val.statsLabel}</p>
        </div>
      </div>
    </div>`;
  }
  get article() {
    return this.getAttribute("article");
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    this.article = JSON.parse(newVal);
  }
}

window.customElements.define("stats-span", StatsSpan);
window.customElements.define("card-article", NewsArticle);
window.customElements.define("project-article", ProjectArticle);
// // window.customElements.define("card-article", NewsArticle);
