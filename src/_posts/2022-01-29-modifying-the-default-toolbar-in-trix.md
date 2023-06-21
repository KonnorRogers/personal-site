---
title: Modifying the default toolbar in Trix
categories: [javascript, webdev, rails, trix]
date: 2022-01-29 06:33:26 UTC
description: |
  The first thing you may be tempted to do when exploring with Trix is to change the default toolbar....
---

The first thing you may be tempted to do when exploring with Trix is to change the default toolbar. It's not obvious how to do this.

First instinct would say just change the innerHTML of all `<trix-toolbar>` elements.

This would work for most simple use cases, but what if you have a lazy-loaded turbo frame? Now you have to listen for when that frame gets loaded and then do some innerHTML replacement there.

It quickly turns into an ever-increasing ball of complexity. When searching through the Trix source code, I came across this function:

```js
Trix.config.toolbar.getDefaultHTML()
```

You can find the coffeescript source code here:

https://github.com/basecamp/trix/blob/main/src/trix/config/toolbar.coffee

On first iteration, one would think this would work if I did something like this:

```js
import Trix from "trix"

Trix.config.toolbar.getDefaultHTML = () => `Hi there!`
```

However, due to module execution and Trix registering itself and injecting the toolbar prior to the overriding of the function taking place in our script, this won't actually work.

Instead, we have to override the `getDefaultHTML()` function to affect all future instances of Trix, but we also have to deal with all current instances.

To do so, here's a pretty solid trimmed down way to handle this interaction:

```js
import Trix from 'trix';
Trix.config.toolbar.getDefaultHTML = toolbarDefaultHTML;

document.addEventListener('trix-initialize', updateToolbars, { once: true });

function updateToolbars(event) {
  const toolbars = document.querySelectorAll('trix-toolbar');
  const html = Trix.config.toolbar.getDefaultHTML();
  toolbars.forEach((toolbar) => (toolbar.innerHTML = html));
}

/**
 * @see https://github.com/basecamp/trix/blob/main/src/trix/config/toolbar.coffee
 */
function toolbarDefaultHTML() {
  const { lang } = Trix.config

  return `Default HTML goes here!`
}
```

To see the full demo checkout the Stackblitz to play around with it:

{% stackblitz js-fz9n5k view=preview %}

Or checkout the toolbar branch on this repository:

https://github.com/ParamagicDev/exploring-trix/tree/part01-changing-the-default-toolbar

That's it for part 1! In part 2 we'll look at how we can start styling Trix to make it look more like Github's markdown editor!
