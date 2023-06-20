---
title: ActionText: Modify the rendering of ActiveStorage attachments
categories: ["actiontext", "rails", "ruby", "webdev"]
date: 2022-10-04 21:39:36 UTC
description: |
  If you have not already, make sure to run both the ActiveStorage and ActionText installers...---

If you have not already, make sure to run both the ActiveStorage and ActionText installers respectively.

The ActiveStorage generator should create a file that looks like this:

`app/views/active_storage/blobs/_blob.html.erb`

```erb
<figure class="attachment attachment--<%= blob.representable? ? "preview" : "file" %> attachment--<%= blob.filename.extension %>">
  <% if blob.representable? %>
    <%= image_tag blob.representation(resize_to_limit: local_assigns[:in_gallery] ? [ 800, 600 ] : [ 1024, 768 ]) %>
  <% end %>

  <figcaption class="attachment__caption">
    <% if caption = blob.try(:caption) %>
      <%= caption %>
    <% else %>
      <span class="attachment__name"><%= blob.filename %></span>
      <span class="attachment__size"><%= number_to_human_size blob.byte_size %></span>
    <% end %>
  </figcaption>
</figure>
```

You can modify this file however you see fit. For example, you may want to provide custom overrides onto these dimensions for things like retina rendering or other optimizations.

The reason I took the time to document this is because I noticed when I turned on file annotations for rendering partials, this is what showed up:

```html
<!-- BEGIN /Users/konnorrogers/.asdf/installs/ruby/3.1.2/lib/ruby/gems/3.1.0/gems/actiontext-7.0.4/app/views/action_text/contents/_content.html.erb -->
```

Other use cases include using something like tailwind and adjusting the produced markup!

I'll be documenting more undocumented things from ActionText as I go along and hopefully will upstream them into the official Rails guides!