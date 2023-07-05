---
title: What is Declarative Shadow DOM?
date: 2023-07-05 01:15:41 -0400
categories: dsd shadowdom webcomponents
description: A cursory glance at Declarative Shadow DOM (DSD) and why it matters.
---

**TLDR**: Declarative Shadow DOM is a way to render a
[ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot) without
needing any JavaScript.

## A Shadow What?

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
  <!-- This special template tag is all that Declarative Shadow DOM is. -->
  <template shadowrootmode="open">
    <span>Hello World!</span>
  </template>
</hello-world>
```

That's right. All Declarative Shadow DOM does is add a special `<template>` attribute
handled natively by the browser that can render shadow roots without JavaScript.

<%= render Alert.new(type: "primary") do %>
  Previously, the syntax was `<template shadowroot="open">` but the `shadowroot` attribute
  was deprecated due to not allowing streaming of the `<template>` tag.

  <https://github.com/mdn/browser-compat-data/pull/18855>
<% end %>

## Why is this important?

Declarative Shadow DOM lets us do something not previously possible with Web Components.
It lets us "Server Side Render" (SSR) our web components. What is "Server Side Rendering"?

Server Side Rendering is simply rendering the full HTML markup for a page prior to JavaScript loading.

For example, previously the browser would need to wait for your web component to load before it could render
the ShadowRoot markup of your web component. With DSD, we can send over the ShadowRoot markup prior to the browser downloading,
parsing, and executing the custom web component's JavaScript.

What's exciting is that lets you create custom experiences and scoped styling without ever needing to use JavaScript.
You could theoretically create HTML / CSS web components without ever needing to write JavaScript.

With that out of the way and some terms defined, lets dive a little deeper because it's very rare your
components will be this simple.

## But how do I add styling?

Styling is super simple. Simply add a `<style>` tag.

```html
<hello-world>
  <template shadowrootmode="open">
    <style>
      span {
        font-size: 28px;
        color: green;
      }

      <span>Hello World!</span>
    </style>
  </template>
</hello-world>
```

Yes, this will add additional HTML Elements to your markup and "bloat" the DOM.
The good news is the browser is able to cache these `<style>` tags and efficiently
store references to them. So while there is additional markup overhead, the browser is
very efficient with the extra markup.

(I can't find a reference at this time, but I promise I remember reading the above somewhere)

## Okay, and what about user content?

Adding user content is adding by allowing users to "slot" in their elements.

Here is the canonical button component example:

```html
<my-button>
  <!-- Shadow DOM -->
  <template shadowrootmode="open">
    <button>
      <slot></slot>
    <button>
  </template>

  <!-- Slotted Content / Light DOM -->
  Click Me!
</my-button>


<!-- Rendered HTML -->

<my-button>
  #shadowRoot
    <button>
      <slot></slot>
    <button>

  Click Me!
</my-button>
```

## But what if I want to dynamically change something in the ShadowRoot?

Alright, this is a tough challenge. Now you're looking at integrating a dynamic templating language
which the browser does not currently have.

Here's a pseudo-template of what I would like to write:

```nunjucks
<template shadowrootmode="open">
  <button type={{ attributes.type }}>
    <slot></slot>
  </button>
</template>
```

So then when we go to render the button, we can always have the proper attributes.
Right now in my explorations this requires either using a shared Templating language between
backend and frontend, or JavaScript to "hydrate" the component with the proper attributes.

I did an exploration of what shared templating with Liquid could look like and here is
what that looked like allowing all of the parent attributes to be passed to the child:

```liquid
<template shadowrootmode="open">
  <style>
    button {
      background-color: rebeccapurple;
      color: white;
      padding: 1rem;
    }

    button[appearance="primary"] {
      background-color: green;
    }
  </style>

  <button
    <!-- Pass all parent attributes to the child -->
    {%- for attribute in attributes %}
      {{ attribute[0] }}="{{ attribute[1] }}"
    {%- endfor %}
  >
    <slot></slot>
  </button>
</template>
```

There is some additional work being specified here around adding template syntax to browsers.
Right now there are 2 interwoven proposals.

- [Template Instantiation](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Template-Instantiation.md) - Allow dynamic templating in shadow roots following a Mustache like syntax.
- [Declarative Custom Elements](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Declarative-Custom-Elements-Strawman.md) - Allow for defining web components using declarative syntax and template instantiation

## In conclusion

Declarative Shadow DOM gives us a way to write element ShadowRoots without needing JavaScript.
While Declarative Shadow DOM is not **specific** to web components, it does open the door for pre-rendered (Server Side Rendered)
web components.

## Further Reading

For a more technical and in-depth guide to declarative shadow dom, check out this article
from the Chrome Developer team.

<https://developer.chrome.com/en/articles/declarative-shadow-dom/#building-a-declarative-shadow-root>
