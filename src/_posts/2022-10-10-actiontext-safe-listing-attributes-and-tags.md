---
title: "ActionText: Safe listing attributes and tags"
categories: actiontext, rails, ruby, webdev
date: 2022-10-10 01:12:52 UTC
description: |
  To safelist tags and attributes in ActionText we need to inspect the source since I was unable to...
---

To safelist tags and attributes in ActionText we need to inspect the source since I was unable to find anywhere in the documentation how to do so.

Rails has a separate gem for sanitizing which can be found here:

https://github.com/rails/rails-html-sanitizer

The gem is utilized within ActionText by the content helper here:

https://github.com/rails/rails/blob/4328d0e16028a46bba79ab775e509a743ceaf18c/actiontext/app/helpers/action_text/content_helper.rb#L7-L10

What we can do with these `mattr_accessor`s is override them by creating an `initializer`.

We can create a file called `config/initializers/action_text.rb` and fill it with some custom contents for allowable things. Let's say for example we wanted to add table editing. We'd need to add `<table>`, `<tr>`, `<td>`, `<th>`, `<thead>`, and `<tbody>`.

In addition, we may also want to add some additional attributes which we could also do here say perhaps `target` for links.


```rb
# config/initializers/action_text.rb

# Add table tags
ActionText::ContentHelper.allowed_tags += ["table", "tr", "td", "th", "thead", "tbody"]

# Add link attributes
ActionText::ContentHelper.allowed_attributes += ["rel", "target"]
```

You can also see an example from @excid3 's latest ActionText episode:

https://github.com/gorails-screencasts/modify-actiontext-html-output/blob/master/config/initializers/action_text.rb

https://gorails.com/episodes/modify-and-customize-actiontext-html-output?autoplay=1

If you're feeling real wild, you could even replace the sanitizer and scrubber with your own custom sanitizer / scrubber!
