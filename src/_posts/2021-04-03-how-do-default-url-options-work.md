---
title: How do default_url_options work in Rails?
date: "2021-04-03T20:07:42"
description:
  A quick down and dirty guide to the totally bizarre default_url_options
  API in Rails.
---

<h2 id="default-url-options">
  <a href="#default-url-options">
    `default_url_options`
  </a>
</h2>

I'm sure you've all been bitten by the `default_url_options` API in
Rails. You either couldnt get it to work, or just moved on. Or, you just
threw everything and the wall and saw what stuck.

<h2 id="how-it-works">
  <a href="#how-it-works">
    How it works
  </a>
</h2>

Currently, there are 4 different config options for `default_url_options` as far as I can tell.
This doesnt include defining `default_url_options` as a method inside of your routes file, controller, or mailer.

```rb
Rails.application.default_url_options
Rails.application.routes.default_url_options

Rails.application.config.action_controller.default_url_options
Rails.application.config.action_mailer.default_url_options
```

<h2 id="whats-the-difference">
  <a href="#whats-the-difference">
    So? Whats the difference?
  </a>
</h2>

Well the first two options are the same thing. They reference the same variable.

Example:

```bash
bundle exec rails console

Rails.application.default_url_options
# => {}

Rails.application.routes.default_url_options
# => {}
```

When one is updated, the other is updated.

```bash
bundle exec rails console

Rails.application.default_url_options[:host] = "0.0.0.0"
# => {host: "0.0.0.0"}

Rails.application.routes.default_url_options
# => {:host => "0.0.0.0"}

Rails.application.routes.default_url_options[:host] = "1.2.3.4"
# => {:host => "1.2.3.4"}

Rails.application.default_url_options
# => {:host => "1.2.3.4"}
```


So, to recap, `Rails.application.default_url_options` is the same as
`Rails.application.routes.default_url_options`

By default, they are both hashes that can be modified in place. Easy.

<h2 id="action-controller-mailbox">
  <a href="#action-controller-mailbox">
    Action Controller / Action Mailbox
  </a>
</h2>

Alright heres where things get weird.

Lets just open up a console and see what happens.

```bash
bundle exec rails console

Rails.application.config.action_mailer
# => ActiveSupport::OrderedOptions

Rails.application.config.action_controller
# => ActiveSupport::OrderedOptions

Rails.application.config.action_mailer.default_url_options
# => nil

Rails.application.config.action_controller.default_url_options
# => nil
```

So by default `Rails.application.config.action_mailer` and
`Rails.application.config.action_controller` return nil if the
environments havent been set for them. Okay...cool.

The reason is that `ActiveSupport::OrderedOptions` is essentially a
mixed hash / instance variable configuration object. This means if the value isnt set, itll
return nil.

When setting your config, you want to give
`action_(mailer|controller).default_url_options` a full hash if it hasnt
been set. If it has been set already, you can modify it in place like a
normal Hash.

Example:

```bash
bundle exec rails console

Rails.application.config.action_controller.default_url_options = {host:
"0.0.0.0", port: 4569}
# => {:host => "0.0.0.0", :port => 4569}

Rails.application.config.action_mailer.default_url_options = {}
Rails.application.config.action_mailer.default_url_options[:host] =
"0.0.0.0"
# => {:host => "0.0.0.0"}
```

<h2 id="bring-it-around-town">
  <a href="#bring-it-around-town">
    Bringing it all together
  </a>
</h2>

Alright, now for the meat and potatoes now that we've gotten definitions
out of the way.

Setting `Rails.application.default_url_options` will only affect calls
made from the Rails router.

Example:

```bash
bundle exec rails console

Rails.application.default_url_options = {host: "0.0.0.0"}
Rails.application.routes.url_helpers.url_for(User.first)
# => http://0.0.0.0/users/1
```

However, if we were to go into our actual running app and click on a
button that uses: `users_url(User.first)` the hostname will not be what
we set. The same goes for out `ActionMailer`, the hostname wont be set
properly. To remedy this, we have to set those as well.

```rb
Rails.application.config.action_controller = {host: "0.0.0.0"}
Rails.application.config.action_mailer = {host: "0.0.0.0"}
```

Now, your `action_controller` and `action_mailer` will both have the
new hostname.

To put it in simpler terms, heres roughly what were doing:

`Rails.application.default_url_options` affects the Rails router.
You will use this when interacting directly with the router.
IE: `url_for()`

`Rails.application.config.action_(mailer|controller)` affects the actual
browser route generations when you use either a Controller or
Mailer.
IE: `users_url(Path.first)`

<h2 id="links">
  <a href="#links">
    Links
  </a>
</h2>

Honestly, I couldnt find anything about this in the Rails docs. I found
a few open / closed issues like this one:

https://github.com/rspec/rspec-rails/issues/1275

But for the most part this was all done in the Rails console.

I'm sure I may have gotten something wrong or missed something. But,
this is my understand of the `default_url_options` configuration. Good
luck, and hopefully you dont have to waste as much time as I did hunting
down bugs with this.
