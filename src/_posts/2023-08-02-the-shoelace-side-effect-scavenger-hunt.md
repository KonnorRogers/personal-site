---
title: The Shoelace Side Effect Scavenger Hunt
categories: []
date: 2023-08-02
description: |
  Come along and join me on my journey to debugging side effects and treeshaking in Shoelace
  and figure out why everything is broken!
published: true
---

Alright, strap in, we're going to be talking [Treeshaking](https://webpack.js.org/guides/tree-shaking/) and [Side Effects](https://codesweetly.com/side-effect) and the problems of tracking them down in [Shoelace](https://shoelace.style).

It had been reported that Shoelace bundles for React were much bigger than expected
due to not being treeshaken (eliminated unused code).

<https://github.com/shoelace-style/shoelace/issues/1431>

Initially, I attempted to solve this with the `sideEffects` key in `package.json`, turns out, this creates
a lot of problems because it requires maintaining an up-to-date list of files with side-effects, and it
also bypasses a lot of bundler's ability to optimize and detect side effects and bundlers simply
take these files at face-value and don't traverse the file.

Here's some extra reading.

<https://twitter.com/daKmoR/status/1686482623999148032>

<https://github.com/shoelace-style/shoelace/pull/1480>

<https://github.com/shoelace-style/shoelace/pull/1479>

Alright, so now that we determined using `sideEffects` is an easy hack, albeit difficult to maintain and
deoptimizes a lot of bundlers, and creates lots of problems, let's look at how we can track down side effects
in Shoelace's code base.

The first problem is that we transpile from `typescript` -> `javascript` using [ESBuild](https://esbuild.github.io).

So, the first step was to create a "test" component with as little as possible and then pipe it through a
CLI created by Rich Harris called [Agadoo](https://github.com/Rich-Harris/agadoo) and detect side effects.

On compiling a new component 3 things stood out to me:

- LocalizeController
- Decorators
- Static initialization blocks

Let's walk through the problems for each of these.

## LocalizeController

This one I expected. It has a side-effectful import. I can fix this. This is easy.

## Decorators

This one was a little surprising, but it makes sense.

```ts
export class MyClass {
  @property() attr
}
```

Gets compiled to this:

```ts
var MyClass = class {}

__decorateClass([
  property()
], MyClass.prototype, "attr", 2);

export { MyClass }
```

That `__decorateClass` call means that because it's modifying the class prototype,
the file is no longer tree-shakeable due to the "side effect"

Okay, its possible to work around this. I detail it here: <https://github.com/shoelace-style/shoelace/pull/1482#issuecomment-1662599463>

> The TLDR is we'd need an `build.onEnd` plugin to iterate over all the built files and check for decorators and wrap them in an IIFE and mark them as pure like this package for Vite: <https://www.npmjs.com/package/vite-plugin-tree-shakable-decorators>

And of course the related issue on ESBuild marked as "closed" and essentially "wontfix"

So, we can just steal the plugin, its a lot, but not too bad.

## Static initialization blocks

Alright, this was super tough to track down. I was using multiple ESBuild playgrounds and couldn't figure out why
it was compiling as expected there, but not in ESBuild.

So, here's the gist of what I had + what I wanted:

```ts
class Thing {
    static thing = "thing"
}
```

I expected this to compile exactly as is. But in Shoelace, it was setting the property directly on the class.

```ts
// Expected
class Thing {
    static { this.thing = "thing" }
}

// Actual
class Thing {}
Thing.thing = "thing"
```

Which then is considered "not tree-shakeable" by Agadoo / Rollup. So what was causing this funkiness?

Well, the answer lays in `tsconfig.json`

```json
{
  "compilerOptions": {
    "useDefineForClassFields": false
  }
}
```

We have this set to `false` for a reason, and that's to play nicely with Lit's Reactive Property binding.

And here's the Twitter thread of me trying trying to figure out WTF is going on.

<https://twitter.com/RogersKonnor/status/1686767098289102848>

I don't know the path forward here, but this was me documenting my fun time with side effects and tree shaking.
Hope you enjoyed my misery :)
