---
title: "Rebuilding ActiveStorage: First Impressions"
categories: [javascript, rails, activestorage, webdev]
date: 2021-11-01 03:02:57 UTC
description: |
  Why? ActiveStorage's JS library is just fine...why rebuild it?  You're not wrong. It...
---

<h2 id="why">
  <a href="#why">
    Why?
  </a>
</h2>

ActiveStorage's JS library is just fine...why rebuild it?

You're not wrong. It works.

I enjoy rebuilding things, it also really helps me understand how these libraries work under the hood and helps me troubleshoot with others.

<h2 id="initial-impressions">
  <a href="#initial-impressions">
    Initial Impressions
  </a>
</h2>

<h3 id="shared-code">
  <a href="#shared-code">
    Shared Code
  </a>
</h3>

ActiveStorage's JS package seems to reuse a lot
of Rails-UJS functions but gets none of the benefits of
sharing code. Even better, ActiveStorage could share with
the package I created, [mrujs](https://github.com/paramagicdev/mrujs).

Examples:

- `dispatch`

  - ActiveStorage: [dispatch](https://github.com/rails/rails/blob/099289b6360ac82d1e0fa0a5592ac10cfc05e6e0/activestorage/app/javascript/activestorage/helpers.js#L25-L41)

  - mrujs: [dispatch](https://github.com/ParamagicDev/mrujs/blob/345ec84f8bdb74ac1961e95a9772f7e6411ff836/src/utils/events.ts#L12-L16)

- `toArray`

  - ActiveStorage: [toArray](https://github.com/rails/rails/blob/f95c0b7e96eb36bc3efc0c5beffbb9e84ea664e4/actionview/app/assets/javascripts/rails-ujs/utils/form.coffee#L5)

  - mrujs: [toArray](https://github.com/ParamagicDev/mrujs/blob/345ec84f8bdb74ac1961e95a9772f7e6411ff836/src/utils/dom.ts#L5-L7)

`toArray` is actually interesting because the ActiveStorage
version polyfills to newer versions of creating arrays.
This could be adopted into mrujs and shared.

- `getMetaValue` / `getMetaContent`
  - ActiveStorage:
    [getMetaValue](https://github.com/rails/rails/blob/099289b6360ac82d1e0fa0a5592ac10cfc05e6e0/activestorage/app/javascript/activestorage/helpers.js#L1-L6)
  - mrujs:
    [getMetaContent](https://github.com/ParamagicDev/mrujs/blob/345ec84f8bdb74ac1961e95a9772f7e6411ff836/src/utils/misc.ts#L39-L43)

<h3 id="old-methods">
  <a href="#old-methods">
    Old ways of doing things
  </a>
</h3>

This line stuck out to me, rather than making an AJAX
request, it creates a button on a form if it can't find one
and then manually clicks the element.

https://github.com/rails/rails/blob/099289b6360ac82d1e0fa0a5592ac10cfc05e6e0/activestorage/app/javascript/activestorage/ujs.js#L63-L77

In light of WebComponents, testing tag names feels
weird...We can also grab submitters off of the "submit"
event and both Turbo / mrujs ship with the polyfill for
Safari.

[mrujs submit polyfill](https://github.com/ParamagicDev/mrujs/blob/main/src/polyfills/submit-event.ts)

[Turbo submit polyfill](https://github.com/hotwired/turbo/blob/main/src/polyfills/submit-event.ts)

<h3 id="hashing">
  <a href="#hashing">
    MD5 Hashing
  </a>
</h3>

ActiveStorage uses the
[SparkMD5](https://github.com/satazor/js-spark-md5) library
for MD5 hashing. I don't know enough about the library to
know if MD5 is necessary or if we could use SHA-x hashing
or similar. SparkMD5 is roughly 2.5kb and ActiveStorage
is ~5kb overall, which means MD5 hashing accounts for
roughly half the library.

[SparkMD5 bundle size](https://bundlephobia.com/package/spark-md5@3.0.2)

[Where SparkMD5 is used](https://github.com/rails/rails/blob/099289b6360ac82d1e0fa0a5592ac10cfc05e6e0/activestorage/app/javascript/activestorage/file_checksum.js#L20)

<h3 id="xhr-requests">
  <a href="#xhr-requests">
   XmlHttpRequests
  </a>
</h3>

[XmlHttpRequest example](https://github.com/rails/rails/blob/main/activestorage/app/javascript/activestorage/blob_record.js#L14-L19)

Not surprised, but ActiveStorage uses XmlHttpRequests
rather than the newer Fetch API for AJAX. This could be
updated to use the [FetchResponse](https://github.com/ParamagicDev/mrujs/blob/main/src/http/fetchResponse.ts)
and [FetchRequest](https://github.com/ParamagicDev/mrujs/blob/main/src/http/fetchRequest.ts) helpers exported by mrujs.

<h3 id="closing-thoughts">
  <a href="#closing-thoughts">
    Closing Thoughts
  </a>
</h3>

At least it's not CoffeeScript! It should be much easier to port to TypeScript and integrate with mrujs since its much more modern. There may be some incompatibilities around XmlHttpRequest and Fetch, but we shall have to see. Everything else looks fairly usable.
