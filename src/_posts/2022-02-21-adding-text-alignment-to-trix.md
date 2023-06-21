---
title: Adding text alignment to Trix
categories: [rails, javascript, trix, webdev]
date: 2022-02-21 22:38:07 UTC
description: |
  A user had asked in Discord "Is there a way to add text alignment to Trix"  I thought this was a...
---

A user had asked in Discord "Is there a way to add text alignment to Trix"

I thought this was a pretty basic ask for a Rich Text Editor, but to my surprise, as far as I can tell, Trix has no nice way of handling this. textAttributes support "style" attributes, but those are for inline elements. blockAttributes are intended for wrappers, but dont support "style" attributes. As far as I can tell, only `tagName` is supported.

- blockAttributes https://github.com/basecamp/trix/blob/main/src/trix/config/block_attributes.coffee
- textAttributes https://github.com/basecamp/trix/blob/main/src/trix/config/text_attributes.coffee

With a few hours of exploration and googling down the drain, I saw someone mention using WebComponents to fill the gap in Trix. So, here's the result of me trying that approach!

The first step is to override the default Trix text editor's toolbar, which is covered in a previous part of the series.

https://dev.to/paramagicdev/modifying-the-default-toolbar-in-trix-411b

We will import Trix's default styles for simplicity here rather than introducing our own. To start, our javascript file should look something like this:

```js
// application.js
import Trix from 'trix';

// Import trix's css for simplicity.
import 'trix/dist/trix.css';

Trix.config.toolbar.getDefaultHTML = toolbarDefaultHTML;

document.addEventListener('trix-initialize', updateToolbars, { once: true });

function updateToolbars(event) {
  const toolbars = document.querySelectorAll('trix-toolbar');
  const html = Trix.config.toolbar.getDefaultHTML();
  toolbars.forEach((toolbar) => (toolbar.innerHTML = html));
}

function toolbarDefaultHTML() {
  const { lang } = Trix.config;
  // omitted for brevity.
  return ``
```

Alright, now that we have the boilerplate out of the way, the first step is to add icons to our default html for our toolbar. To do so, we can add HTML to our `toolbarDefaultHTML` like so:

```js
function toolbarDefaultHTML() {
  const { lang } = Trix.config;
  return `
  <div class="trix-button-row">
    <span class="trix-button-group trix-button-group--alignment-tools">
      <button type="button" class="trix-button trix-button--icon trix-button--icon-align-left" data-trix-attribute="alignLeft" title="Align Left" tabindex="-1">Align Left</button>

      <button type="button" class="trix-button trix-button--icon trix-button--icon-align-center" data-trix-attribute="alignCenter" title="Align Left" tabindex="-1">Align Center</button>

      <button type="button" class="trix-button trix-button--icon trix-button--icon-align-right" data-trix-attribute="alignRight" title="Align Right" tabindex="-1">Align Right</button>
    </span>
    <!-- Other default HTML below -->
  </div>`
```

Then, in your CSS, you can add the following (icons pulled from Bootstrap Icons):

```css
/* styles.css */
.trix-button--icon-align-left::before {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-text-left" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>');
}

.trix-button--icon-align-center::before {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-text-center" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>');
}
.trix-button--icon-align-right::before {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-text-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M6 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>');
}
```

Dont forget to import your styles!!

Finally, we get into how the magic will happen. Let's start by creating some basic custom elements. We'll be creating the following:

- `<align-left>`
- `<align-center>`
- `<align-right>`

Here is the JS I used to create the 3 elements:

```js
class BaseElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
}

function innerHTML(alignment) {
  return `
    <style>
      :host {
        text-align: ${alignment};
        width: 100%;
        display: block;
      }
    </style>

    <slot></slot>
  `;
}

export class AlignLeftElement extends BaseElement {
  constructor() {
    super();

    this.shadowRoot.innerHTML = innerHTML('left');
  }
}

export class AlignCenterElement extends BaseElement {
  constructor() {
    super();

    this.shadowRoot.innerHTML = innerHTML('center');
  }
}

export class AlignRightElement extends BaseElement {
  constructor() {
    super();

    this.shadowRoot.innerHTML = innerHTML('right');
  }
}

window.customElements.define('align-left', AlignLeftElement);
window.customElements.define('align-center', AlignCenterElement);
window.customElements.define('align-right', AlignRightElement);
```

With our newly minted custom elements, we can now add them to our Trix config for when our alignment buttons are triggered.

Here is how to add our alignment tags to Trix's config:

```js
Trix.config.toolbar.getDefaultHTML = toolbarDefaultHTML;

Trix.config.blockAttributes.alignLeft = {
  tagName: 'align-left',
  parse: false,
  nestable: false,
  exclusive: true,
};

Trix.config.blockAttributes.alignCenter = {
  tagName: 'align-center',
  parse: false,
  nestable: false,
  exclusive: true,
};

Trix.config.blockAttributes.alignRight = {
  tagName: 'align-right',
  parse: false,
  nestable: false,
  exclusive: true,
};

// Below omitted for brevity.
```

And thats it! You now have alignment baked into your Trix editor!!

A stackblitz repo can be found here:

https://stackblitz.com/edit/js-cb4oo7?file=index.js

And here is a preview video of how it looks / works!

https://twitter.com/RogersKonnor/status/1493387234455785478

Good luck and enjoy your Trix adventure with newly added alignment!

EDIT: You may also want to add these to the ActionText allowed tags.

https://github.com/rails/rails/blob/4328d0e16028a46bba79ab775e509a743ceaf18c/actiontext/app/helpers/action_text/content_helper.rb#L7-L10
