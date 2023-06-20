---
title: Querying ActiveStorage Attachments
categories: activestorage, rails, ruby, sql
date: 2021-06-25 02:52:18 UTC
description: |
  The problem   You want to find all the ActiveRecord models that either do / do not have a...
---

## The problem

You want to find all the ActiveRecord models that either do / do not have a record attached to them.

## The solution

Let's say you have a `Post` class which has one image attached like so:

```rb
class Post < ApplicationRecord
  has_one_attached :image
end
```

To query for all `Posts` that do not have an image attached the syntax would look like this:

```rb
Post.left_joins(:image_attachment).where(active_storage_attachments: { id: nil })
```

This will return all posts that do not have an image. If you want to find all posts that _have_ an image attached, you would use a `#not` clause in there like so:

```rb
Post.left_joins(:image_attachment).where.not(active_storage_attachments: { id: nil })
```

## has_many_attached

This can even be extended to `has_many_attached` by using the plural form of `:image_attachment` like so:

```rb
class Post < ApplicationRecord
  has_many_attached :images
end

# Query for all without attachments
Post.left_joins(:image_attachments).where(active_storage_attachments: { id: nil })

# Query for all with attachments
Post.left_joins(:image_attachments).where.not(active_storage_attachments: { id: nil })
```

## Final Syntax

The syntax for attachments is fairly straightforward like so:

```rb
ModelName.left_joins(:<attachment_name>_attachment[s]).where(active_storage_attachments: { <column>: <value> })
```

And thats it! Good luck and enjoy your new found query power!