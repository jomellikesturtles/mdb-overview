# Hyperlight Websites Architecture

These guidelines are derived from analyzing the `@hyperlight-websites` project and the principles of extreme web performance optimization.

## Core Principles

1.  **Static Site Generation (SSG)**
    *   **Concept:** HTML is generated at build-time, not run-time.
    *   **Implementation:** Use scripts (e.g., Python with Tornado templates) to merge data (JSON) with templates (`.tmpl`) to produce static `.html` files.
    *   **Benefit:** Zero server-side processing delay (TTFB) and high cacheability.

2.  **Aggressive Inlining (Single HTTP Request Goal)**
    *   **Concept:** Eliminate additional round-trips for critical resources.
    *   **Implementation:**
        *   **CSS:** Do not `<link>` stylesheets. Read the CSS file content and inject it directly into `<style>` tags in the HTML `<head>`.
        *   **JavaScript:** Do not `<script src="...">`. Inject minimal vanilla JS directly into `<script>` tags.
        *   **SVGs:** Inline SVG sprites directly into the `<body>` to allow immediate usage of icons via `<use xlink:href="#icon-name" />`.
    *   **Benefit:** The browser renders the page immediately after receiving the HTML response without waiting for secondary resource downloads.

3.  **Zero-Framework Frontend**
    *   **Concept:** Avoid the bloat of modern JS frameworks (React, Angular) and CSS frameworks (Bootstrap) for content-heavy sites.
    *   **Implementation:**
        *   Use semantic HTML5.
        *   Write bespoke, minimal CSS.
        *   Use "Vanilla" JavaScript only for essential interactivity (class toggling, basic DOM manipulation).
    *   **Benefit:** Drastically reduced bundle size and main-thread execution time.

4.  **Maximum Server-Side Compression**
    *   **Concept:** Reduce the transfer size of text assets to the absolute minimum.
    *   **Implementation:** Configure Nginx (or other servers) with:
        *   **Brotli:** Level 11 (max).
        *   **Gzip:** Level 9 (max) as a fallback.
    *   **Benefit:** Text-based assets (HTML/CSS/JS) often compress by 70-90%.

5.  **Optimized External Media**
    *   **Concept:** Heavy assets (images) should not block the initial load and should be optimized for the device.
    *   **Implementation:**
        *   Use an image CDN (e.g., imgix) for on-the-fly resizing and format conversion.
        *   Use `srcset` for responsive resolution switching.
        *   Use parameters like `auto=format,compress` and progressive JPEGs (`fm=pjpg`).

## Technical Stack Reference (from `@hyperlight-websites`)

*   **Build:** Python `tornado.template` for rendering.
*   **Server:** Nginx with `ngx_brotli`.
*   **Styles:** Custom `reset.css` and `styles.css`.
*   **Icons:** SVG Sprite system.
*   **Data:** JSON-based data storage (`data.json`).


- Hyperlight Websites Architecture Guidelines: 1. Static Generation (build-time HTML creation). 2. Aggressive Inlining: CSS, JavaScript, and SVG sprites are inlined directly into index.html to minimize HTTP requests. 3. Zero Frameworks: Use vanilla HTML, CSS, and minimal JS. 4. Server-Side Compression: Nginx configured for maximum Gzip (level 9) and Brotli (level 11) compression. 5. CDN for heavy assets: Images served via external optimized CDNs.
- Hyperlight Websites Principles: 1. Aggressive Inlining (CSS/JS/SVG in HTML) to minimize requests. 2. Zero Frameworks (Vanilla JS/CSS). 3. Static Site Generation (Build-time HTML). 4. Max Server Compression (Brotli L11/Gzip L9). 5. Offload media to optimized CDNs.
