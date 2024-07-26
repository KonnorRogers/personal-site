---
title: Running Lit SSR in Web Awesome
categories: []
date: 2024-07-24
description: |
  A document of things I hit while working with Lit SSR in the Web Awesome codebase
published: true
---

## Purpose

To document my journey of working with Lit SSR in the Web Awesome codebase.

## Versions of Lit packages:

- `@lit-labs/ssr@3.2.2`
- `lit@3.1.4`

## Make sure to "unbundle" your dist files

If you "bundle" your library with ESBuild, Rollup, Vite, etc. then make sure you create a `dist` directory that has the "unbundled" files.

For example, in Shoelace, you may notice we have `/cdn` and `/dist` entrypoints.

`/cdn` contains inlined dependencies so they're usable in the browser and fully bundled. This directory will be incompatible with Lit SSR. (Although you can render a Lit Element with SSR from `/dist`, and load the client component for hydration from `/cdn` (in fact this is what we do in our docs!).

`/dist` will do code splitting and bundling of our files, but will not "inline" our dependencies from node_modules.

The "unbundled" dependencies are required to get Lit SSR working. You cannot pass inlined dependencies to the Lit SSR module. They need to be "bare module specifiers" so that Node can resolve them properly and get the proper "export condition".

The process is roughly:

Lit SSRs the declarative shadow dom using modules `/dist`
-> client connects
-> loads all client components from `/cdn`

## Dependencies are tough

Notably, in Web Awesome we have 2 incompatible libraries with Lit SSR.

One we own: `@shoelace-style/localize`. This has been updated to now check if its running on the server or client and will only register its MutationObserver if the MutationObserver class exists. If we don't do this, the server will error out because MutationObserver doesn't exist on the server. And because its being run as a `sideEffect`, you need to do some extra work to shim the MutationObserver before the side effect runs.

One we don't own: `qr-creator`. We still haven't decided what to do about this one. Cory did a lot of testing around this and it worked with things like Emojis and other weird edge cases. So for now we exclude it from SSR.

## `addEventListener` in the constructor

It's a common pattern to add event listeners in the `constructor` of you Lit component, like this:

```js
import { LitElement } from "lit"

export class MyElement extends LitElement {
  constructor () {
    super()
    this.addEventListener("click", this.doSomething)
  }
}
```

However, if you're using the Lit SSR module, it will not "shim" or "stub" or "mock" the addEventListener call, so you
need to gate it with a `isServer` call.

Like so:

```js
import { LitElement, isServer } from "lit"
class MyElement extends LitElement {
  constructor () {
    super()

    if (!isServer) {
      this.addEventListener("click", this.doStuff) // Works with SSR.
    }
  }
}
```

## Other non-shimmed DOM pieces

- constructor assignments need to be gated by `isServer` if they use things like `MutationObserver`, `ResizeObserver`, `InteractionObserver`, etc.
- `slotchange` events attached in shadow root never fire.

```js
class MyElement extends LitElement {
  handleSlotChange (e) {
    console.log("slot change!")
  }
  render () {
    return html`
      <!-- When SSRing, this will never fire. -->
      <slot @slotchange=${this.handleSlotChange}></slot>
    `
  }
}
```

Workaround:

call any slot change event handlers in `firstUpdated` callback. They do need to be idempotent in case the element is CSR-ed only.

Something like the following:

```js
export default class MyElement extends LitElement {
  constructor () {
    super()

    // This was the most reliable way i found to see if the element was SSRed.
    this.didSSR = Boolean(this.shadowRoot);
  }

  protected firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties)
    if (this.didSSR) {
      this.shadowRoot?.querySelectorAll("slot").forEach((slotElement) => {
        slotElement.dispatchEvent(new Event("slotchange", { bubbles: true, composed: false, cancelable: false }))
      })
    }
  }
}
```

This may get "fixed" in a future version of Lit Hydration.

<https://github.com/lit/lit/discussions/4697>

Other things to look out for that we set in constructors:

```js
MutationObserver
ResizeObserver
InteractionObserver
```

I was tempted to add shims for these that just no-op, but just decided its easier for debugging just to have `isServer` gates.

## Hydration Errors

This one took me a little bit to hit, but when I slammed into it, it was like a brick wall.

Here's some of the errors:

- `Uncaught (in promise) Error: unexpected longer than expected iterable`
- `Error: Hydration value mismatch: Unexpected TemplateResult rendered to part`

So what caused these errors?

Lets look at the code that caused: `Uncaught (in promise) Error: unexpected longer than expected iterable`

```js
import { LitElement, html, classMap } from "lit"
import { map, range } from "lit/directives.js"

export class Carousel extends LitElement {
  render () {
    let pagesCount = isServer ? 0 : this.getPageCount(); // Queries the DOM to find the number of `<wa-carousel-item>` elements.
    let currentPage = isServer ? 0 : this.getCurrentPage() // Queries the DOM to find the current page. `<wa-carousel-item active>`

    return html`
      <div part="pagination" role="tablist" class="carousel__pagination" aria-controls="scroll-container">
        ${map(range(pagesCount), index => {
          return html``
        })}
      </div>
    `
  }
}
```

So what is causing the hydration error?

Well, when the Lit Element Hydration script runs, it expects the client to match the server. When it doesn't match the server HTML, it reports a  "hydration mismatch".

In reality, there's 6 slides when the element attempts to "client render", but the server thought there was 0 slides, causing hydration to fail.

What I tried next was to just no-op the `range(map(pagesCount))` on the server.

Something like the following:

```js
render () {
  return html`
    isServer ? html`` : html`
        <div part="pagination" role="tablist" class="carousel__pagination" aria-controls="scroll-container">
          ${map(range(pagesCount), index => {
            return html``
         })}
      </div>
  `
}
```

Doing so resulted in `Error: Hydration value mismatch: Unexpected TemplateResult rendered to part`

Now, I'm not 100% exactly whats going on, but I think my intuition is right in that Lit expects initial hydration render and the server render to match. So how did I work around this?

Well, the correct answer would be to add a property a user could manually set to get the proper current page and the proper number of slides. But I was curious if I could hijack the client rendering after the initial hydration. Here's what I did to make that happen:

```ts
class Carousel extends LitElement {
  render () {
    // These are for the server
    let pagesCount = 0
    let currentPage = 0

    // These get called after `firstUpdated` on the client to force a new client rendering and avoiding hydration mismatch.
    // The "correct" solution is probably to allow user to pass the number of pages and the currentPage.
    // https://lit.dev/docs/components/lifecycle/#hasupdated
    if (this.hasUpdated) {
      pagesCount = this.getPageCount();
      currentPage = this.getCurrentPage();
    }

    return html`
      <!-- you know the rest -->
    `
  }
}
```

How did I know this was the issue? Well...thats the thing. I kind of guessed on this one. But for other components, I found it really hard to track down hydration mismatches. So I needed some way to debug the expected vs actual markup.

## Building a debugger for Hydration Mismatch issues

My initial problem with debugging hydration mismatch issues was that first: I didn't know what elements were causing the hydration issues. On a component page, there may be ~10+ examples using the component, and only certain conditions trigger the mismatch.

I did some digging and found the `@lit-labs/ssr-client` and found the `update` function is where the hydration errors were originating.

<https://github.com/lit/lit/blob/ce81de9e8adf2c5c7eece635a54d76decb64ce1d/packages/labs/ssr-client/src/lit-element-hydrate-support.ts#L97>

So I ended up patching the `update` function since this is where the "hydration" happens.

Here's what my component looks like:

```js
export default class WebAwesomeElement extends LitElement {
  constructor() {
    super();
    // This was the most reliable way i found to see if the element was SSRed.
    this.didSSR = Boolean(this.shadowRoot);
  }

  update(changedProperties) {
    try {
      super.update(changedProperties);
    } catch (e) {
      if (this.didSSR && !this.hasUpdated) {
        // Emit a hydration error so we can catch it and do cool shit.
        const event = new Event('lit-hydration-error', { bubbles: true, composed: true, cancelable: false });
        event.error = e;
        this.dispatchEvent(event);
      }
      throw e;
    }
  }
}
```

By dispatching an error before we throw, it means we get "context" of what element caused the issue by calling `event.target`.

Here's a rough implementation of the diff script I made:

```js
import { diffLines } from 'https://cdn.jsdelivr.net/npm/diff@5.2.0/+esm';
import { getDiffableHTML } from 'https://cdn.jsdelivr.net/npm/@open-wc/semantic-dom-diff@0.20.1/get-diffable-html.js/+esm';

  function handleLitHydrationError(e) {
    const element = e.target;
    const scratch = document.createElement('div');
    const node = element.cloneNode(true);
    scratch.append(node);
    document.body.append(scratch);
    customElements.upgrade(node);
    node.updateComplete.then(() => {
      const clientHTML = getDiffableHTML(innerHTML);
      const serverHTML = getDiffableHTML(element.shadowRoot?.innerHTML);

      const diffDebugger = document.createElement('div');
      diffDebugger.className = 'diff-debugger';

      diffDebugger.innerHTML = `
      <button class="diff-dialog-toggle">
        Show Hydration Mismatch
      </button>
      <wa-dialog class="diff-dialog" with-header light-dismiss>
        <div class="diff-grid">
          <div>
            <div>Server</div>
            <pre class="diff-server"><code></code></pre>
          </div>
          <div>
            <div>Client</div>
            <pre class="diff-client"><code></code></pre>
          </div>
          <div>
            <div>Diff</div>
            <pre class="diff-viewer"><code></code></pre>
          </div>
        </div>
      </wa-dialog>
    `;

      wrap(element, diffDebugger);

      diffDebugger.querySelector('.diff-server > code').textContent = serverHTML;
      diffDebugger.querySelector('.diff-client > code').textContent = clientHTML;
      const diffViewer = diffDebugger.querySelector('.diff-viewer > code');
      diffViewer.innerHTML = '';
      diffViewer.appendChild(
        createDiff({
          serverHTML,
          clientHTML
        })
      );
    });
  }

  function createDiff({ serverHTML, clientHTML }) {
    const diff = diffLines(serverHTML, clientHTML, {
      ignoreWhitespace: false,
      newLineIsToken: true
    });
    const fragment = document.createDocumentFragment();
    for (var i = 0; i < diff.length; i++) {
      if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
        var swap = diff[i];
        diff[i] = diff[i + 1];
        diff[i + 1] = swap;
      }

      var node;
      if (diff[i].removed) {
        node = document.createElement('del');
        node.appendChild(document.createTextNode(diff[i].value));
      } else if (diff[i].added) {
        node = document.createElement('ins');
        node.appendChild(document.createTextNode(diff[i].value));
      } else {
        node = document.createTextNode(diff[i].value);
      }
      fragment.appendChild(node);
    }

    return fragment;
  }
  document.addEventListener('lit-hydration-error', handleLitHydrationError);
```

So now whenever a `lit-hydration-error` happens, it will wrap the component in a div, and add a red border, and show a button for hydration mismatch. This can cause some issues, so whenever I turn this into a package, it will use anchored-positioning and add an attribute to the host element instead so it doesn't interfere with existing styles / slots.

I'm already working on moving this to a proper library. But just in case you're impatient.

## Style tags with expressions do not work without using `unsafeHTML`

Example:

```js
class MyElement extends LitElement {
  render () {
    return html`
      <!-- Errors -->
      <style>
        :host {
          background-color: ${this.backgroundColor};
        }
      </style>

      <!-- Errors -->
      ${staticHTML`
        <style>
          :host {
            background-color: ${this.backgroundColor};
          }
        </style>
      `}

      <!-- Works -->
      ${unsafeHTML(`
        <style>
          :host {
            background-color: ${this.backgroundColor};
          }
        </style>
      `)}
    `
  }
}
```

This may get fixed in a future version.

<https://github.com/lit/lit/issues/4696>

## Interactive elements in the shadow DOM need their state checked on `firstUpdated`

This one isn't obvious, but if you have "state checks" or event listeners that happen in your host such as `"focusin"` or `"input"` that update, you may need to check the "state" of the internal interactive element on `firstUpdated`. The reason is these elements may have been interacted with before your JavaScript loaded, so your component may have stale data.

Example:

```js
class MyCheckbox extends HTMLElement {
  render () {
    if (this.didSSR && this.hasUpdated) {
      this.checked = this.shadowRoot.querySelector("input[type='checkbox']").checked
    }

    return html`<input type="checkbox" .checked=${live(this.checked)}>`
  }
}
```

## Getting directionality

One annoyance with SSR is directionality. In Web Awesome, we rely a lot on `this.matches(":dir(rtl)")` to find the current directionality of the client. Unfortunately. this won't work on the server. Example:

```js
render () {
  const isRTL = this.matches(":dir(rtl)")

  return html`
    ${when(isRtl,
      () => html`RTL`,
      () => html`LTR`
    )}
  `
}
```

Unfortunately, without a browser, this isn't really possible.

The current way I work around around it is by checking the `this.dir` property prior to `hasUpdated`. We have a `this.dir` property we add to every Web Awesome element in a base class.

Its not perfect, but its better than nothing.

```js
render () {
  // hasUpdated means we're on the client, otherwise we're on the server. I found direct `isServer` calls will cause hydration mismatch errors.
  const isRtl = this.hasUpdated ? this.matches(':dir(rtl)') : this.dir === "rtl";

  return html`
    ${when(isRtl,
      () => html`RTL`,
      () => html`LTR`
    )}
  `
}
```

Depending on your SSR module, this may be one of those things you can pass along easily through `appData` / `context`.

## `this.style` is not usable on the server.

Access to `style` object for modifying CSS  will result in errors.

So you can't do like `this.style.color = "red"`

## Testing

### Getting SSR working in Web Test Runner

The first part to getting SSR working was loading in the proper plugins for [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/)

The main plugin needed for SSR is `@lit-labs/testing/web-test-runner-ssr-plugin.js` (you can add it by doing `npm install @lit-labs/testing`) which is a plugin that will run your component in Node and return the expected HTML and inject it into the browser for you. This is how the `ssrFixture` export from `@lit-labs/testing/fixtures.js` works. Without the plugin, the `ssrFixture` function will not work. We'll cover the `ssrFixture` later. Right now lets focus on getting the configuration all set.

Additionally, I also wanted a way to load all components for the server module and on the client (there's some load order issues here we're trying to avoid) so we map over all components in Web Awesome and create 2 arrays we can access on the client to import the respective components we need.

One array was the "unbundled" components, and the other array was the "bundled" components, like you would consume with a CDN with imports of node_modules inlined.

Here's what the config ended up looking like:

```js
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { getAllComponents } from './scripts/shared.js';
import { globbySync } from 'globby';
import { litSsrPlugin } from '@lit-labs/testing/web-test-runner-ssr-plugin.js';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { readFileSync } from 'fs';

// Get a list of all Web Awesome component imports for the test runner
const metadata = JSON.parse(readFileSync('./dist/custom-elements.json'), 'utf8');
const serverComponents = []
const componentImports = getAllComponents(metadata).map(component => {
  const name = component.tagName.replace(/^wa-/, '');

  // "qr-code" is the only component currently not supported by SSR.
  if (name !== "qr-code") {
    serverComponents.push(`/unbundled-dist/components/${name}/${name}.js`)
  }

  return `/dist/components/${name}/${name}.js`;
});

export default {
  rootDir: '.',
  files: 'src/**/*.test.ts', // "default" group
  concurrentBrowsers: 3,
  nodeResolve: {
    exportConditions: ['production', 'default']
  },
  testFramework: {
    config: {
      timeout: 3000,
      retries: 1,
    }
  },
  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'es2020'
    }),
    litSsrPlugin() // Make sure to have this. Its what does the hard work of SSR by creating a custom WTR plugin to call Node.
  ],
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox', concurrency: 1 }),
    playwrightLauncher({ product: 'webkit' })
  ],
  testRunnerHtml: testFramework => `
    <!DOCTYPE html>
    <html lang="en-US">
      <head>
        <base href="/dist">
        <link rel="stylesheet" href="dist/themes/default.css">
        <script>window.process = {env: { NODE_ENV: "production" }}</script>
        <script>
          // These allow us in our fixtures to call window.serverComponents when calling Lit SSR module to know what components to load.
          window.serverComponents = [
            ${serverComponents.map((str) => `"${str}"`).join(",\n")}
          ]

          // These allow us in our fixtures to call `await Promise.allSettled(window.clientComponents.map((str) => import(str)))` to load all of our client components.
          window.clientComponents = [
            ${componentImports.map((str) => `"${str}"`).join(",\n")}
          ]
        </script>
        <script type="module" src="${testFramework}"></script>
      </head>
      <body>
      </body>
    </html>
  `,
};
```


### Fixture load ordering for hydration

I noticed hydration was tricky to get working as expected. After a lot of tinkering (probably a couple days), I found the most surefire way to make sure the element gets SSRed and then properly hydrated is by calling `ssrFixture` from `@lit-labs/testing/fixtures.js`, and then after the fixture is done, call your component definitions.

I noticed Lit SSR was very particular about load order of components. It really wanted component loading to happen _AFTER_ the fixture was called.

This was the most surefire way I could get Lit hydration to work as expected. If i loaded any client components prior to calling `ssrFixture`, the component would be pre-loaded with all the client side HTML, so it had to wait. I _think_ this has something to do with `ssrFixture` loading the `@lit-labs/ssr-client/lit-element-hydrate-support.js` module, but can't confirm.

<https://github.com/lit/lit/blob/ce81de9e8adf2c5c7eece635a54d76decb64ce1d/packages/labs/testing/src/fixtures.ts#L7>

Anyway, here's the best way I found to get SSR rendered, client hydrated components working.

```js
import { html } from "lit"
import { ssrFixture } from "@lit-labs/testing/fixtures.js"
it("Should SSR then client hydrate", async () => {
  await ssrFixture(html`<wa-button></wa-button>`, {
    modules: window.serverComponents,
    base: import.meta.url // Without this, i was getting errors in Webkit. <https://github.com/lit/lit/issues/4067>
  })
  await Promise.allSettled(window.clientComponents.map((str) => import(str)))
})
```


While converting the Web Awesome codebase, I found a bug with Lit SSR where if you use the `ssrFixture` function from the `@lit-labs/testing` library
then it will not hydrate multiple elements. It will only hydrate the first hydrate-able element it finds.

For example:

```js
ssrFixture(html`<form>
  <wa-input></wa-input> <-- Only this will hydrate -->
  <wa-button></wa-button> <-- This will not hydrate -->
</form>`)
```

But thanks to Augustine from the Lit team, I learned how to "force" a hydration!

```js
document.querySelectorAll("[defer-hydration]").forEach((el) => {
  el.removeAttribute("defer-hydration")
})
```

Thankfully, this bug will most likely be fixed in a future version of `@lit-labs/testing`.

<https://github.com/lit/lit/issues/4709>

### Creating our own fixture

Given some of the quirks above, wanting to always load all components like the current Web Awesome test suite does, I felt a fixture wrapper was appropriate. Here's what those ended up looking like. They largely take the practices from above and wrap it neatly. It also adds a side effect for Lit's fixture cleanup so that we don't need to add `beforeEach` / `afterEach` blocks to every test file to clean up Lit fixtures.

```ts
/**
 * This is the intended way of using fixtures since it has some nice ways of catching hydration errors.
 * These fixtures will also auto-load all of our components.
 */

import { cleanupFixtures, ssrFixture as LitSSRFixture } from "@lit-labs/testing/fixtures.js"
import { fixture } from "@open-wc/testing"
import type { LitElement, TemplateResult } from "lit"

declare global {
  interface Window {
    clientComponents: string[];
    serverComponents: string[];
  }
}

/**
 * Loads up a fixture and loads all client components
 */
export async function clientFixture<T extends HTMLElement = HTMLElement>(template: TemplateResult) {
  // Load all component definitions "customElements.define()"
  await Promise.allSettled(window.clientComponents.map((str) => import(str)))
  return fixture<T>(template)
}

// Make it easy to register describe blocks and tell what type of test failed.
clientFixture.type = "Client Only"


/**
 * Loads up a fixture with SSR, using all unbundled modules, then when it finishes, calls hydration scripts, and then when hydration completes, returns the element.
 */
export async function ssrFixture<T extends HTMLElement = HTMLElement>(template: TemplateResult) {
  const hydratedElement = await LitSSRFixture<T>(template, {
    base: import.meta.url,
    modules: window.serverComponents,
    hydrate: true
  })

  // Load all component definitions "customElements.define()"
  await Promise.allSettled(window.clientComponents.map((str) => import(str)))

  // This can be removed when this is fixed: https://github.com/lit/lit/issues/4709
  // This forces every element to "hydrate" and then wait for an update to complete (hydration)
  await Promise.allSettled([...hydratedElement.querySelectorAll<LitElement>("[defer-hydration]")].map((el) => {
    el.removeAttribute("defer-hydration")
    return el.updateComplete
  }))

  return hydratedElement
}

ssrFixture.type = "SSR"

/**
 * This registers the fixture cleanup as a side effect
 */
try {
  // We load Mocha globally, so this just makes it so every test file doesn't need to call beforeEach and afterEach to cleanup fixtures.
  if (typeof beforeEach !== "undefined") {
    beforeEach(() => {
      cleanupFixtures()
    });
  }
  if (typeof afterEach !== "undefined") {
    afterEach(() => {
      cleanupFixtures()
    });
  }
} catch (error) {
  // We really don't care if there's an error in these.
}
```

And after all of this build up, here's an example test file from Web Awesome reduced for simplicity.

```ts
import { clientFixture, ssrFixture } from "../../internals/test/fixture.js"

describe("<wa-button>", () => {
+  for (const fixture of [clientFixture, ssrFixture]) {
+   describe("rendered via '${fixture.type}'", () => {
      it("Should have a button in its shadow root", async () => {
        const button = await fixture(html`<wa-button></wa-button>`)

        expect(button.shadowRoot.querySelector("button")).to.not.be.null
      })
+   })
+ }
})
```

This allows us to keep our existing test suite, add a small wrapper for SSR -> client hydrated and client only components, and provide a quick way to tell at a glance which test type is failing.

With all the pieces in place, now its time to through and actually update the whole test suite and see what fails!

With that, those were the big pieces of getting Lit SSR working in Web Awesome. There's some other technical bits omitted of unbundled dist files, hooking up with 11ty SSR, getting the lit-element-hydrate-support module loading at the right time, but all of that was pretty straight forward so I omitted them from here.

I also set out to build a library for catching Lit hydration errors in the browser to get easy to read diffs, so we'll see where that goes!

## Things I felt missing from SSR

Sometimes it would be really nice to read the DOM tree on the server. I'm sure there's a way to pull in an HTML parser and read the final HTML, but it feels out of scope for Lit rendering since it seems focused solely on rendering individual components, and not the page as a whole. This may be something for a custom renderer or something? I don't know. We have a number of components that rely on `querySelector` and would be nice to not need to set manual properties for users.

Anyways, this was my experience hope it was helpful!


