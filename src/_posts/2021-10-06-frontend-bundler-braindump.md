---
title: Frontend Bundler Braindump
categories: ["javascript", "webdev", "bundlers", "webpack"]
date: 2021-10-06 17:33:18 UTC
description: |
  What is this?      The following is a collection of terminology and definitions of various...---

<h2 id="what-is-this">
  <a href="#what-is-this">
    What is this?
  </a>
</h2>

The following is a collection of terminology and definitions of various bundling terms I've come across over the last year. This is meant to be an introduction to what a frontend bundler is, what is does, why they exist, and some of the common terminology used by bundlers. This will
not target any specific bundler (webpack, rollup, vite, snowpack, etc) but rather, this will provide some context around some of the things these bundlers do and how they work. This is intended to be a reference to my future self who will inevitably forget most of this.

<h2 id="what-will-be-covered">
  <a href="what-will-be-covered">
    What will be covered?
  </a>
</h2>

- [Why do bundlers exist?](#why-bundlers)
- [Why do we have different import syntax?](#why-imports)
- [What is a bare module import?](#what-is-a-bare-module-import)
- [What is an entrypoint?](#what-is-an-entrypoint)
- [What is a loader?](#what-is-a-loader)
- [What is a chunk? (code splitting)](#what-is-a-chunk)
- [What is hashing? (fingerprinting, digest, etc)](#what-is-hashing)
- [What is treeshaking?](#what-is-treeshaking)
- [What are side-effects?](#what-are-side-effects)

<h2 id="why-bundlers">
  <a href="#why-bundlers">
    Why do bundlers exist?
  </a>
</h2>

Bundlers exist to solve a couple different problems, and they've evolved as the problems they solve has evolved.

Initially bundlers existed to solve 3 problems (mainly)

- Concatenation
- Minification
- Compression (kind of)

<h3 id="concatenation">
  <a href="#concatenation">
    Concatenation
  </a>
</h3>

Concatenation is the process of combining multiple files into a singular file. This is important because prior to HTTP/2, the network cost to import asset files was significantly higher, meaning it took longer. This meant it was super important to ship as few asset files to the end user as possible to increase performance.

<h3 id="minification">
  <a href="#minification">
    Minification
  </a>
</h3>

Minification is the process of taking a file, and making it as small as possible. IE: shortening variable names to shorthand, shortening function calls, eliminating whitespace, etc.

<h3 id="compression">
  <a href="#compression">
    Compression
  </a>
</h3>

As an addition to minification there is also the idea of "compression". Compression is the process of taking a file, and reducing its overall size by making it smaller by using some kind of [Compression Algorithm](https://en.wikipedia.org/wiki/Data_compression).

Compression is sometimes referred to as "zipping", "gzipping". What compression does under the hood is beyond the scope of this article, but its just another technique to reduce file size (note that a "gzipped" file can be uncompressed by a browser quite easily and the code inside the file will be the same when uncompressed unlike with
minification)

<h3 id="additional-problems">
  <a href="#additional-problems">
    Additional Problems
  </a>
</h3>

As time went on, developers wanted more from their bundlers. They wanted to use files that "transpile" to JavaScript. Developers wanted bundling, but not 1 massive file. They wanted to "chunk" or "code split" their files. With the advent of HTTP/2 connection multiplexing, shipping
multiple smaller files actually became more advantageous.

Now, bundlers solve these additional problems:

- sourcemaps
- transpilation
- code splitting (chunking)
- tree shaking (elimination of dead code)

Since the above topics are fairly in-depth, we will cover what they are below. But first, lets circle back to "concatenation", or in other terms, how to share code between files with JavaScript.

<h2 id="why-imports">
  <a href="#why-imports">
    Why do we have different import syntax?
  </a>
</h2>

If you've been around JavaScript, you've no doubt seen something like
the following:

```js
require("module")
module.exports = {}
```

and then you may have also seen:

```js
import "module"
export const x = {}
```

and been wondering, what the heck is the difference?

Well the simple answer is Example 1 uses "CommonJS" syntax (also known as CJS)

Example 2 uses "ES Module" syntax (also know as ESM)

There is also a third module definition called UMD (universal module definition) that leverages CommonJS.

To put it plainly, CommonJS is NodeJS's original importing syntax. ES Modules are part of the ES Module spec which is the spec defined by the browser for importing JavaScript files. UMD came out before ES Module syntax existed which attempted to guess the environment it was loaded in
and provide appropriate file sharing.

Essentially UMD was intended to bridge the CommonJS syntax for use in the browser. It's important to note both UMD and CJS predate the ESM specification and is why they both exist despite ESM being the standard at this point in time.

For the remainder of this article, we will focus mainly on ESM syntax since its the standard and because having to define caveats for every possible syntax is tiresome.

<h2 id="what-is-a-bare-module-import">
  <a href="#what-is-a-bare-module-import">
    What is a bare module import?
  </a>
</h2>

While we're on the subject of imports, what is a "bare module import" and why is it special?

A bare module specifier is when you provide a path to a file without a "relative qualifier". For example, the following is a bare module import:

```js
import "jquery"
```

Now, the idea of bare module specifiers comes from NodeJS. Node performs and automatic lookup into your "node_modules" directory when you do not provide a relative qualifier. So the above roughly translates to the following:

```js
import "../node_modules/jquery"
```

The above is whats called a "relative module specifier", which means it is being given a "relative" filepath to find the file in your system.

This is important because the ESM spec does not support "bare module specifiers" which means that a developer needs to do 1 of 2 things to fix bare module specifiers:

A.) Setup an importmap to tell the browser where to find the module.
B.) Transpile the code to be a relative module.

Option A introduces the idea of "importmaps", importmaps are a fairly new concept. Essentially an importmap says "when you see this bare module specifier, here is the relative path to the module so you know where to find it". It's essentially a hint of the browser of how to resolve a bare module. To read more about importmaps, check out Modern Web's Importmap documentation.

https://modern-web.dev/docs/dev-server/plugins/import-maps/

Option B introduces the idea of "transpilation" which we will talk about when we get into "loaders"

<h2 id="what-is-an-entrypoint">
  <a href="#what-is-an-entrypoint">
    What is an entrypoint?
  </a>
</h2>

An entrypoint is another way of saying a "bundle". Essentially an
entrypoint can go by many names, for example in Webpacker < 5, its
called a "pack". Although it may go by many names, at the end of the day an entrypoint
tells a bundler to "bundle this file", in other words, grab all the
files it imports and create whats called a "dependency graph" and then
create a bundled file (and depending on setup, also create "chunks")

What is a dependency graph you may ask? Well a dependency graph is essentially a way for the bundler to map out what packages and files are in your "entrypoint" file and properly bundle those into the final file.

This also begs the question of "what happens if one entrypoint imports another?" This can create whats called a "circular dependency". In other words, A depends on B, but B depends on A, so who gets resolved first?

Circular dependencies can also happen within regular packages, but can usually be resolved by your bundler, although the general recommendation is to try to avoid circular dependencies as much as possible.

https://spin.atomicobject.com/2018/06/25/circular-dependencies-javascript/

Another concept of entrypoints is this is where "loaders" or "transpilers" will generally do what they need to do.

<h2 id="what-is-a-loader">
  <a href="#what-is-a-loader">
    What is a loader?
  </a>
</h2>

A loader is a way for a bundler to convert a non-JavaScript file into JavaScript compatible syntax. For example, lets imagine I import a png into a JavaScript file.

```js
import Circle from "./circle.png"

function render () {
  return `<img src="${Circle}">`
}
```

What's actually happening is if you're using something like "Webpack", there is what's called a "loader" which will transform this png into a JavaScript compatible object and will allow you to grab the final location of the "circle" and point the image src to it. This syntax is not supported by the official ESM spec, but rather is something handled
by bundlers to allow users to reference non-JavaScript files inside a JavaScript file.

Another filetype that requires a "loader" or "transpiler" is TypeScript! Lets imagine I import a TypeScript file into a JavaScript file.

```js
import TSFile from "./tsFile"
```

I omitted the `.ts` since TypeScript itself doesn't support importing `.ts` files. If you import a `.ts` file in the browser, it just won't work. Instead, bundlers transpile the `.ts` file using the TypeScript transpiler (or compiler whatever you prefer) and then turns it into a
usable JavaScript file.

The important thing about loaders and minification and everything else changing the final output, is it obscures where the initial code comes from. To solve this problem, bundlers implement something called "sourcemaps". Sourcemaps are a way of mapping transpiled code to it's original source code. This is particularly important for tracking down errors since its very hard to debug minified / transpiled code without sourcemaps available.

While we're here, now would be a good time to talk about "targets". The idea of a "target" is to tell a bundler to "output JavaScript syntax compatible with this EcmaScript (ES) spec, or output JavaScript syntax compatible with these browsers"

For example, you may have seen targets written like this:
`targets: "es6"` or when targetting browsers:
`targets: "> 0.1%, not dead, not IE 11, supports-esmodules"`

This is a way of using "modern" JavaScript syntax while being able to be backwards compatible with older browsers.

On the subject of "modern", lets move on to talk about code splitting or chunking.

<h2 id="what-is-a-chunk">
  <a href="#what-is-a-chunk">
    What is a chunk? (Code Splitting)
  </a>
</h2>

A chunk is merely a segmented JavaScript file from the main bundle. Chunks are fairly new and they are a result of the browser evolving. As the browser has evolved, so to have bundlers. Browsers have better support for simultaneously
downloading asset files so when using HTTP/2 compatible servers, multiple smaller files can actually be better for performance.

Let dig in to how chunks are created.

There are multiple ways to create chunks. The 2 most common ways are "critical path" code splitting and "file size" code splitting.

The first form of chunking called "file size chunking", means "pick an arbitrary file size and make a chunk at that size". For example, lets choose 20kb (since thats what the Webpack SplitChunks plugin uses https://webpack.js.org/plugins/split-chunks-plugin/). This means any
file I import thats greater than 20kb will automatically be turned into a chunk.

The second form of chunking called "critical path code splitting" means:

"only import the most important files for rendering first, and then import the other 'chunks' after the initial critical bundle has loaded". 

This helps achieve faster initial loading for people browsing your website.

Another way of talking about critical path code splitting is called "dynamic imports". A dynamic import gets imported at runtime. Heres the difference between a static and dynamic import:

```js
import("mymodule") // => dynamic
import "mymodule" // => static
```

This will be important when we talk about "statically analyzable files" when we explain what treeshaking is.

<h2 id="what-is-treeshaking">
  <a href="#what-is-treeshaking">
    What is treeshaking?
  </a>
</h2>

Treeshaking, otherwise referred to as "dead code elimination" is a way for your bundler to get rid of unused code. This process is can be error prone and will be specific to the bundler you're using and its internal AST (Abstract Syntax Tree)

Every bundler implements treeshaking slightly differently but heres the core concepts:

To be treeshakeable a file should do at least the following:

A.) Be statically analyzable
B.) Provide static references to imports
C.) Should not have side effects

Statically analyzable means it cant use an interpolated string to import a file. Here's an example

```js
// Statically analyzable
import "file"

// Not statically analyzable
const file = "file" + Math.random.toString()
import(file)
```

Static references means you cant use a "dynamic accessor" on an object. This doesnt really affect ESM since it has an explicit "grab only what I need" syntax, but is worth talking about. Example:

```js
// Treeshakeable!
import { onlyThis } from "large-module"

// hard to treeshake / possibly not treeshakeable (depends on bundler)
import * as Blah from "blah"

// Not treeshakeable
const x = require("blah")
x["dynamic"]()
```

Finally, let's talk side-effects, which warrant their own section below.

<h2 id="what-are-side-effects">
  <a href="#what-are-side-effects">
    What are side effects?
  </a>
</h2>

A side-effect is a piece of code that runs when a file is
"imported". You may be familiar with side-effects if you've browsed the Webpack docs. https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free

For example, lets look at two files:

```js
// side-effect.js
class MyCustomElement extends HTMLElement {}
window.customElements.define("my-custom-element", MyCustomElement)

// entrypoint.js
import "side-effect.js"
```

When I import "side-effect.js", the code will automatically run despite not calling any functions when its imported. This makes it hard for bundlers to know if `side-effect.js` is tree-shakeable since the code runs despite the user not actually acting on the import itself. As a
result, files with side-effects are generally hard to treeshake so most bundlers wont attempt to treeshake them.

If I wanted to rewrite the above to be "side effect free" I would do something like this:

```js
// side-effect.js
class MyCustomElement extends HTMLElement {}

export function define() {
  window.customElements.define("my-custom-element", MyCustomElement)
}

// entrypoint.js
import { define } from "side-effect.js"
define()
```

And now we are "side effect free"! There is one last topic to discuss and then this reference is complete!

<h2 id="what-is-hashing">
  <a href="#what-is-hashing">
    What is hashing? (fingerprinting, digest, etc)
  </a>
</h2>

File hashing (also called fingerprinting, or a file digest) is the process of analyzing a
files content then generating and adding a "hash" to the end of it. An example of a hashed file looks like this:

`file.xj921rf.js` (yes thats a made up hash)

The size of the hash (number of characters ) is determined by your bundler settings. The higher the number, the more "unique" the hash is. Unique hashes are great for caching purposes since if the hash has not changed,
the browser can just use the cached version. A hash is intended to be "idempotent" in that if I run the same file, with the same contents, n number of times, then I will always get the same final hash regardless of how many times the build is run. This is important for consistency. And this ends my reference to myself.

<h2 id="final-thoughts">
  <a href="#final-thoughts">
    Final Thoughts
  </a>
</h2>

The above may not be 100% accurate. This is purely off the top of my head over the last hour or so. If you have anything to add or anything to correct, feel free. Take this all with a grain of salt. I'm just 1 person, and I've never actually written a bundler. Have a great day and bundle away!