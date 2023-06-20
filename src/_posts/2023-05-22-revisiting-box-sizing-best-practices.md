---
title: Revisiting box-sizing best practices
categories: ["webdev", "css", "webcomponents"]
date: 2023-05-22 04:50:13 UTC
description: |
  We've all googled "best way to set box-sizing: border-box;" and come across this fun article from CSS...---

We've all googled "best way to set `box-sizing: border-box;`" and come across this fun article from CSS Tricks about setting box sizing.

https://css-tricks.com/box-sizing/

If you haven't read it, let me spare you some time.

Here's the "recommended" approach due to increased flexibility.

https://css-tricks.com/box-sizing/#aa-universal-box-sizing-with-inheritance

```css
html {
  box-sizing: border-box;
}
*, *:before, *:after {
  box-sizing: inherit;
}
```

While this works if all of your elements are in the light DOM, tonight I discovered a fun bug plaguing my site.

If you have an element that is "slotted" into a custom element's shadow DOM, it will "inherit" the `box-sizing` of the slot element.

Example:

```html
<script type="module">
  class MyElement extends HTMLElement {
    connectedCallback () {
      this.attachShadow({ mode: "open" })

      // These slots are automatically 
      // "box-sizing: content-box;" 
      // so this default slot causes all its children to have
      // the same box-sizing properties...
      this.shadowRoot.innerHTML = `<slot></slot>`
    }
  }
  window.customElements.define("my-custom-element", MyElement)
</script>

<style>
  html {
    box-sizing: border-box;
  }

  *, *:after, *:before {
    box-sizing: inherit;
  }
</style>

<my-custom-element>
  <div>My box sizing is "content-box"</div>
</my-custom-element>

<div>My box sizing is "border-box"</div>
```

If you'd prefer, I also made a CodePen reproducing this issue.

https://codepen.io/paramagicdev/pen/abRPJjB?editors=1111

The "fix" is to use the "universal" box-sizing selector.

```css
*,*:after,*:before {
  box-sizing: border-box;
}
```

Now, I don't know if the inherited box-sizing is a bug, but it sure does feel like a bug. But, at least there is a workaround. I tested in Firefox, Chrome, Safari, and Edge and got the same result in all 4. Modifying the `box-sizing` of the parent slot element does indeed fix it like you would expect.