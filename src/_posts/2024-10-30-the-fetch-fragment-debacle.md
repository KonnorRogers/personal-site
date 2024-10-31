---
title: The Fetch Fragment Debacle
categories: []
date: 2024-10-30
description: |
  The Fetch Fragment Debacle. A small post detailing why Turbo does not preserve url fragments and how it could potentially preserve them in the future. And how `fetch` falls short.
published: false
---

Linking to fragments (sometimes called hashes) is very common on the web.

If you're not sure what a fragment is its the "pound" or "hashtag" or "number sign" (your terminology probably depends on your age) sign at the end of a url.

`https://example.com/#foo` where `#foo` is the "fragment" or "hash". If you're still confused, check out MDN:

<https://developer.mozilla.org/en-US/docs/Web/URI/Fragment>

Moving on, now that we have the definition in place, lets talk about `fetch()`.

Someone was lamenting in the GoRails discord about Turbo not preserving URL fragments on redirects. Another person stated it was a limitation of `fetch`. So I threw on my detective hat and got to work.

I quickly found that the `Location` header never gets exposed on the redirect.

Exposing location header??

<https://stackoverflow.com/questions/38927335/how-to-get-header-location-value-from-a-fetch-request-in-browser?noredirect=1&lq=1>

Maybe a before_action to always set the location on redirects??

<https://stackoverflow.com/questions/64731041/how-do-i-declare-content-range-in-the-access-control-expose-headers-header-using>



