---
title: "Fixing ActionController::InvalidAuthenticityToken in Rails"
categories: []
date: 2024-12-27
description: |
  A brief blog post detailing how to fix ActionController::InvalidAuthenticityToken without disabling authenticity tokens.
published: false
---

If you're here, its probably because you encountered every Rails devs worst nightmare.

`ActionController::InvalidAuthenticityToken`

"Why" this happens is a few reasons, but usually it just comes down to caching HTML pages, or injecting new content to the page without a full page refresh.

There's roughly 2 courses of actions to easily fix this (without disabling CSRF Tokens entirely, as most articles recommend)

1.) Turbo will use a cookie with a name of `"authenticity_token"` so in our `ApplicationController` we can add the following:

<light-code language="ruby">
  <script slot="code" type="text/plain">
  class ApplicationController < ActionController::Base
    before_action :set_csrf_cookie

    private

    def set_csrf_cookie
      cookies["authenticity_token"] = form_authenticity_token
    end
  end
  </script>
</light-code>

<https://github.com/hotwired/turbo/blob/41c074ff113a8882aadbc2758b76860efbcfbf01/src/core/drive/form_submission.js#L231C1-L240C2>

And now every Turbo request that is not a "GET" request will use our cookie instead of a possibly stale `<input type="hidden" name="authenticity_token" value="<stale value>">`

2.) The other option if you're not using Turbo is to add a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to listen for any content changes, and on content change, update the tokens.

<light-code language="js">
  <script slot="code" type="text/plain">
  ;(() => {
      // Make sure that all forms have actual up-to-date tokens (cached forms contain old ones)
      function refreshCSRFTokens () {
        const token = csrfToken()
        const param = csrfParam()

        if (token != null && param != null) {
        document.querySelectorAll(`form input[name="${param}"]`).forEach(input => {
            const inputEl = input
            inputEl.value = token
          })
        }
      }
      // Up-to-date Cross-Site Request Forgery token
      function csrfToken () {
        return getCookieValue(csrfParam()) ?? getMetaContent('csrf-token')
      }

      // URL param that must contain the CSRF token
      function csrfParam () {
        return getMetaContent('csrf-param')
      }

      function getCookieValue (cookieName) {
        if (cookieName != null) {
          const cookies = document.cookie.trim() !== '' ? document.cookie.split('; ') : []
          const cookie = cookies.find((cookie) => cookie.startsWith(cookieName))
          if (cookie != null) {
            const value = cookie.split('=').slice(1).join('=')
            return (value.trim() !== '' ? decodeURIComponent(value) : undefined)
          }
        }

        return undefined
      }

      function getMetaContent (str) {
        const elements = document.querySelectorAll(`meta[name="${str}"]`)
        const element = elements[elements.length - 1]
        return element?.content ?? undefined
      }

      function debounce(func, delay) {
        let timeoutId;

        return function(...args) {
          clearTimeout(timeoutId);

          timeoutId = setTimeout(() => {
            func.apply(this, args);
          }, delay);
        };
      }

      // Debounce so in case of very frequent updates.
      const debouncedRefresh = debounce(() => refreshCSRFTokens(), 20)

      // When elements are added, always update.
      const elementObserver = new MutationObserver((mutationRecords) => {
        debouncedRefresh()
      })

      elementObserver.observe(document.documentElement, {
        // Listen for any elements being added.
        childList: true,
        subtree: true,
      })
      refreshCSRFTokens()
    })()
  </script>
</light-code>
