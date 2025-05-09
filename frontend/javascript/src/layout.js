import {LitElement, html, css} from "lit"

class KrLayout extends LitElement {
  static styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      min-height: var(--height, 100vh);
      max-height: 100%;
      --height: 100dvh;

      --menu-width: auto;
      --main-width: 1fr;
      --aside-width: auto;

      /** This is a best guess. We'll attempt to calculate this with a resize observer. **/
      --header-height: 48px;
    }

    :host([variant="documentation"]) {
      --menu-width: 250px;
      --main-width: 105ch;
      --aside-width: auto;
    }

    :host([variant="documentation"])::part(body) {
      justify-content: center;
    }

    *, *:after, *:before {
      box-sizing: border-box;;
    }

    :host::part(base) {
      display: grid;
      /** Header, Main, Footer **/
      grid-template-rows: minmax(0, auto) minmax(0, 1fr) minmax(0, auto);
      min-height: var(--height);
    }

    :host::part(header) {
      max-width: 100%;
      position: sticky;
      background: white;
      z-index: 1;
    }

    :is(.header, .aside, .menu, .footer) ::slotted(*) {
      height: 100%;
    }

    :is(.aside, .menu) ::slotted(*) {
      min-width: 100%;
      width: 100%;
      max-width: 100%;
    }

    :host::part(header) {
      top: 0px;
    }

    :host::part(body) {
      display: grid;
      /** Menu, Main, Aside **/
      grid-template-columns: minmax(0, var(--menu-width)) minmax(0, var(--main-width)) minmax(0, var(--aside-width));
      grid-template-rows: minmax(0, 1fr);
    }

    :host::part(menu) {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
    }

    :host::part(aside) {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
    }

    :host::part(aside),
    :host::part(menu) {
      max-height: calc(var(--height) - var(--header-height));
      overflow: auto;
      position: sticky;
      top: var(--header-height);
      overscroll-behavior: contain;
    }

    :host::part(main) {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      /* main-header, main, main-footer */
      grid-template-rows: minmax(0, auto) minmax(0, 1fr) minmax(0, auto);
    }

    :host::part(footer) {}

    sl-visually-hidden:not(:focus-within) {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      clip: rect(0 0 0 0) !important;
      clip-path: inset(50%) !important;
      border: none !important;
      overflow: hidden !important;
      white-space: nowrap !important;
      padding: 0 !important;
    }

    .skip-links {
      position: absolute;
      top: 0;
      left: 0;
      height: calc(var(--header-height, 48px) - 2px);
      width: 100vw;
      z-index: 4;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      place-items: center;
      text-align: center;
    }
  `

  static properties = {
    main_id: { attribute: "main-id", reflect: true }
  }

  constructor () {
    super()
    this.main_id = "main"
  }

  connectedCallback () {
    super.connectedCallback?.()

    this.resizeObserver = new ResizeObserver((entries) => {
      function toNearest (nearest, num) {
        return nearest * Math.ceil(num / nearest)
      }
      for (const entry of entries) {
        if (entry.borderBoxSize) {
          let blockSize = entry.borderBoxSize.reduce((accum, borderBox) => accum + borderBox.blockSize, 0)
          blockSize = toNearest(0.25, blockSize)
          console.log(blockSize)
          this.style.setProperty("--header-height", `${blockSize}px`)
        }
      }
    });

    setTimeout(() => {
      this.header = this.shadowRoot.querySelector("[part~='header']")
      this.resizeObserver.observe(this.header)
    })
  }

  disconnectedCallback () {
    super.disconnectedCallback?.()
    this.resizeObserver.unobserve(this.header);
  }

  render () {
    return html`
      <sl-visually-hidden class="skip-links" part="skip-links">
        <slot name="skip-links">
          <a href=${`#${this.main_id}`} part="skip-link">
            ${this.skipToMain || "Skip to main"}
          </a>
        </slot>
      </sl-visually-hidden>

      <div class="base" part="base">
        <div class="header" part="header">
          <slot name="header"></slot>
        </div>

        <div class="body" part="body">
          <div class="menu" part="menu">
            <slot name="menu"></slot>
          </div>

          <div class="main" part="main">
            <div class="main-header" part="main-header">
              <slot name="main-header"></slot>
            </div>

            <div class="main-content" part="main-content"><slot></slot></div>

            <div class="main-footer" part="main-footer">
              <slot name="main-footer"></slot>
            </div>
          </div>

          <div class="aside" part="aside">
            <slot name="aside"></slot>
          </div>
        </div>

        <div class="footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </div>

      <div part="dialog" class="dialog">
        <slot name="dialog"></slot>
      </div>
    `
  }
}

window.customElements.define("kr-layout", KrLayout)

