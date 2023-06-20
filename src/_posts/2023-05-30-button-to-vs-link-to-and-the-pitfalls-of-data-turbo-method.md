---
title: button_to vs link_to and the pitfalls of data-turbo-method
categories: ["turbo", "hotwire", "rails", "htmx"]
date: 2023-05-30 18:49:01 UTC
description: |
  If you're familiar with Turbo, or even HTMX  You'll see this pattern come up frequently.    &lt;a...---

If you're familiar with Turbo, or even [HTMX](https://htmx.org/)

You'll see this pattern come up frequently.

```html
<a href="/logout" data-turbo-method="delete">Logout</a>
<a data-hx-delete="/logout">Logout</a>
```

Before we get into the difference, checkout @excid3 's video on button_to vs link_to: <https://gorails.com/episodes/link_to-vs-button_to-in-rails?autoplay=1>

Now let's dissect these one by one and checkout the issues.

## Turbo anchors

We'll start with the Turbo version.

```html
<a href="/logout" data-turbo-method="delete">Logout</a>
```

### JS hasn't loaded

The problem with this is even though you're writing HTML, there is no such thing as a "delete link" in regular ole HTML. This link will fire a `GET` request if a user manages to click the link before your JavaScript loads.

### Accessibility

Buttons and links tend to get separated by screenreaders. Buttons tend to get lumped under form controls, whereas links are put together with navigation.

In reality, to get the screenreader to read the button similarly, you would need to do something like this to get the browser to read it a little easier.

```html
<a role="button" href="/logout" data-turbo-method="delete">Logout</a>
```

Done right?!

Not really. First rule of ARIA is don't use ARIA. Anchors have different semantics than buttons. In fact, its not even technically possible to disable anchors with regular HTML!

```html
<!-- This is still clickable and doesn't get disabled -->
<a href="/blah" disabled>Logout</a>
```

So if for some reason you wanted to disable that anchor, it wouldn't be possible without JavaScript to intercept clicks! Even further, similar shortcuts between button vs anchor behave differently!

If I `ctrl+click` a button, it will still send my form and log me out, because it doesn't need JavaScript. If I `ctrl+click` the above link, the browser wont be able to send the DELETE request, and instead issue a `GET` request to "/logout" and it will feel broken to a user.

## The HTMX example

```html
<a data-hx-delete="/logout">Logout</a>
```

The problem with this is that an `<a>` without an `href` will not be clickable and not within the accessibility tree of focusable elements.

Okay so lets fix it!

```html
<a href="javascript: void 0;" role="button" data-hx-delete="/logout">Logout</a>
```

Or
```html
<a tabindex="0" role="button" data-hx-delete="/logout">Logout</a>
```

Please don't do this. It's merely an example. Again, this hits similar pitfalls as Turbo links. If your JS fails to load, if a user `ctrl+clicks`, if JS hasn't finished loading, all of those situations will get this to appear broken. This doesn't even address anything to do with accessibility because that is a whole other can of worms. Just because you set a `role="button"` on there, it still doesn't behave the same because its not attached to a `<form>` so many assistive technologies will not treat it as a `<button type="submit">` which is the default behavior of a `<button>` within a form.

## Okay? But forms only support GET / POST.

Yes. `<form>` only supports GET / POST. This is true. It will depend on your server. Look up "method spoofing" or "method masking".

I wrote a primer on this in mrujs: <https://mrujs.com/references/understanding-method-masking>

And here's Laravel's docs on method spoofing. <https://laravel.com/docs/10.x/routing#form-method-spoofing>

And heres the rough HTML you would use in Laravel or Rails:

```html
<form action="/logout" method="post">
  <input type="hidden" name="_method" value="delete">
  <button>Logout</button>
</form>
```

Or if you want to get fancy you can have the form and the button in two different places!

```html
<form id="logout-form" action="/logout" method="post">
  <input type="hidden" name="_method" value="delete">
</form>

<!-- Other stuff here -->

<button form="logout-form" type="submit">Logout</button>
```

If you're using Rails form helpers, the hidden input is handled for you:

```erb
<%= form_with model: current_user do |form| %>
  <%= form.submit "Logout" %>
<% end %>
```

Look mom! No JavaScript!

## TLDR

Please, just use buttons inside of forms to do non-GET requests. Yes, it may require more work to style it to look like a link, but I promise your users will thank you.