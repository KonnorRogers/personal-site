---
title: Maintain scroll position in Turbo without data-turbo-permanent
categories: turbo, rails, webdev, javascript
date: 2023-06-07 20:44:01 UTC
description: |
  Alright, this will be short and sweet for future me.  Maintaining scroll position is notoriously...
---

Alright, this will be short and sweet for future me.

Maintaining scroll position is notoriously painful.

Some articles like this have you add `data-turbo-permanent`: https://dev.to/mikerogers0/persist-scroll-positions-with-hotwire-turbo-1ihk

Why not `data-turbo-permanent`? Well, in our case we had a sidebar with a highlighted link for the current page, which means link clicks allowed for updating the highlighted current link. There were some workarounds we could have done, but decided not to.

There is also this GitHub issue which has a ton of workarounds:

https://github.com/hotwired/turbo/issues/37

There are some snippets in there that are pretty close to this. Here's what I used recently that worked well. Here's what I came up with that worked for me.

```js
import * as Turbo from '@hotwired/turbo'

if (!window.scrollPositions) {
  window.scrollPositions = {};
}

function preserveScroll () {
  document.querySelectorAll("[data-preserve-scroll]").forEach((element) => {
    scrollPositions[element.id] = element.scrollTop;
  })
}

function restoreScroll (event) {
  document.querySelectorAll("[data-preserve-scroll]").forEach((element) => {
    element.scrollTop = scrollPositions[element.id];
  }) 

  if (!event.detail.newBody) return
  // event.detail.newBody is the body element to be swapped in.
  // https://turbo.hotwired.dev/reference/events
  event.detail.newBody.querySelectorAll("[data-preserve-scroll]").forEach((element) => {
    element.scrollTop = scrollPositions[element.id];
  })
}

window.addEventListener("turbo:before-cache", preserveScroll)
window.addEventListener("turbo:before-render", restoreScroll)
window.addEventListener("turbo:render", restoreScroll)
```

There are 2 key things to note. Every element must have a unique ID, and every element must have a `data-preserve-scroll` on it. Like so:

```html
<nav id="sidebar" data-preserve-scroll>
  <!-- stuff -->
</nav>
```

Happy hunting!

EDIT: The one downside to this approach is I've noticed a brief flicker in Safari / Chrome. No flicker in FF. Perhaps a Turbo Transition, or using data-turbo-permanent could remove the flicker.

EDIT 2: Fixed the flicker. Article updated.