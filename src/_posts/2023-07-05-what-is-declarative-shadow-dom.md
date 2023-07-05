---
title: What is Declarative Shadow DOM?
date: 2023-07-05 01:15:41 -0400
categories: dsd shadowdom webcomponents
description: A cursory glance at Declarative Shadow DOM (DSD) and why it matters.
---

**TLDR**: Declarative Shadow DOM is a way to render a
[ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot) without
needing any JavaScript.

## A Shadow What

A ShadowRoot. Perhaps you've heard of a ShadowRoot referred to as a "Shadow DOM" in
the context of web components.

Prior to the introduction of Declarative Shadow DOM,
there was no way to create a ShadowRoot without using JavaScript.

Here's how we would create a ShadowRoot using JavaScript in the context of a Web Component.

```js
class HelloWorld extends HTMLElement {
  connectedCallback () {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<span>Hello World!</span>`
  }
}

window.customElements.define("hello-world", HelloWorld)
```

Which if you were to render an element called `<hello-world>` in your HTML the browser
would render something that looks like this:

```html
<hello-world>
  #shadowRoot
  <span>Hello World!</span>
</hello-world>
```

## Shadow DOM without JS

Now that we learned how we could created a basic `"Hello World!"` implementation in
JavaScript inside of a ShadowRoot, let's look at how we could do it Declarative Shadow DOM.

```html
<hello-world>
  <template shadowrootmode="open">
    <span>Hello World!</span>
  </template>
</hello-world>
```

<%= render Alert.new(type: "primary") do %>
  Previously, the syntax was `<template shadowroot="open">` but the `shadowroot` attribute
  was deprecated due to not allowing streaming of template.

  Read more here: []()
<% end %>
