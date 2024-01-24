---
title: Trix and I are not friends
categories: []
date: 2024-01-24
description: |
  A small summary of some of the issues I've run into using Trix.
published: true
---

Ahh Trix. Truly a fine editor if you need to get a WYSIWYG out the door. But can be quite
lacking when it comes to more advanced features.

> Disclaimer: I maintain another WYSIWYG for ActionText called [RhinoEditor](https://rhino-editor.vercel.app). Take everything with a grain of salt.

Let's get into it. Here's some of the problems I've faced working with Trix. I won't even get into the backend ActionText stuff,
because that isn't as bad as it could be, but has it's own set of problems we can save for another day. This is focusing purely on the frontend text editor.

## Global singleton config

Trix has this fun problem of being a global singleton and even auto-binds to the `window` object for you.

<https://github.com/basecamp/trix/blob/98f7d67647fbb2854ba7bc6247bab75fe401fa55/src/trix/trix.js#L39>

This singleton is responsible for things like:

- Building the toolbar: <https://github.com/basecamp/trix/blob/98f7d67647fbb2854ba7bc6247bab75fe401fa55/src/trix/config/toolbar.js>
- Translations: <https://github.com/basecamp/trix/blob/98f7d67647fbb2854ba7bc6247bab75fe401fa55/src/trix/config/lang.js>
- The `<input>` for file choosing, which also doesn't let you add an `accept` attribute.


Okay so what's the problem with the singleton?

Well, the problem is that if for example you wanted to implement a `<trix-editor>` which had an `accept="image/*"` attribute, it will never
make it to the `pickFiles` call on `Trix.config.input.pickFiles`. The `pickFiles` call has no idea what element it's being called from. So you could
override the call to add the `accept="image/*"` as I show here:

<https://codepen.io/paramagicdev/pen/wvOroXN>

The problem with this, is if you have more than 1 editor on the same page that may need different functionality, now you're in a
weird position of having to hack around and override `pickFiles` only when that specific editor's `attachFiles` button is called, then revert it when the file has been picked. It's not fun. (Yes, this could be solved by Trix, but this speaks to issues of extending Trix in general.)

Translations have the same problem. What if you want slightly different text for multiple editors on the same page? Well, then you need to querySelector them and directly modify. Same with defaultToolbar. These are workable issues, the hardest one was definitely the `pickFiles` function with an `accept` attribute because the same function gets called by every editor on the page, instead of only once when it starts. Each instance doesn't maintain its own `pickFiles` function to generate the `<input>`. Luckily, translations and toolbar creation only happen once on editor instantiation.

## Tables

Table Editing. A true curse of Trix.

Table Editing has been a long requested feature of Trix, but sadly, it's never happened.

<https://github.com/basecamp/trix/issues/539>

Is it possible? Yes. Julian Rubisch shows you how here:

<https://blog.appsignal.com/2022/10/26/build-a-table-editor-with-trix-and-turbo-frames-in-rails.html>

The problem is it relies heavily on what are called "Custom Attachments". Every time you make a table, you're making an HTTP request to your server to inject a new cell. It can be quite clunky to need to reach out to the server just to insert a table, or a cell, or a row, or a column, etc. You also get clunky undo / redo functionality as a result.

But Konnor, can't you just edit the allowed tags in `blockAttributes` and let it accept `<table>` / `<tr>` / `<td>` / etc.

Unfortunately, no.

The parser that comes with Trix explicitly disallows `<tr>` and `<td>` even if you add it to the `blockAttributes` config object because
it is hard coded into the parser.

<https://github.com/basecamp/trix/blob/98f7d67647fbb2854ba7bc6247bab75fe401fa55/src/trix/models/html_parser.js#L220-L229>
<https://github.com/basecamp/trix/blob/2e9d935dbdbffed2c2cf4ae6886948075d678f90/src/test/unit/html_parser_test.js#L198-L202>

## Extending the schema is undocumented, challenging, and confusing

Table editing is the symptom of a much larger problem in Trix. It's schema. A "schema" in this scenario
are essentially allowable elements and attributes that won't get "sanitized" by Trix's parser.

Trix has two concepts for it's schema, `blockAttributes` and `textAttributes`.

`blockAttributes` which are essentially top level nodes that can then contain textNodes. And `textAttributes` which
are essentially the text nodes.

Think of a `block` as a div, and `text` as inline node like a `<span>`. It's a little trickier than that since you can nest blocks,
but let's keep it simple. Anyways, `textAttributes` and `blockAttributes` despite serving similar functions, have completely
different API's.

<https://github.com/basecamp/trix/blob/main/src/trix/config/block_attributes.js>
<https://github.com/basecamp/trix/blob/main/src/trix/config/text_attributes.js>

The Wiki on configuration also offers almost no insight on how to use these attributes.

<https://github.com/basecamp/trix/wiki/Configuration>

So you largely play a guessing game until what you're trying to achieve works and hope you don't break anything else.

## Custom Attachments

Custom Attachments are an escape hatch. To me, they're meant for perhaps more complex items like an `<iframe>` that you may want to be server validate URLs and make sure users are adding safelisted URLs, but custom attachments feel more like the only way to get around issues with the schema / parser not being nearly as extensible as it could be leading to hacky implementations of common features.

For example, Lazaro Nixon shows how you can extend Trix in his [Trix Extensions](https://github.com/lazaronixon/trix-extensions) gem which as some cool features like changing the text color, multiple `<h*>` tags, etc. But even this highlights how clunky extending Trix can be.

For example, to insert an `<hr>` into the document, it has to make a full HTTP request to the
server to return back a custom attachment, instead of just allowing you insert a `<hr>` directly in the client.

<https://github.com/lazaronixon/trix-extensions/blob/595073038216eb39ed6fb5fb60151360bdc1d62e/app/javascript/richtext.js#L19>
<https://github.com/lazaronixon/trix-extensions/blob/master/app/views/action_text/attachables/content_attachments/_horizontal_rule.html.erb>

## The markup

Along the same lines, the markup by Trix is not great.

We'll keep this simple.

Trix itself does not support `<p>` tags. That's right. Everything is `<div>` and `<br>`.

Again, it's possible. But here's a look at the thread of all the workarounds to get there:

<https://github.com/basecamp/trix/issues/680>

And even then, it requires patching internals which really aren't documented and praying nothing changes.

## Morphing

Yes, Rhino Editor probably has some issues around this too. Almost any element with it's own lifecycle will. But it's kind of funny
that morphing in Turbo 8 was introduced, but it never accounted for the fact that when `<trix-editor>` first connects to the page, it
will sprout attributes, create it's own toolbar, and look like this: `<trix-editor contenteditable role="textbox" toolbar="trix-toolbar-1">`.

Because `<trix-editor>` will never re-fire it's connect, and the server only knows about this: `<trix-editor>`, the attributes will go away and leave Trix in a "broken" state. There's workarounds, but it's something you think would've been solved out of the box by people who built both Turbo and Trix.

## Collaborative editing?!

I would love to see some future where Trix allows collaborative editing, but I don't think it will ever be on the road map.

## More challenges

I'm sure there's a lot more I missed, feel free to send me links to issues or even just issues you faced on Twitter or Mastodon, and I'd be happy to add them to this post.

These are some of the frustrations I faced working with Trix and part of the reason I built [RhinoEditor](https://rhino-editor.vercel.app)

This is not a shill for RhinoEditor, although this should probably make it into the docs somewhere. If you're happy with Trix, I'm not going to stop you. But customizing and using Trix has been at times painful for me personally and led to the creation of the library.

Thanks for reading, and may your rich text editing be as peaceful as possible. ✌️
