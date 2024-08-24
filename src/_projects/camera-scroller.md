---
title: Camera Scroller
---
<game-canvas>
  <camera-scroller></camera-scroller>
</game-canvas>

<script type="module">
import { LitElement, css, html } from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js"

const baseStyles = css`
  :host {
    display: block;
  }

  *,*:after,*:before {
    box-sizing: border-box;
  }
`

class GameCanvas extends LitElement {
  static styles = [
    baseStyles,
    css`
      :host {
        position: relative;
        height: 320px;
        max-width: 320px;
        max-height: 320px;
        width: 320px;
        overflow: scroll;
        margin: auto;

        /** Hide page scrolling */
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; } /* IE and Edge */
        /* Chrome */
        :host::-webkit-scrollbar,
        :host::-webkit-scrollbar-button {
          display: none;
        }
      }

      :host::part(base) {
        height: 100%;
        width: 100%;
        position: relative;
      }

      :host::part(tile) {
        height: 16px;
        width: 16px;
        position: absolute;
        background-color: green;
        content-visibility: auto;
        color: white;
        font-size: 6px;
      }

      :host::part(tile--danger) {
        background-color: red;
      }
    `
  ]

  static properties = {
    tileSize: {type: Number},
    world: {type: Object, state: true, attribute: false},
    rows: {type: Number},
    columns: {type: Number},
    viewportHeight: {type: Number},
    viewportWidth: {type: Number},
  }

  constructor () {
    super()
    this.tileSize = 16
    this.rows = 500
    this.columns = 500
    this.viewportHeight = 320
    this.viewportWidth = 320
    this.world = new Map()
  }

  generateWorld () {
    this.world.clear()
    const world = this.world

    for (let i = 0; i < this.rows; i++) {
      const column = new Map()
      world.set(i, column)

      for (let j = 0; j < this.columns; j++) {
        world.get(i).set(j, [`${i}, ${j}`])
      }
    }

    this.world = world
  }

  connectedCallback () {
    super.connectedCallback()
    this.generateWorld()
  }

  renderTiles () {
    const ary = []
    const rows = this.viewportWidth / this.tileSize
    const columns = this.viewportHeight / this.tileSize
    console.log({ rows, columns })

    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < columns; y++) {
        ary.push(html`<div
          part="tile"
          style=${`
            left: ${x * this.tileSize}px;
            top: ${y * this.tileSize}px;
        `}></div>`)
      }
    }

    return ary
  }

  render () {
    return html`
      <div>
        <slot></slot>
        ${this.renderTiles()}
      </div>
    `
  }

}

window.customElements.define("game-canvas", GameCanvas)
</script>
