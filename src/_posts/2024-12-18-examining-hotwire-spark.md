---
title: Examining Hotwire Spark
categories: []
date: 2024-12-18
description: |
  A short dive into Hotwire Spark
published: true
---

Today 37signals / Basecamp released [Hotwire Spark](https://github.com/basecamp/hotwire-spark).

The first thing I noticed is that it uses [Idiomorph](https://github.com/basecamp/hotwire-spark?tab=readme-ov-file#how-it-works) for morphing HTML changes.

Morphing is one of those "sharp knives" where it can be a very handy tool, especially on small targeted section of a pages, but can also introduce problems when used on larger pages, especially if your page is not designed around morphing.

I'm worried people unfamiliar with morphing, or with apps not designed specifically for morphing will quickly become frustrated with this tool.

In particular, libraries such as Trix, HouseMD, SlimSelect, and a number of other JavaScript libraries will be a pain to work with using morphing because they modify the DOM without the server knowing, so things quickly end up out of sync.

Morphing issues are fairly well documented for Trix:

<https://github.com/hotwired/turbo-rails/issues/533>

<https://github.com/hotwired/turbo-rails/issues/533#issuecomment-1837107295>

<https://github.com/hotwired/turbo-rails/issues/533#issuecomment-1842056856>

<https://github.com/toddsundsted/ktistec/commit/7994faec41b1f152cc6b7a1fd8afa4403c9b50bd>

<https://thoughtbot.com/blog/turbo-morphing-woes>

<https://thoughtbot.com/blog/turbo-morphing-woes#opting-out-of-morphing>

And these are only some of the issues. There's more, but I didn't want to make the list too long.

HouseMD is going to run into the same problem whenever its released because it is `contenteditable` and maintains its own "Document" so when a morph modifies the editor, things will end up out of sync. It also injects a toolbar, similar to Trix which is source of quite a few morphing bugs.

I recommend reading this article by Matheus Richard and Thoughtbot and understand why morphing can create as many problems as it solves. Definitely a "Beyond this point, there be dragons".

<https://thoughtbot.com/blog/turbo-morphing-woes>

## Stimulus Controllers get special mount / unmount behavior

Interestingly, stimulus controllers get their own special mount / unmount behavior.

I also dont see anywhere where if a controller were to get deleted, it gets deleted by the Stimulus Reloader. Totally possible I missed it, but I don't see it here:

<https://github.com/basecamp/hotwire-spark/blob/40a26cd3b60e7531065658eec13c5cca0d6048f1/app/javascript/hotwire/spark/reloaders/stimulus_reloader.js#L72-L74>

So I tested it out.

I wrote a silly controller like this:

```js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    console.log("Connect")
    this.interval = setInterval(() => console.log("Hello World"), 1000)
  }

  disconnect () {
    console.log("Disconnect")
    clearInterval(this.interval)
  }
}
```

And then, when I deleted the file, the controller continued with its `setInterval()` since it never unregistered my controller. And it never fired a 'disconnect' despite the controller no longer existing.

Issue submitted here:

<https://github.com/basecamp/hotwire-spark/issues/25>

## Only importmaps are supported

Currently, Hotwire Spark is only supported by importmaps, so jsbundling and ViteRuby users will have to wait to try it out.

<https://github.com/basecamp/hotwire-spark/issues/12>

## JS libraries are inlined

Hotwire Spark loads some libraries more than once!

For example, Stimulus, ActionCable, and Idiomorph all get "inlined" by Spark. This means they will not use your existing version, and instead use its own version of these libraries.

This means you could potentially have 2 versions of Stimulus, ActionCable, and Idiomorph on the page, rather than re-using your existing versions, which can potentially lead to unknown behavior.

- Inlined Stimulus:

<https://github.com/basecamp/hotwire-spark/blob/c8ce327654dc370ce8c217d984e59d6614bad1c0/app/assets/javascripts/hotwire_spark.js#L1394-L1397>

- Inlined Idiomorph:

<https://github.com/basecamp/hotwire-spark/blob/c8ce327654dc370ce8c217d984e59d6614bad1c0/app/assets/javascripts/hotwire_spark.js#L552-L553>

- Inlined ActionCable:

<https://github.com/basecamp/hotwire-spark/blob/main/app/assets/javascripts/hotwire_spark.js#L1-L458>

Issue submitted here:

<https://github.com/basecamp/hotwire-spark/issues/26>

## Theres probably more

These are just my initial findings playing around with Hotwire Spark. I'm sure theres other issues lurking around the corner.

## My ideal reloader

In my ideal world, I just have a live reloader that stores my scroll position, does a full page reload, and then scrolls me back to where I was. Anything beyond that, like this pseudo "Hot Module Replacment" is going to continue to need patches and weird fixes to account for not just doing a full page reload. And it will put you in a state that a regular user could never hit.

In addition, there are some existing reloaders that have worked quite well for me:

<https://github.com/kirillplatonov/hotwire-livereload>

[ViteRuby](https://vite-ruby.netlify.app/), in particular, the "Full Reload" plugin has worked quite well for me.

<https://vite-ruby.netlify.app/guide/plugins.html#full-reload>


