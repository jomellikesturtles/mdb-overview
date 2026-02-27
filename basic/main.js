window.addEventListener("load", () => {
  document.body.getElementsByTagName("news-article")[1].article = {
    title: "dynamic value",
  };
  let element = document.createElement("news-article");
  element.article = {
    title: "dynamic element2",
  };
  document.body.appendChild(element);
});

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
    <style>
    @import "style.css";
    </style>
    <h2 class="gg">${val.title}</h2>
    `;
  }
  get article() {
    return this.attributes("article");
  }
  attributeChangedCallback(attributeName, oldVal, newVal) {
    this.article = JSON.parse(newVal);
  }
}
window.customElements.define("news-article", NewsArticle);
