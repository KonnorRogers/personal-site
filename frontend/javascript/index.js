import "../styles/index.css"
import "./external_icon.js"

import * as Turbo from "@hotwired/turbo"
import "./layout.js"

// Shoelace
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import("@shoelace-style/shoelace/dist/components/alert/alert.js");
import("@shoelace-style/shoelace/dist/components/button/button.js");
import("@shoelace-style/shoelace/dist/components/card/card.js");
import("@shoelace-style/shoelace/dist/components/divider/divider.js");
import("@shoelace-style/shoelace/dist/components/drawer/drawer.js");
import("@shoelace-style/shoelace/dist/components/dropdown/dropdown.js");
import("@shoelace-style/shoelace/dist/components/icon/icon.js");
import("@shoelace-style/shoelace/dist/components/icon-button/icon-button.js");
import("@shoelace-style/shoelace/dist/components/menu/menu.js");
import("@shoelace-style/shoelace/dist/components/menu-item/menu-item.js");
import("@shoelace-style/shoelace/dist/components/menu-label/menu-label.js");
import("@shoelace-style/shoelace/dist/components/visually-hidden/visually-hidden.js");

setBasePath("/shoelace-assets")

// Clipboard copy
import('@github/clipboard-copy-element')

// Import all JavaScript & CSS files from src/_components
import components from "bridgetownComponents/**/*.{js,jsx,js.rb,css}"
import controllers from "./controllers/**/*.{js,js.rb}"

import("@hotwired/stimulus").then((module) => {
  const Application = module.Application

  window.Stimulus = Application.start()

  Object.entries(controllers).forEach(([filename, controller]) => {
    if (filename.includes("_controller.") || filename.includes("-controller.")) {
      console.log(filename)
      const identifier = filename
        .replace("./controllers", "")
        .replace("controllers/", "")
        .replace(/[_-]controller..*$/, "")
        .replace("_", "-")
        .replace("/", "--")

      Stimulus.register(identifier, controller.default)
    }
  })
})


import("@konnorr/bridgetown-quick-search/ninja-keys.js").then((module) => {
  const { BridgetownNinjaKeys } = module

  /** @type {import("konnors-ninja-keys").INinjaAction[]} */
  const staticData = [
    {
      id: "theme-light",
      icon: "<sl-icon name='sun'></sl-icon>",
      title: "Light Mode",
      section: "Theme",
      keywords: "theme",
      handler () {
        window.applyTheme("light");
      }
    },
    {
      id: "theme-dark",
      icon: "<sl-icon name='moon'></sl-icon>",
      title: "Dark Mode",
      section: "Theme",
      keywords: "theme",
      handler () {
        window.applyTheme("dark");
      }
    },
    {
      id: "theme-system",
      icon: "<sl-icon name='display'></sl-icon>",
      title: "System",
      section: "Theme",
      keywords: "theme",
      handler () {
        window.applyTheme("system");
      }
    },
  ]

  ;(class extends BridgetownNinjaKeys {
    constructor (...args) {
      super(...args)
      this.staticData = staticData
    }

    createData() {
      this.results = this.showResultsForQuery(this._search).reverse()

      this.results.forEach((result) => {
        result.icon = `<sl-icon name="link-45deg"></sl-icon>`
      })

      return [
        ...this.staticData,
        ...this.results,
      ]
    }

    transformResult (result) {
      let { id, title, categories, url, content, collection } = result

      if (url.endsWith(".json")) {
        return
      }

      return {
        id,
        title,
        section: collection.name,
        href: url,
        // content
      }

    }

    open () {
      this.scrollTop = window.scrollY;
      document.body.classList.add('fixed-body');
      // Scroll the wrapper, rather than setting an offset
      // via `top` or `transform`.
      document.body.scroll(0, this.scrollTop);

      this.nonModals.forEach((el) => {
        el.setAttribute("inert", "")
      })
      super.open()
    }

    close () {
      document.body.classList.remove('fixed-body');
      window.scrollTo(0, this.scrollTop);
      super.close()
      this.nonModals.forEach((el) => el.removeAttribute("inert"))
    }

    get nonModals () {
      return [...document.body.children].filter((el) => el.localName !== "bridgetown-ninja-keys")
    }
  }).define("bridgetown-ninja-keys")
})


let pendingUpdate = false;

function viewportHandler(event) {
  if (pendingUpdate) return;
  pendingUpdate = true;

  requestAnimationFrame(() => {
    pendingUpdate = false;
    const viewport = event.target;
    document.documentElement.style.setProperty("--viewport-height", viewport.height + "px")
  });
}

window.visualViewport.addEventListener("focusin", viewportHandler)
window.visualViewport.addEventListener("resize", viewportHandler);
window.visualViewport.addEventListener("scroll", viewportHandler);
