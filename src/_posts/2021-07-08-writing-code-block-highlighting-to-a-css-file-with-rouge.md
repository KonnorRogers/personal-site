---
title: Writing code block highlighting to a CSS file with Rouge.
categories: rouge, ruby, bridgetown, css
date: 2021-07-08 22:41:45 UTC
description: |
  Purpose   To remind myself how to do this again in the future.           How to do it?   To...
---

## Purpose

To remind myself how to do this again in the future.

## How to do it?

To append a Rouge theme to an existing file you can do the following:

```rb
gem install rouge
irb

require "rouge"
theme = Rouge::Themes::Github.new.render
File.open("<path-to-file>", "a+") { |f| f.write(theme) }
```

## All themes

https://github.com/rouge-ruby/rouge/tree/master/lib/rouge/themes