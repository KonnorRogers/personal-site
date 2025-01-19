---
title: Why do we still bundle?
categories: []
date: 2025-01-18
description: |
  A short post about why bundling is an effective tool when used properly.
published: true
---

This is largely a retelling of an old Twitter post of mine from 2021.

Original link here:

<https://web.archive.org/web/20210812212340/https://twitter.com/RogersKonnor/status/1425923073962823693>

If you would like to skip to the original thread you can do so here: [Original Thread](#original-thread)

If you'd prefer to read a slightly revamped version of the original thread, you can do so below:

## Waterfall requests

`import` and `@import()` in JS / CSS respectively are fantastic ways to tank your performance. They both introduce something called "waterfall requests". Basically, when the browser parser for JS or CSS gets to these statements, it stops evaluations of the current file, and "fetches" the files over the network, and will only continue "evaluating" the file once the imports have finished fetching + evaluating. Even with HTTP/2 multiplexing of assets, its still very important to limit waterfalls because no matter how fast your network is, you're still stopping JS / CSS evaluation + execution until those files are done evaluating. And the problem only gets worse as you have deeper and deeper levels of imports.

Bundlers let you request all of your "waterfalls" up front, usually by "inlining" the pieces and "scope hoisting" to share bits and pieces of "shared" files.

Lets take a quick look at how waterfalls work.

In JavaScript for example, I can have multiple layers of `import` statements.

```js
// foo.js
import "./bar.js"

// bar.js
import "./baz.js"

// baz.js
console.log("Hello World.")
```

When a browser sees these, it has to work its way through the chain to finally import "baz.js".

So it needs to do the following:

`request "foo.js" -> request "bar.js" -> request "baz.js"`

This is the basics of a "waterfall request"

Essentially, what needs to happen is the browser parses your JS file, finds what it needs to fetch, then goes through the same cycle until it finally has fetched all JS files it needs.

This can be mitigated if you know your dependencies up front and can use a `<link rel="modulepreload">` so you can "eagerly" fetch these modules.

Surely this is just a JavaScript problem right? Wrong.

This is also a CSS problem. Rather than retell the above story with CSS syntax instead, I'll link to this fantastic article about the performance impact of `@import()`

<https://calendar.perfplanet.com/2024/the-curious-performance-case-of-css-import/>

Key points:

> @import, by virtue of how it works, is slow. It’s really, really bad for Start Render performance. This is because we’re actively creating more roundtrips on the Critical Path

> [...] remove the following from your stylesheets:
> `@import url("imported.css");`
> And convert it into a link element:
> `<link rel="stylesheet" href="imported.css">`

> If you really can’t remove @import, use this:
> ```html
> <link rel="preload" href="imported.css" as="style">
> ```

Bundlers remove this work for you. They'll scan your JavaScript and CSS imports, and "inline" them where it makes sense, or split to another module if its large enough. (This is largely tweaked by bundler settings)

## But what about importmaps?!

Importmaps are cool. I like them as a spec. But they have holes.

By using import maps, you lock yourself into 1 version of a dependency. This may break your build if you have 2 dependencies relying on 2 different versions of the same package.

NPM dependency graphs can circumvent this problem by having "isolated dependency graphs", where each dependency can have its own independent dependencies. This is very different from something like Bundler which requires all dependencies to resolve to a singular gem.

This isn't to say importmaps are bad, but they are quite limited in what they can do when compared to something like an NPM + frontend bundle combo.

## Treeshaking

Ugh. This one hurts to write. Because Treeshaking is largely an implementation detail of your bundler. You can't fully rely on it because each bundler has different heuristics for what is "treeshakeable", but it is worth noting that bundlers _can_ optimize your bundle sizes and eliminate "dead code paths". Again, while it is something they can do, its not always reliable, so this point largely exists for posterity.


## Final thoughts

Bundling is not a silver bullet, the same way importmaps are not a silver bullet. Frontend performance tuning is a tricky game and requires understanding your requirements. Bundling doesn't automatically make your site fast, and importmaps dont automatically make your site slow. But its important to know options exists and they each come with their own set of tradeoffs.


## Original Thread

Note, this tweet by DHH and my reply was made back in August, 2021. Rails has made some solid steps forward with jsbundling / cssbundling, but the community is still very split on what they use for frontend asset management, which causes an interesting divide among Rails devs. And Rails engines are still in a very weird state for providing frontend assets. Just look at this problem of duplicated dependencies from Hotwire Spark: <https://github.com/hotwired/spark/issues/26>

In particular with importmaps v1 -> v2, Rails importmaps became significantly worse in terms of compatibility with NPM due to "vendoring" or "downloading" the packages by default, but not downloading all necessary files.

The PR to fix it has languished for ~1year now with no resolution in sight.

<https://github.com/rails/importmap-rails>

Anyways, here's the thread chain:

> DHH:
> "So despite what a leap forward ES6 everywhere, ubiquitous HTTP2, and import maps combine to present, there's clearly still a class of apps that'll need Webpack. Not everyone can take these things out yet, but those who can will be mightily pleased." https://world.hey.com/dhh/modern-web-apps-without-javascript-bundling-or-transpiling-a20f2755

### My Reply

> 1.) A bundler lets you fetch all your dependencies upfront. HTTP/2 multiplexing is good, but if you have deep module dependencies, you can get caught in what's called a "waterfall" request . This waterfall request state can be mitigated by things like module prefetching and various other optimizations but can still be tricky. This is why tools like @snowpackjs and Vite by @youyuxi still bundle for production despite being native ESM environments in development.

> 2.) By using import maps, you lock yourself into 1 version of a dependency. This may break your build if you have 2 dependencies relying on 2 different versions of the same package. This is why NPM dependency graphs work the way they do.

> 3.) using import maps is great for things you own but can quickly get tricky as you end up needing to import dependencies not meant for ESM and still use the old CJS or UMD formats and having to build these dependencies yourself.

> 4.) Tree shaking. Bundlers are able to trim down the size of what you ship by eliminating "dead code" and they have really great static analyzers to optimize bundle sizes.

> 5.) embracing import maps is not a bad thing. But generally, I view import maps as something I use for NPM dependencies to help with bare module resolutions. Yes you can do it, but it's not a silver bullet.

> All this to say, many of you may be perfectly happy with import maps and that's fine. But it is important to know why bundlers exist. And Webpack is no longer the only player in this space . We have Vite, Snowpack, ESBuild, and I'm sure many others I'm missing.

> Perhaps instead of focusing on the constant churn of asset management, Rails can instead provide a better story for hooking up your own asset manager. Rails Engines are especially difficult right now to hook up with asset managers and I'd love to see some improvement in that area

> I know Rails is "convention over configuration", but everyone's frontend needs can be quite different and app specific, so perhaps this is a case where some configuration isn't a bad thing because ripping out existing solutions can get quite tricky (see Sprockets)

> And as a final note on HTTP/2, yes Heroku does not support it. Heroku is still on HTTP/1.1, but if you serve your assets from an HTTP/2+ CDN you can still reap the benefits of connection multiplexing for assets.

Editor's Note: Heroku does have beta support for HTTP/2 now. <https://blog.heroku.com/heroku-http2-public-beta>
