---
title: Designing Web Components For Morphing
categories: []
date: 2024-04-17
description: |
  Designing Web Components For Morphing
published: true
---

A common problem I've come to find with Web Components is they don't tend to play nicely with morphing libraries.

Here's a very simple example:

I write the following HTML:

```html
<sl-button>I'm a button</sl-button>
```

When the component registers, it adds the following attributes: `variant` and `size`

```
<sl-button variant="default" size="medium">I'm a button</sl-button>
```

So your server and your client have "mismatching attributes".

If you were to run a "morphing" operation, the server is in charge, and it would "wipe out" the added attributes.

The problem is that in this case, Shoelace will not re-add the attributes after the morphing operation.

But why?

Well the problem is that these "properties" are set in the `constructor() {}` function  of the component.

Here's a reduced example of what Shoelace is doing:

```js
class SlButton extends LitElement {
  static properties = {
    variant: {reflect: true},
    size: {reflect: true}
  }

  constructor () {
    super()
    this.variant = "default"
    this.size = "medium"
  }
}
```

Without getting too deep into details, what's happening here is on initial node creation, the `size` and `variant` attributes
are set on "host" element.

However, when the "morph" operation runs, `this.variant` and `this.size` take the value of their attribute, which if they're removed ends up being `null`.

If you're not familiar with the Lit API, what's basically happening here is that we monitor the component for attribute changes, and based on the value of the attribute, we update the internal "property" to have the same value.

There's a few ways to handle this mismatch.

1. We could have a check for when the attributes change to `null` and manually reset it for the user.
1. We could design the components to work with no attributes or with the attributes defined. This results in having a lot of duplicate CSS properties and may be an issue if you have a large set of components. This gets into a bigger issue of "sprouting" attributes which we really won't cover here.

So in this article we'll look at how we can use some Lit callbacks to set a default property for a user.

```js
class SlButton extends LitElement {
  static properties = {
    variant: {reflect: true},
    size: {reflect: true}
  }

  constructor () {
    super()
    this.variant = "default"
    this.size = "medium"
  }

  willUpdate (changedProperties) {
    if (changedProperties.has("variant") && this.variant == null) {
      this.variant = "default"
    }

    if (changedProperties.has("size") && this.size == null) {
      this.size = "medium"
    }
  }
}
```

We could also go a different route and use getters / setters.

```js
class SlButton extends LitElement {
  static properties = {
    variant: {reflect: true},
    size: {reflect: true}
  }

  constructor () {
    super()
    this._variant = "default"
    this._size = "medium"
  }

  set variant (val) {
    if (val == null) {
      val = "default"
    }
    this._variant = val
  }

  get variant () {
    return this._variant
  }

  set size (val) {
    if (val == null) {
      val = "medium"
    }
    this._size = val
  }

  get size () {
    return this._size
  }
}
```

The difference between the getters / setters approach and the `willUpdate` approach is that
`willUpdate` is "batched" and asynchronous whereas the getters / setters approach is synchronous and can potentially be called many times.

It's out of the scope of this article, but there's definitely an abstraction you could make here to make a migration
for a component that expects certain properties to always be defined.

The key thing to note about morphing is your `constructor()` and `connectedCallback()` functions will never re-run.

Also note, the above is only when attributes are fully removed, a user can still break the expectation if they do something like this:

```html
<sl-button size="" variant=""></sl-button>
```

In which case you could change the `val == null` checks to `!val`. But that can perhaps be a little overeager and may cause some unintended behavior.

Anyways, I hope this primer helped you understand a little bit more about morphing and how it can modify elements in place and can break your component in unexpected ways if you don't design for it, and some of the ways to mitigate it if you "reflect" properties to attributes.
