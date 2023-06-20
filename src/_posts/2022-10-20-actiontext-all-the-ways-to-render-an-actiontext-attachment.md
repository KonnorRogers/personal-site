---
title: ActionText: All the ways to render an ActionText Attachment
categories: ["actiontext", "rails", "ruby", "webdev"]
date: 2022-10-20 23:11:46 UTC
description: |
  There's so many ways to render an ActionText attachment, we can change the...---

There's so many ways to render an ActionText attachment, we can change the `app/views/active_storage/blobs/_blob.html.erb` as we saw in a previous post. This will apply to all ActiveStorage blobs. However, you may want more fine grained control for things like CustomAttachments. You'll also find some of the ways to change a models ActionText rendering method:

- `to_trix_content_attachment_partial_path`
- `to_attachable_partial_path`
- `to_partial_path`

https://github.com/rails/rails/blob/b96ddea5f0b4ff8ed6e9dfe4df62f7571b147b11/actiontext/lib/action_text/attachable.rb#L70-L76

These methods are particularly useful when creating Custom Attachments. We won't cover those in this post, but that's where the above methods will come into play.

Let's talk about what each does:

## to_trix_content_attachment_partial_path

Under the hood Rails calls `value.to_trix_html` when you render within your Trix editor using the `rich_text_area` form helper.

```erb
<%= form_with model: @post do |f| %>
  <!-- calls @post.body.to_trix_html -->
  <% f.rich_text_area :body %> 
<% end %>
```

https://github.com/rails/rails/blob/0c97d1db023de4df6d2df8829e5ee311ff0d0e28/actiontext/app/helpers/action_text/tag_helper.rb#L36

So `to_trix_content_attachment_partial_path` is what users will see in their editor.

## to_attachable_partial_path

When the user hits save, then the editor will show the final output by calling:

`to_attachable_partial_path`

This allows you to create 2 experiences, one for the editor, and one for the final rendering.

## to_partial_path

`to_partial_path` is a standard rendering path for models. This is used as a shortcut for `to_attachable_partial_path` and `to_trix_content_attachment_partial_path`. 

For more on `to_partial_path` it's worth checking out this Thoughtbot article on rendering.

https://thoughtbot.com/blog/rendering-collections-in-rails

Here's what it may look like all together in an actual attachable model:

### With an ActiveRecord Model

```rb
class User < ApplicationRecord
  include ActionText::Attachable

  # app/views/users/_mention.html.erb 
  # rendered in final rendering
  def to_attachment_partial_path
    "users/mention"
  end

  # app/views/users/_thumbnail.html.erb
  # rendered in Trix editor
  def to_trix_content_attachment_partial_path
    "users/thumbnail"
  end

  # app/views/users/_user.html.erb
  # rendered when calling <%= render User.first %>
  def to_partial_path
    "users/user"
  end
end
```

### With a non-ActiveRecord model

```rb
class Youtube
  include ActiveModel::Model
  include ActiveModel::Attributes
  include GlobalID::Identification
  include ActionText::Attachable

  # to be eligible to create an "sgid" we need to implement an 
  #   "id" attribute.
  attribute :id

  # app/views/youtubes/_embed.html.erb 
  # rendered in final rendering
  def to_attachment_partial_path
    "youtubes/embed"
  end

  # app/views/youtubes/_thumbnail.html.erb
  # rendered in Trix editor
  def to_trix_content_attachment_partial_path
    "youtubes/thumbnail"
  end

  # app/views/youtubes/_youtube.html.erb
  # rendered when calling <%= render Youtube.first %>
  def to_partial_path
    "youtubes/youtube"
  end
end
```

### Conclusion

- `to_trix_content_attachment_partial_path` is for rendering in the editor
- `to_attachable_partial_path` is for rendering in the final output
- `to_partial_path` is for standard object rendering


For more on Attachments, particularly custom attachments checkout the following resources:

- https://www.youtube.com/watch?v=2iGBuLQ3S0c
- https://afomera.dev/posts/2022-10-11-combined-mentions-part-one
- https://afomera.dev/posts/2022-10-12-combined-mentions-part-two
- https://gorails.com/episodes/at-mentions-with-actiontext
- https://dev.to/yarotheslav/how-to-embed-youtube-videos-with-actiontext-tldr-5bbh
