---
title: Understanding DragonRuby Render Targets
categories: []
date: 2025-01-03
description: |
  Understanding DragonRuby Render Targets. Why they're important, what they do, what they are, and how they work.
published: true
---

Render targets are a mythical unicorn in [DragonRuby](https://dragonruby.org/). They are the work horse that make a ton of things possible. Thinks like different lighting, blending, scaling, cameras, caching, animations, the list goes on. Render targets are probably one of the most versatile pieces of DragonRuby, and yet they're largely hidden, and their syntax being so unassuming can make it hard to spot them.

So before we continue on with use cases and why render targets are great, lets look at the syntax (because I always forget) for render targets.

<%= render Alert.new(type: :warning) do %>
  There is a different syntax using `args.render_target(:target_name)`, but we're not going to really cover that here.
<% end %>

<light-code language="ruby">
  <script type="text/plain" slot="code">
def tick(args)
  args.outputs[:black_box].w = 100
  args.outputs[:black_box].h = 100
  args.outputs[:black_box].background_color = [0,0,0,64] # r: 0, b: 0, g: 0, a: 64 (alpha)
end
  </script>
</light-code>

Thats it! You made a render target! What the above does is essentially tell DragonRuby to "create a 'virtual canvas', 100px by 100px, make its background color black, and cache the result."

Now, this doesn't do anything by itself. If you're familiar with "pointers" from C, we essentially have created a "pointer" to the render target. But in order to actually render the render target (have we said "render" enough yet?) we actually have to create a "sprite" and make its `:path` point to the render target.

Like so:

<light-code language="ruby" highlight-lines="{15}" class="sl-theme-light" style="--syntax-highlight-bg: var(--sl-color-green-200);">
  <script type="text/plain" slot="code">
def tick(args)
  # Create the render target only on the first tick. Its then cached and used indefinitely.
  if Kernel.tick_count <= 0
    args.outputs[:black_box].w = 100
    args.outputs[:black_box].h = 100
    args.outputs[:black_box].background_color = [0,0,0,64] # r: 0, b: 0, g: 0, a: 64 (alpha)
  end

  # Turn the cached render target into a "sprite"
  render_target_sprite = {
    x: 100,
    y: 100,
    w: 100,
    h: 100,
    path: :black_box # This says "use the render target"
  }

  # Render the render target
  args.outputs.sprites << render_target_sprite
end
  </script>
</light-code>

In particular, the magic happens on line 15 where we pass the `:black_box` symbol as a `path` for the sprite.

Now we can go further and do things such as creating multiple sprites using the render target, scale the sprite, angle the sprite, and perform all sorts of transforms. So here is what happens when I start overlaying them with different transforms.

<light-code language="ruby">
  <script type="text/plain" slot="code">
def tick(args)
  # Create the render target only on the first tick. Its then cached and used indefinitely.
  if Kernel.tick_count <= 0
    args.outputs[:black_box].w = 100
    args.outputs[:black_box].h = 100
    args.outputs[:black_box].background_color = [0,0,0,64] # r: 0, b: 0, g: 0, a: 64 (alpha)
  end

  # Turn the cached render target into a "sprite"
  render_target_sprite = {
    x: 100,
    y: 100,
    w: 100,
    h: 100,
    path: :black_box,
  }

  # Create an angled version and overlay it.
  angled_render_target = render_target_sprite.merge({
    angle: 45,
    angle_anchor_x: 0.5,
    angle_anchor_y: 0.5
  })

  # Scale it up 2x and render it!
  scaled_render_target = render_target_sprite.merge({
    x: 400,
    y: 400,
    w: 200,
    h: 200,
  })

  # Render the render targets
  args.outputs.sprites << [render_target_sprite, angled_render_target, scaled_render_target]
end
  </script>
</light-code>

![Picture of boxes with alpha channels overlaid](/images/dragonruby-render-targets/alpha-boxes.png)

Now this is pretty basic so far, and you could accomplish all of this without render targets. This is more showing basic syntax and how render targets are used.

Its also worth noting render targets have special behavior different from that of the standard screen.

From this doc example: <https://docs.dragonruby.org/#/samples/advanced-rendering?id=render-target-noclear-mainrb>

> Note that you can NOT opt to skip clearing the screen, only render targets. <br>
> The screen clears every frame; double-buffering would prevent correct updates between frames.

This means render targets have special behavior where as typical DragonRuby rendering clears the screen on every tick, you can actually opt to have DragonRuby not clear the render target. To access this behavior, you can use the following syntax:

`args.outputs[:my_render_target].clear_before_render = false`

## Extra word of caution on caching

Every call to `args.outputs[:render_target]` creates a new render target instance for the current `tick` (frame), thus clearing out any cached render targets from previous ticks / frames. You can see this in action below.

<light-code language="ruby" highlight-lines="{10}" class="sl-theme-light" style="--syntax-highlight-bg: var(--sl-color-green-200);">
  <script type="text/plain" slot="code">
def tick(args)
  # Create the render target only on the first tick. Its then cached and used indefinitely.
  if Kernel.tick_count <= 0
    args.outputs[:black_box].w = 100
    args.outputs[:black_box].h = 100
    args.outputs[:black_box].background_color = [0,0,0,64] # r: 0, b: 0, g: 0, a: 64 (alpha)
  end

  # This causes the render target's cache to get cleared because its creating a new "render target" every tick.
  render_target = args.outputs[:black_box]

  args.outputs.sprites << { x: 100, y: 100, w: 100, h: 100, path: :black_box }
  # the black box will only appear in the first frame, and then be gone in all subsequent ticks because the cache was cleared.
end
  </script>
</light-code>

In fact, thanks to Amir, I learned `args.outputs[:render_target]` is essentially an alias for `args.render_target(:render_target)`.

From Amir:

> `args.outputs[:render_target]` queues a render target for creation: <https://github.com/DragonRuby/dragonruby-game-toolkit-contrib/blob/df9e3bb7f2fc873eceac9bec77389bc36a0d7280/dragon/outputs.rb#L850>

So be careful!

## Other things that will "clear the cache"

> The `args.outputs` structure renders to the screen. You can render to a texture/virtual canvas using args.outputs[SYMBOL]. What ever primitives are sent to the virtual canvas are cached and reused (the cache is invalidated whenever you render to virtual canvas).
>
> <https://docs.dragonruby.org/#/api/outputs?id=render-targets-operator>

So in other words, anytime you do `args.outputs[:render_target].sprites << {}` you will clear the cache and DragonRuby will re-render the render target. Same for any labels, borders, primitives, etc.

## Go forth and (ab)use render targets!

Render targets have many, many use cases. Too many to cover here, and way too much to write. But a short list is roughly: lighting, blending, scaling, cameras, caching, animations.

For a full rundown of how versatile render target are, check out the [Advanced Rendering](https://docs.dragonruby.org/#/samples/advanced-rendering) section of DragonRuby. Its basically a love letter to how powerful render targets can be. Almost everything there uses render targets to some degree.

As an extra bonus, there are even performance improvements that can happen when using and moving a large number of primitives at once by using a render target. This is how the Camera example works for example. It uses `:scene` symbol as the render target and allows you to move many sprites at once without tanking performance.

Anyways, this is quick post about the beauty of render targets and the cool tricks they enable and problems they help solve.
