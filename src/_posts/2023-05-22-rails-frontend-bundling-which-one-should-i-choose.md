---
title: Rails Frontend Bundling - Which one should I choose?
categories: [frontend, rails, webdev, ruby]
date: 2023-05-22 16:46:07 UTC
description: |
  Propshaft? Or Sprockets?   If you use the following options:...
---

## Propshaft? Or Sprockets?

If you use the following options:

- ImportMaps
- JSBundling-Rails

you'll be using either Sprockets or Propshaft. The default that Rails ships with is Sprockets.

If you're in a new application, I would try to start with Propshaft if possible. If you're attempting to migrate an existing application, I would probably go with Sprockets for compatibility with gems that may ship their own assets.

### Why Propshaft?

Propshaft is much more streamlined, isn't as heavy handed as Sprockets, and has much more predictable behavior. It doesn't ship with as many features as Sprockets, but in this case, that's a feature.

We won't get into caching bugs with Sprockets, but I have noticed when things are FUBAR in local dev with Sprockets, `rails assets:clobber` is your friend.


## ImportMaps

https://github.com/WICG/import-maps

### What are importmaps?

At their core, importmaps are essentially aliases.

```js
import "@hotwired/turbo-rails"
```

gets expanded to:

```js
import "https://{{cdn}}/@hotwired/turbo-rails"
```

We won't get into the nitty gritty, but this is the basics of ImportMaps. ImportMaps also only apply to JavaScript files. You cannot import `svg`, `png`, `css`, etc files like people have come to expect from bundlers like Webpack. You can only import `.js` files.

To import css files, generally the easiest way is to insert a `<link>` tag that points to a prebuilt `.css` file from a CDN or locally.

Import Attributes (Import assertions) are coming, but aren't here yet, and it'll be interesting to see how they map to ImportMaps.

https://github.com/tc39/proposal-import-attributes

### Why ImportMaps?

ImportMaps are the least invasive of all the tools. It also has the least number of features. Things like transpilation for older browsers, dependency graph management, and dead code elimination (tree-shaking) do not exist in importmaps.

If you plan to stick to the default packages Rails provides and don't plan to add much more JavaScript, ImportMaps will be a great tool for you. If you plan to add packages from NPM, or add a lot more JavaScript, or leverage any more advanced features ImportMaps may not be right for you.

### Additional Notes on ImportMaps

ImportMaps are getting near universal adoption in newer browsers. And the polyfill for importmaps is really good. However, the timing of your JavaScript is different between browsers.

The order of operations, or when the JavaScript executes, is different between all browsers. Meaning you will need to be much more careful between browsers because of timing issues. Without being too specific, the reason for this is because the timing and execution of JS Modules has never been fully defined. Each browser is free to implement the parsing, evaluation, and execution stage of JS Modules however they see fit. This is not a problem for bundlers because they are able to make more guarantees when they parse + build your JavaScript for you.

The other problem with importmaps is some NPM packages may not be properly compiled for use in browsers from a CDN without a bundling step. These dependencies may have non-standard syntax which the browser may not be able to handle. The other problem is with nested dependencies. If the CDN doesn't inline dependencies, you may be stuck in a scenario where you have incompatible versions of the same dependency. If the CDN does inline dependencies, you're now shipping duplicate code.

## JSBundling-Rails

Alright, you've decided that ImportMaps don't provide enough features, or maybe you have a specific package that may be problematic. JSBundling-Rails actually has generators for Rollup, Webpack, and ESBuild

https://github.com/rails/jsbundling-rails/tree/main/lib/install

But we'll focus on the ESBuild portion specifically. It's important to note that JSBundling-Rails is a few rakes tasks, it does not handle your actual asset URLs and paths. Asset URLs and paths will still be handled by Sprockets / Propshaft. JSBundling-Rails basically compiles your files into `app/assets/builds` and then the Rails asset pipelines picks up the unhashed files and will hash them for you. So even if you're using ESBuild via JSBundling-Rails, you're still using either Sprockets or Propshaft.

### ESBuild

ESBuild is a great middle ground between Webpacker / Shakapacker and ImportMaps. ESBuild provides transpilation, tree-shaking, scope-hoisting, non-js imports, bare module imports, and much more.

ESBuild is also written in Go and is crazy fast compared to other bundlers.

** For the majority of applications ESBuild is probably the best option **

## Why not ESBuild?

There are very few reasons not to use ESBuild. But there are a couple.

There's a whole list here: https://esbuild.github.io/content-types/#javascript-caveats

But I'll simplify it for you:

- IE11. If you need to support ES5 browsers, but are writing ES6+ syntax (very rare these days), then ESBuild is not the tool for you.
- Problematic dependencies. Some dependencies like [CKEditor](https://ckeditor.com/) are designed specifically to work with Webpacker and won't work with other tools.

## Webpacker / Shakapacker

Webpacker (now Shakapacker) is the oldest of the current frontend bundling tools. It's very robust and solid...and also confusing. This is the nuclear option if none of the other frontend bundling options will work for you. It will handle just about anything you throw at it (as long as you set it up properly). I don't have much more to add here, we've all dealt with Webpacker for the last few years.

## Vite

Vite, in particular, [ViteRuby](https://vite-ruby.netlify.app/) is a solid option. It sits between ESBuild and Webpacker, and if you're looking at Webpacker, Vite may actually be a better option for you. It is a very solid option, and I've enjoyed using Vite personally.

### Additional Caveats

Vite uses ESBuild in development, and Rollup for production. Occasionally this can cause issues because now production and development can be different and it is worth calling out.

## Honorable Mention

### Parcel 2

Parcel 2 is a very solid step up from Parcel 1. There are currently no Rails integrations for it, but it is very close to Vite in terms of developer experience.

## Conclusion

For **new** applications ESBuild + Propshaft is probably the best option.

For **existing** applications ESBuild + Sprockets is probably the best option.

Importmaps are good for small projects / prototypes.

Vite is good for more powerful apps that may be leveraging React, Vue, Svelte, etc. and would like a more robust experience.

Webpacker / Shakapacker is there if you really need to support old browsers, legacy syntax, or have a problematic dependency.
