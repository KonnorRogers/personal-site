---
title: Making Lit Components Morphable
categories: []
date: 2024-09-13
description: |
  A quick guide to how I made any element which inherits from LitElement "morphable"
published: true
---

As a follow-up to <a href="/posts/2024/designing-web-components-for-morphing">Designing Web Components for Morphing</a>, I finally cracked the nut of how to make it easy to keep properties that "sprout attributes" or "reflect" from being wiped out by morphs, or other means of targeted updates which will not create a new element.

Originally I tried to do something like this:

```js
class MorphableElement extends LitElement {
  constructor () {
    super()
    this.initialProperties = new Map()

    // Try to get the initial properties, but wait for any "subclasses" to finish their constructors.
    queueMicrotask(() => {
      // this.elementProperties is the final `Map` of both `static properties = {}` and `@property()` decorator.
      this.elementProperties.forEach((obj, prop) => {
        if (obj.reflect && this[prop] != null) {
          this.initialReflectedProperties.set(prop, this[prop]);
        }
      })
    })
  }

  willUpdate (changedProperties) {
    // Let willUpdate run first, just in case anything fixes the value first.
    super.willUpdate(changedProperties)

    this.initialReflectedProperties.forEach((value, prop) => {
      // If a prop changes to `null`, we assume this happens via an attribute changing to `null`.
      // We could do this in the `attributeChangedCallback`, but by doing it in `willUpdate` we get batched updates, and we dont need to read the "attribute" key. It is technically "wrong", but I *think* its fine.
      if (changedProperties.has(prop) && self[prop] == null) {
        self[prop] = value;
      }
    });
  }
}
```

There is a key problem with the code above. `queueMicrotask` runs too late to record the initial constructor value, and doing it in the `constructor` synchronously means any subclasses cannot set constructor properties. Or would have to manually update the `Map`.

The Lit discord recommended trying the `attributeChangedCallback`. This worked!

Here's what that code looks like:

```js
class MorphableElement extends LitElement {
  #hasRecordedInitialProperties
  constructor () {
    super()

    // Store the constructor value of all `static properties = {}`
    this.initialReflectedProperties = new Map();
    this.#hasRecordedInitialProperties = false
  }

  attributeChangedCallback(...args) {
    // Only run this the first time attributeChangedCallback is called. It runs just *after* all constructors, but before Lit has coerced any of our properties.
    if (!this.#hasRecordedInitialProperties) {
      this.constructor.elementProperties.forEach((obj, prop) => {
        if (obj.reflect && this[prop] != null) {
          this.initialReflectedProperties.set(prop, this[prop]);
        }
      })

      this.#hasRecordedInitialProperties = true
    }
    super.attributeChangedCallback(...args)
  }

  willUpdate(changedProperties) {
    // Make sure willUpdate runs first in case it does any coercion or fixing of null-ish values.
    super.willUpdate(changedProperties);

    this.initialReflectedProperties.forEach((value, prop) => {
      // If a prop changes to `null`, we assume this happens via an attribute changing to `null`.
      if (changedProperties.has(prop) && this[prop] == null) {
        this[prop] = value;
      }
    });
  }
}
```

The way this all works is anytime a property that reflects changes to `null` or `undefined`, then we will make that property the initial constructor value, and because it `reflects`, Lit will update the attribute for us.

The name I really like for this concept is "Durable Attributes", a term I first heard from Caleb Porzio when he introduced Flux in his 2024 Laracon talk.

Here's a playground that uses a mixin:

<https://lit.dev/playground/#gist=6cb12706367a7782261a891a76bb679a>

And I added this to my [konnors-lit-helpers package](https://github.com/KonnorRogers/konnors-lit-helpers/) as well!

## Final notes

There is *some* runtime overhead to this approach of storing initial values in a `Map`. I don't know how measurable the impact is, and there is *some* runtime overhead by iterating over the properties in the `willUpdate` callback, but as a whole, I think its okay and I don't think its deal breaking either.

## Other possibilities

If the runtime proves to be too impactful, I may look at moving the `initialReflectedProperties` to a one time operation that gets cached on the constructor, but I really don't foresee the memory issues being that impactful.


Anyways, happy morphing and I hope this was informative!!

Also, before you ask, I will be working on getting this code into both [Shoelace](https://shoelace.style) and [Web Awesome](https://webawesome.com) so that you can morph to your heart's content. As long as I don't hit any show stopping bugs of course.
