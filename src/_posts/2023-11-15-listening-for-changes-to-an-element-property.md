---
title: Listening for Changes To An Element Property
categories: []
date: 2023-11-15
description: |
  Listening for Changes To An Element Property
published: true
---

Recently I decided to see if I could figure out when a `.value` call was made to an
`<input>` element. Essentially, create a way to "observe" when a property changes on a
native element.

After far too much searching, and way too many StackOverflow posts, even asking ChatGPT just
out of curiosity, everyone recommended using `MutationObserver`, but this doesn't account for
properties that don't "reflect" to an attribute.

I can't even find the StackOverflow post I referenced, but finally, I made it to this point:

```js
const input = document.querySelector("input");

// Get the original "descriptor"
const originalDescriptor = Object.getOwnPropertyDescriptor(
    input.constructor.prototype,
    'value'
);

// Redefine "value" to be a getter / setter.
Object.defineProperty (input, "value", {
  get () {
    // Call the "get" of the "originalDescriptor"
    return originalDescriptor.get.call(input);
  },
  set (val) {
    this.dispatchEvent(new Event("input", { bubbles: true }))

    // Call the "setter" of the "originalDescriptor" so that the `<input>` element updates properly.
    originalDescriptor.set.call(input, val);
  }
})
```

<https://codepen.io/paramagicdev/pen/MWLEQRZ>

What is the above code doing? Anytime `input.value = ""` is called, it will send
an `"input"` event just like you would expect if you were typing into the element.

After sharing the codepen above, someone else linked me the following article forum post I originally
did not discover when searching.

<https://forums.mozillazine.org/viewtopic.php?p=13616993#p13616993>

Use cases? Maybe none. I mostly wanted to see if I could. If you find some use-cases, let me know!
I'd love to hear them!
