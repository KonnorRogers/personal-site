import "index.css"

import * as Turbo from "@hotwired/turbo"

import "./src/external_icon.js"
import "./src/layout.js"

// Shoelace
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import "@shoelace-style/shoelace/dist/components/alert/alert.js"
import "@shoelace-style/shoelace/dist/components/button/button.js"
import "@shoelace-style/shoelace/dist/components/card/card.js"
import "@shoelace-style/shoelace/dist/components/divider/divider.js"
import "@shoelace-style/shoelace/dist/components/drawer/drawer.js"
import "@shoelace-style/shoelace/dist/components/dropdown/dropdown.js"
import "@shoelace-style/shoelace/dist/components/icon/icon.js"
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js"
import "@shoelace-style/shoelace/dist/components/menu/menu.js"
import "@shoelace-style/shoelace/dist/components/menu-item/menu-item.js"
import "@shoelace-style/shoelace/dist/components/menu-label/menu-label.js"
import "@shoelace-style/shoelace/dist/components/visually-hidden/visually-hidden.js"
setBasePath("/shoelace-assets")

// Clipboard copy
import '@github/clipboard-copy-element'

// Import all JavaScript & CSS files from src/_components
import components from "bridgetownComponents/**/*.{js,jsx,js.rb,css}"
import controllers from "./controllers/**/*.{js,js.rb}"

import { Application } from "@hotwired/stimulus"

window.Stimulus = Application.start()

Object.entries(controllers).forEach(([filename, controller]) => {
  if (filename.includes("_controller.") || filename.includes("-controller.")) {
    const identifier = filename
      .replace("./controllers", "")
      .replace("controllers/", "")
      .replace(/[_-]controller..*$/, "")
      .replace("_", "-")
      .replace("/", "--")

    Stimulus.register(identifier, controller.default)
  }
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

function enhanceCodeBlocks () {
  document.querySelectorAll(":is(.language-bash, .language-shell, .language-zsh, .language-sh, .language-console).highlighter-rouge pre.highlight > code").forEach((el) => {
    el.innerHTML = el.innerHTML.split("\n").map((str) => {
      return str.replace(/^(\w)/, "<span class='highlight-command-line-start'>$</span>$1")
    }).join("\n")
  })
}

document.addEventListener("turbo:load", enhanceCodeBlocks)
enhanceCodeBlocks()

window.visualViewport.addEventListener("focusin", viewportHandler)
window.visualViewport.addEventListener("resize", viewportHandler);
window.visualViewport.addEventListener("scroll", viewportHandler);
