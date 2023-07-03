// window.addEventListener("load", () => {
//   document.body.getElementsByTagName("card-article")[1].article = {
//     title: "dynamic value",
//   };
//   let element = document.createElement("card-article");
//   element.article = { title: "dynamic element" };
//   document.body.appendChild(element);
// });
// class NewsArticle extends HTMLElement {
//   static get observedAttributes() {
//     return ["article"];
//   }
//   constructor() {
//     super();
//     this.attachShadow({ mode: "open" });
//   }
//   set article(val) {
//     console.log("val", val);
//     this.shadowRoot.innerHTML = `
// ${val.title}
// `;
//   }
//   get article() {
//     return this.getAttribute("article");
//   }
//   attributeChangedCallback(attrName, oldVal, newVal) {
//     this.article = JSON.parse(newVal);
//   }
// }
// window.customElements.define("card-article", NewsArticle);

// window.addEventListener("load", () => {
//   document.body.getElementsByTagName("card-article")[1].article = {
//     title: "dynamici value",
//   };

//   let element = document.createElement("card-article");
//   element.article = {
//     title: "dynamic element",
//   };
//   // document.body.appendChild(element);
// });

// add call here, because onload did not work for me
// addCustomElement();
window.addEventListener("load", () => {
  if (navigator.userAgent.indexOf("Win") != -1) {
    document.getElementById("notWindows10").style.setProperty('display', 'none');
  }
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
    @import "styles.css"
        
    </style>
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

window.customElements.define("card-article", NewsArticle);
// // window.customElements.define("card-article", NewsArticle);
