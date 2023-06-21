---
title: How to keep a persistent class on a LitElement
categories: [webcomponents, lit, webdev, javascript]
date: 2023-04-08 02:56:40 UTC
description: |
  When working with lit, sometimes you want the host element to have a persistent class name. A good...
---

When working with lit, sometimes you want the host element to have a persistent class name. A good example is if I were using Shoelace I'd want my elements to look like this:

```html
<sl-button class="sl-button"></sl-button>
```

That way if a user registers the button under another namespace, they can still target all instances with `.sl-button {}` in their CSS, or by using querySelectors. There are a number of use-cases, but lets forget about the "why", and focus on the how.

Here is how I found the most effective way to keep a persistent class on a LitElement.

```js
import { LitElement } from "lit"
class MyElement extends LitElement {
  static properties = {
    class: { reflect: true }
  }

  connectedCallback () {
    super.connectedCallback()
    this.classList.add("my-element")
  }

  willUpdate (changedProperties) {
    if (changedProperties.has("class")) {
      this.classList.add("my-element");
    }
  }
}
```

Or for you folks out there using decorators:

```ts
import { LitElement } from "lit"
import { property } from "lit/decorators.js"

class MyElement extends LitElement {
  @property({ reflect: true }) class

  connectedCallback () {
    super.connectedCallback()
    this.classList.add("my-element")
  }

  willUpdate (changedProperties) {
    if (changedProperties.has("class")) {
      this.classList.add("my-element");
    }
  }
}
```

I'm sure there's another way to do this, but this has been the way that's worked for me!
