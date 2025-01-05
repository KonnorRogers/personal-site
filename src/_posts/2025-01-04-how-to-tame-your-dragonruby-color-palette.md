---
title: How To Tame Your DragonRuby Color Palette
categories: []
date: 2025-01-04
description: |
  If you're like me, you constantly define colors with `{r:, g:, b:, a:}` hashes in DragonRuby. Lets looks at a different approach to keeping colors in sync.
published: true
---

A common problem I've been noticing in my DragonRuby projects is I'm not really consistent with colors in the palette. Now generally we're going to be using sprites which have their own colors defined, but it can be nice to be able to draw primitives with consistent colors.

So here's a very simple approach you can use. Feel free to extend it to fit your needs.

<light-code language="ruby">
  <script slot="code" type="text/plain">
PALETTE = {
  red: { r: 255, g: 0, b: 0, a: 255 },
  blue: { r: 0, g: 0, b: 255, a: 255 },
}
def tick(args)
  box = {
    x: 100,
    y: 0,
    w: 50,
    h: 50,
    path: :pixel
  }
  red_box = box.merge({
    **PALETTE.red,
  })
  blue_box = box.merge({
    y: 125,
    **PALETTE.blue
  })
end
  </script>
</light-code>

<%= render Alert.new(type: :warning) do %>
If you've never seen the `**` syntax in Ruby, it is basically an easy way to "merge" a hash into another hash.

Think of it like a shortcut to doing:

```rb
  blue_box = box.merge({
    y: 125,
  }).merge(PALETTE.blue)
```

Sometimes its referred to as a "double splat operator" and has other use cases for things like keyword arguments that we won't cover here.
<% end %>

The above code will produce 2 solid colored boxes like so:

![Picture of 2 boxes, one red, one blue stacked on top of each other.](/images/dragonruby-palettes/blue-red-boxes.png)
{:style="margin: 0 auto;"}

Now we could go one step further and define some "alpha" channels for our boxes.

<light-code language="ruby" inserted-lines="{4-9}">
  <script slot="code" type="text/plain">
PALETTE = {
  red: { r: 255, g: 0, b: 0, a: 255 },
  blue: { r: 0, g: 0, b: 255, a: 255 },
  alphas: {
    solid: { a: 255 },
    semi_transparent: { a: 128 },
    mostly_transparent: { a: 64 },
    transparent: { a: 0 },
  }
}
def tick(args)
  box = {
    x: 100,
    y: 0,
    w: 50,
    h: 50,
    path: :pixel
  }
  red_box = box.merge({
    **PALETTE.red,
  })
  blue_box = box.merge({
    y: 125,
    **PALETTE.blue
  })
  args.outputs.sprites << [red_box, blue_box]
end
  </script>
</light-code>

And now lets take these added alpha channels and change the blue box to be "mostly_transparent"

<light-code language="ruby" inserted-lines="{26-32}">
  <script slot="code" type="text/plain">
PALETTE = {
  red: { r: 255, g: 0, b: 0, a: 255 },
  blue: { r: 0, g: 0, b: 255, a: 255 },
  alphas: {
    solid: { a: 255 },
    semi_transparent: { a: 128 },
    mostly_transparent: { a: 64 },
    transparent: { a: 0 },
  }
}
def tick(args)
  box = {
    x: 100,
    y: 0,
    w: 50,
    h: 50,
    path: :pixel
  }
  red_box = box.merge({
    **PALETTE.red,
  })
  blue_box = box.merge({
    y: 125,
    **PALETTE.blue
  })

  mostly_transparent_blue_box = box.merge({
    y: 250,
    **PALETTE.blue,
    **PALETTE.alphas.mostly_transparent
  })
  args.outputs.sprites << [red_box, blue_box, mostly_transparent_blue_box]
end
  </script>
</light-code>

![Picture of 3 boxes, one red, one blue, and one violet stacked on top of each other.](/images/dragonruby-palettes/blue-red-transparent-boxes.png)
{:style="margin: 0 auto;"}

Did that do what you expected? Probably not. The alpha channel made it like a "violet" color, but you probably expected it to just "lighten" the box, not change the actual color. We won't dig into the "why", but just know the color of the box will change depending on the background of your canvas. If I made the canvas black for example, the box would actually darken instead of lighten.

Since we probably want a more "consistent" transform irrespective of the background, lets look at how we can add "light" / "dark" filters on top of the box. But first, lets add a "white" and "black" to our color palette which will help us write the code for light / dark filters.

<light-code language="ruby" inserted-lines="{2-3}">
  <script slot="code" type="text/plain">
PALETTE = {
  black: { r: 0, b: 0, g: 0, a: 255 },
  white: { r: 255, b: 255, g: 255, a: 255 },
  red: { r: 255, g: 0, b: 0, a: 255 },
  blue: { r: 0, g: 0, b: 255, a: 255 },
  alphas: {
    solid: { a: 255 },
    semi_transparent: { a: 128 },
    mostly_transparent: { a: 64 },
    transparent: { a: 0 },
  }
}
  </script>
</light-code>

Now that we have "black" and "white", we can use them to "overlay" on top of a box and provide lightening / darkening of the box.

To do so, we will need 2 sprites. One will be the actual box, and the other will be a box with either white / black background color and then the corresponding "alpha" channel applied to it.

<light-code language="ruby" inserted-lines="{35-56}">
  <script slot="code" type="text/plain">
PALETTE = {
  black: { r: 0, b: 0, g: 0, a: 255 },
  white: { r: 255, b: 255, g: 255, a: 255 },
  red: { r: 255, g: 0, b: 0, a: 255 },
  blue: { r: 0, g: 0, b: 255, a: 255 },
  alphas: {
    solid: { a: 255 },
    semi_transparent: { a: 128 },
    mostly_transparent: { a: 64 },
    transparent: { a: 0 },
  }
}
def tick(args)
  box = {
    x: 100,
    y: 0,
    w: 50,
    h: 50,
    path: :pixel
  }
  red_box = box.merge({
    **PALETTE.red,
  })
  blue_box = box.merge({
    y: 125,
    **PALETTE.blue
  })

  mostly_transparent_blue_box = box.merge({
    y: 250,
    **PALETTE.blue,
    **PALETTE.alphas.mostly_transparent
  })

  light_blue_box = box.merge({
    y: 375,
    **PALETTE.blue
  })
  light_blue_box_filter = light_blue_box.merge({
    **PALETTE.white,
    **PALETTE.alphas.mostly_transparent
  })

  dark_blue_box = box.merge({
    y: 500,
    **PALETTE.blue
  })
  dark_blue_box_filter = dark_blue_box.merge({
    **PALETTE.black,
    **PALETTE.alphas.mostly_transparent
  })
  args.outputs.sprites << [
    red_box, blue_box, mostly_transparent_blue_box,
    light_blue_box, light_blue_box_filter,
    dark_blue_box, dark_blue_box_filter
  ]
end
  </script>
</light-code>

![All boxes stacked](/images/dragonruby-palettes/all-boxes-stacked.png)
{:style="margin: 0 auto;"}

And there we have it! Using our palette, we wrote some boxes and even added a way to lighten / darken our sprites by overlaying another sprite with a different alpha channel!

The beauty of the palette is you can always override for one offs where needed.

You can do things like:

<light-code language="ruby">
  <script slot="code" type="text/plain">
box.merge({
  **PALETTE.blue,
  g: 255 # Mix green with blue
})

box.merge({
  **PALETTE.blue,
  a: 123 # Change to a custom alpha channel
})

# or even override the color entirely.
box.merge({
  **PALETTE.blue,
  b: 128, # change the blue to 128 instead of 255.
})
  </script>
</light-code>

Overall, I think its a fairly flexible pattern, and if you're feeling real spicy, you could structure it "semantically" where you use things like "success", "warning", "danger" for your color tokens, or you could even have numbered tokens like many popular web libraries. Heck, you could even provide both and mix / match!

<light-code language="ruby">
  <script slot="code" type="text/plain">
PALETTE = {
  red: { r: 255, g: 0, b: 0, a: 255 },
  green: { r: 0, g: 255, b: 0, a: 255 },
}
SEMANTIC_PALETTE = {
  danger: { r: 255, g: 0, b: 0, a: 255 }, # its just red!
  success: { r: 0, g: 255, b: 0, a: 255 }, # its just green!
}

COLOR_NUMBER_PALETTE = {
  red: {
    "900": { r: 255, g: 0, b: 0, a: 255 },
    "800": { r: 235, g: 0, b: 0, a: 255 },
  },
}

SEMANTIC_NUMBER_PALETTE = {
  danger: {
    "900": { r: 255, g: 0, b: 0, a: 255 },
    "800": { r: 235, g: 0, b: 0, a: 255 },
  },
}
  </script>
</light-code>

We could even do other things like make a palette class and define different themes.


<light-code language="ruby">
  <script slot="code" type="text/plain">
class Palette
  attr_accessor :theme

  # We use Ruby "constants" so that these themes are only generated once on initial startup, as opposed to generating a new hash every time we ask for the theme.
  LIGHT_THEME = {
    blue: { r: 14, g: 165, b: 233, a: 255 }
  }

  DARK_THEME = {
    blue: { r: 17, g: 158, b: 226, a: 255 }
  }

  def initialize(theme: :light)
    @theme = theme
  end

  def colors
    return DARK_THEME if @theme == :dark

    LIGHT_THEME
  end
end

def tick(args)
  if !args.state.palette
    args.state.palette = Palette.new
  end

  palette = args.state.palette

  # Implement something to switch to dark mode.
  if switch_to_dark_mode
    palette.theme = :dark
  end

  # Implement something to switch to light mode.
  if switch_to_light_mode
    palette.theme = :light
  end

  blue_box = {
    x: 0,
    y: 0,
    w: 50,
    h: 50,
    **palette.colors.blue
  }

  args.outputs.sprites << blue_box
end
  </script>
</light-code>


The world is your oyster! I thought of this pattern while I was tired of constantly doing `{r:, g:, b:, a:}` everywhere and yearned for a better way to define color tokens.

## Bonus points

Sometimes you have color palettes defined in hex codes. Thanks to Levi from the DragonRuby discord we can also define our colors as hex codes (both string and integer format)

<https://discord.com/channels/608064116111966245/608064116984250379/1277372253889232989>

And for posterity, here is the code in case the discord link wants to be silly.

<light-code language="ruby">
  <script slot="code" type="text/plain">
class ::Hash
  class << self
    def color_from(str_int, order = 432)
      if String === str_int
        str = delete_prefix("#")
        strl = str.length
        r, g, b, a = case strl
        when 1
          c = [str * 2].pack("H*").ord
          [c, c, c, c]
        when 3
          cs = (str + "f").chars
          [cs.zip(cs).flatten.join].pack("H*").bytes
        when 4
          cs = str.chars
          [cs.zip(cs).flatten.join].pack("H*").bytes
        when 6
          [str + "ff"].pack("H*").bytes
        when 8
          [str].pack("H*").bytes
        else
          raise "Invalid hex format"
        end
      elsif Integer === str_int
        case order
        when 432
          r = (str_int >> 16) & 0xff
          g = (str_int >> 8) & 0xff
          b = (str_int) & 0xff
          a = 0xff
        when 4321
          r = (str_int >> 24) & 0xff
          g = (str_int >> 16) & 0xff
          b = (str_int >> 8) & 0xff
          a = (str_int) & 0xff
        when 234
          r = (str_int) & 0xff
          g = (str_int >> 8) & 0xff
          b = (str_int >> 16) & 0xff
          a = 0xff
        when 1234
          r = (str_int) & 0xff
          g = (str_int >> 8) & 0xff
          b = (str_int >> 16) & 0xff
          a = (str_int >> 24) & 0xff
        end
      end

      {
        r: r,
        g: g,
        b: b,
        a: a
      }
    end
  end
end

# Usage
Hash.color_from("#fff")
# => { r: 255, g: 255, b: 255, a: 255 }

{}.color_from("#fff")
# => { r: 255, g: 255, b: 255, a: 255 }
  </script>
</light-code>

Also of note:

> it is not performant in the slightest but it does work

So be mindful when using hex codes, probably dont want to do this on every tick. But one time on startup initialization shouldn't be a problem.

EDIT: Thanks to TheCire from Discord for pointing out the "Color" module for predefined colors and converters!

<https://github.com/xenobrain/rubycolors/blob/main/color.rb>

That is all folks! Thanks for reading! Time to get back to making games...

