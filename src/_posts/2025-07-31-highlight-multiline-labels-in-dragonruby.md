---
title: Highlight Multiline Labels in Dragonruby
categories: []
date: 2025-07-31
description: |
  A small tutorial on how I figured out how to wrap labels with an anchor_(y|x) set on them in DragonRuby.
published: true
---

The purpose of this post is to highlight a couple of techniques for dealing with multi line labels.

The first being that DragonRuby has a really cool technique for multi-line labels where you increment the `anchor_y` property. Like so:

```rb
def tick(args)
  lines = ["line1", "line2", "line3", "line4"]
  labels = lines.map.with_index do |text, index|
    {
      x: 1280 / 2,
      y: 720 / 2,
      text: text,
      anchor_y: index
    }
  end
  args.outputs.labels.concat(labels)
end
```

<img src="/images/highlight-multiline-labels/example-1.png">

By incrementing the `anchor_y` property by 1 everytime, the labels will be "stacked" on top of each other and you don't need to do hacky things like guess the label height, or use expensive operations like `GTK.calcstringbox(text)`.

Nope. You just get it _for free_.

## Adding a highlight on the last line

Now this works great. Easy stuff.

However, I wanted to be able to "highlight" a line. Also simple. Clone the label you want, and then

<light-code language="ruby" inserted-lines="{12-22}">
  <script type="text/plain" slot="code">
def tick(args)
  lines = ["line1", "line2", "line3", "line4"]
  labels = lines.map.with_index do |text, index|
    {
      x: 1280 / 2,
      y: 720 / 2,
      text: text,
      anchor_y: index
    }
  end

  last_label = labels[-1]
  last_label_w, last_label_h = GTK.calcstringbox(last_label.text)
  highlight_box = last_label.merge({
    w: last_label_w,
    h: last_label_h,
    r: 255,
    g: 0,
    b: 0,
    a: 255,
  })
  args.outputs.solids << highlight_box
  args.outputs.labels.concat(labels)
end
  </script>
</light-code>

<img src="/images/highlight-multiline-labels/example-2.png">

This works great! But the highlight is a little tight... what if we added some padding?

<light-code language="ruby" inserted-lines="{14-22}">
  <script type="text/plain" slot="code">
def tick(args)
  lines = ["line1", "line2", "line3", "line4"]
  labels = lines.map.with_index do |text, index|
    {
      x: 1280 / 2,
      y: 720 / 2,
      text: text,
      anchor_y: index
    }
  end

  last_label = labels[-1]
  last_label_w, last_label_h = GTK.calcstringbox(last_label.text)
  padding_left = 8
  padding_right = 8
  padding_top = 8
  padding_bottom = 8
  highlight_box = last_label.merge({
    x: last_label.x - padding_left,
    y: last_label.y - padding_bottom,
    w: last_label_w + padding_left + padding_right,
    h: last_label_h + padding_bottom + padding_top,
    r: 255,
    g: 0,
    b: 0,
    a: 255,
  })
  args.outputs.solids << highlight_box
  args.outputs.labels.concat(labels)
end
  </script>
</light-code>

<img src="/images/highlight-multiline-labels/example-3.png">

## The anchoring problem

As you saw above, the box gets thrown way out of whack...why is that? Well the reason is fairly straightforward. We changed the x / y values, but kept the same "anchor_y". By doing so, we totally threw off all the calculations.

I scoured around DragonRuby's Discord and docs and couldn't find anything.

The most I found was people using `vertical_alignment_enum: 2` which sets anchoring to the top. Yes, labels are anchored to the top-left, while everything else is anchored to bottom left, however that is actually irrelevant here since `anchor_(x|y)` override the alignment enums.

Finally, I stumbled across a method called `#anchor_rect` in the docs.

<https://docs.dragonruby.org/#/api/geometry?id=anchor_rect>

As far as I can tell, what this method will do is take our rectangle or "box", pass in the appropriate anchors, and it will return a rect with the proper X / Y values based on the anchors, without needing to specify the anchors in the actual rect object.

So what I hoped would work is to remove the padding calculations from the highlight rect, remove the anchor_y from the label merge, calculate the anchor_rect, and then do the padding calculations _after_ the anchoring has been calculated.

Something like this:

```rb
# Remove any anchors, since they'll be added in the next call.
highlight_box.anchor_x = nil
highlight_box.anchor_y = nil
highlight_box = highlight_box.anchor_rect(last_label.anchor_x || 0, last_label.anchor_y || 0)
highlight_box.tap do |box|
    box.x = box.x - padding_left
    box.y = box.y - padding_bottom
    box.w = box.w + padding_left + padding_right
    box.h = box.h + padding_bottom + padding_top
end
```

So...let's try it in action...


<light-code language="ruby" inserted-lines="{18-22,28-34}">
  <script type="text/plain" slot="code">
def tick(args)
  lines = ["line1", "line2", "line3", "line4"]
  labels = lines.map.with_index do |text, index|
    {
      x: 1280 / 2,
      y: 720 / 2,
      text: text,
      anchor_y: index
    }
  end

  last_label = labels[-1]
  last_label_w, last_label_h = GTK.calcstringbox(last_label.text)
  padding_left = 8
  padding_right = 8
  padding_top = 8
  padding_bottom = 8
  highlight_box = {
    x: last_label.x,
    y: last_label.y,
    w: last_label_w,
    h: last_label_h,
    r: 255,
    g: 0,
    b: 0,
    a: 255,
  }
  highlight_box = highlight_box.anchor_rect(last_label.anchor_x || 0, last_label.anchor_y || 0)
  highlight_box.tap do |box|
      box.x = box.x - padding_left
      box.y = box.y - padding_bottom
      box.w = box.w + padding_left + padding_right
      box.h = box.h + padding_bottom + padding_top
  end

  args.outputs.solids << highlight_box
  args.outputs.labels.concat(labels)
end
  </script>
</light-code>

<img src="/images/highlight-multiline-labels/example-4.png">

Gist of code: <https://gist.github.com/KonnorRogers/231694893ac2b148b22466594f5c7675>

Notice we removed the `last_label.merge()` because it was passing in the `anchor_y` which would've thrown off our `anchor_rect` call.

And there we have it! Adding a box around an anchored label in DragonRuby!
