---
title: The Different Ways To SSR Web Components
categories: []
date: 2024-09-13
description: |
  A small post about the different ways we can SSR web components. This isn't about hydration, or the actual techniques, but rather a general way of "expanding" a custom element tag.
published: true
---

This post won't talk about "isomorphic node + browser templates", or things like "hydration", or any other numerous ways to "actually" SSR a web component if you were building a library. Shadow DOM + DSD vs light DOM. No. I really don't feel like having that discussion.

No, instead this post is "broad strokes" about how to "expand" a custom element.

How do we take this:

```html
<my-button>Do the thing.</my-button>
```

And "expand" it and do something like:

```html
<my-button>
  <button>Do the thing.</button>
</my-button>
```

^ This is something like you would see from a library like [WebC](https://github.com/11ty/webc) or [Enhance](https://enhance.dev)

Or if you're writing components that use shadow DOM like [Lit](https://lit.dev), then it would expand the tag using [Declarative Shadow DOM](https://web.dev/articles/declarative-shadow-dom):

```html
<my-button>
  <template shadowrootmode="open">
    <button>
      <slot></slot>
    </button>
  </template>
  Do the thing.
</my-button>
```

And before you ask, "no". This post will not detail the benefits and drawbacks of each approach.

Moving on, there's 2 "general" ways to expand these elements.

## Using the final HTML

Using the final HTML and parsing through all the tags seems to be a fairly common approach I see. This is what Enhance WASM SSR does (to my knowledge) where it will take the final HTML, iterate through all the elements, and then "expand" the ones it knows are Enhance components based on a list of components you feed into the WASM plugin.

Example from the Rails SSR plugin:

<https://github.com/enhance-dev/enhance-ssr-ruby-on-rails/blob/main/app/controllers/home_controller.rb>

<light-code language="ruby"  highlight-lines="{8-14}" style="--syntax-highlight-bg: rgba(0, 250, 25, 0.08);">
  <script type="text/plain" slot="code">
    class HomeController < ApplicationController
      def index
        path = Rails.root.join('lib', 'enhance-ssr.wasm')
        manifest = Extism::Manifest.from_path path
        plugin = Extism::Plugin.new(manifest, wasi:true)

        element_path = Rails.root.join('app', 'views', 'elements')
        elements = read_elements(element_path)
        markup = "<my-header>Hello World</my-header>"
        initial_state = {}
        data = { "markup" => markup, "elements" => elements, "initialState" => initial_state }
        payload = JSON.pretty_generate(data)
        html_document = JSON.parse(plugin.call("ssr", payload))["document"]
        render html: html_document.html_safe
      end
    end

    def read_elements(directory)
      elements = {}
      Dir.foreach(directory) do |filename|
        next if filename == '.' || filename == '..' # Skip current and parent directory entries
        file_path = File.join(directory, filename)
        if File.file?(file_path)
          key = File.basename(filename, ".*")
          elements[key] = File.read(file_path)
        end
      end
      elements
    end
  </script>
</light-code>

In particular, lets focus on lines `8-14` What it is essentially doing is you pass all markup to the WASM plugin, you tell the WASM plugin what elements it can expand, and then it will go through and expand those elements. Lit's 11ty integration does roughly the same thing.

You take a chunk of HTML, you iterate through, and then you "expand" the elements you know how to expand.

The major benefit of this is most users don't need to actively think about the SSR process. Its a one-shot post-render step.

## Per call site rendering

The other option is "per call site rendering" where instead of having to parse HTML, you have a "method" call to your server, process, whatever, that will render the fully expanded tag. No post render processing, just inline, what you call is what you get. I'm sure there's examples out there of libraries that actually do it, but im lazy and dont feel like searching. I'm a Rails dev at heart, so here's a "per call site SSR" pseudo code:

```erb
<%%= ssr_render "my-component" %>
```

Which will output:

```html
<my-component>
  <!-- Fill the rest in -->
</my-component>
```

Now the benefit to this approach is you don't have any post-render HTML parsing, the downside is a user has to opt-in and actively choose to SSR the component. Which in some cases, may be a good thing because not every element needs to be SSRed, but thats for another day.

## Conclusion

So the question is, do you want the users to need to do more work, but have more control? Or would you prefer 1 shot post-render operation?

I don't have the answer, but these are *generally* the 2 approaches I can think of for "expanding" a web component.

If there are other ways you can think of, please let me know and I'd love to add an update to the post!
