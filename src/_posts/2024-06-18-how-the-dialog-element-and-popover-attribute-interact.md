---
title: How the dialog element and the popover attribute interact
categories: []
date: 2024-06-18
description: |
  A brief explanation of how the dialog element and the popover attribute interact and what happens when used together.
published: true
---

## Foreword

This post is the result of [Cory LaViska](@claviska) nerd sniping me at 11pm on the last day of my mini-vacation. (Thanks Cory)

## Purpose

A quick overview of how the `<dialog>` element and the `popover` attribute interact and what happens when used together.

This post is largely just a reference for future me to remember how this stuff works.

For more in-depth accessibility and knowledge about these APIs, I recommend the checking out these 2 blog posts:

[Popover Accessibility](https://hidde.blog/popover-accessibility/)

[Popover Semantics](https://hidde.blog/popover-semantics/)

## Let's get started

If you've been following along with the latest HTML developments, you'll find we've gotten 2 awesome new features for building "popup" interfaces.

We have the `<dialog>` element and the `popover` attribute. For a little history, the `<dialog>` element seemed to have landed first (no I didn't fact check it, but `<dialog>` has more support at the time of this writing).

Skipping over a lot of details, the `<dialog>` element shipped with 2 main functions for showing it.

`dialogElement.show()` - Shows the dialog as "non-modal" meaning you can still interact with the content behind it. It is closable by clicking outside of it, via ESC key, button, or `dialog.close()`, and **DOES NOT** set other elements to `inert` or "focus trap". Dialogs shown this way **WILL NOT** appear in the top layer.

`dialogElement.showModal()` - Shows the dialog as "modal", meaning it will set all other elements outside of the dialog to `inert`, "focus trap" for you, and is only closable via a `<button>`, calling `dialog.close()`, or hitting the <kbd>ESC</kbd> key. Dialogs shown this way **WILL** appear in the top layer.

As for `popover`, according to MDN:

> Popovers created using the Popover API are always non-modal.

So, to sum it up a `<dialog popover>` is a "light-dismissable non-modal dialog".

> "What the heck is a "light-dismissable non-modal dialog?!"

Well, it means you can close the `<dialog>` element by clicking outside of it and can interact with content outside of the dialog. In addition, by using the popover attribute, you get closure of other popovers, additional accessibility properties, and it will appear in the top layer. (Thank you Hidde <https://ruby.social/@hdv@front-end.social/112635922000818174>)

Currently, there is no declarative equivalent for modal dialogs. But there is an issue open about it: <https://github.com/openui/open-ui/issues/736>

## TLDR:

- `<dialog popover>` is a superset to doing `dialog.show()`. A non-modal, light dismissable dialog appearing in the "top layer".
- `dialog.showModal()` (no declarative equivalent) is a "modal dialog" that can only be closed via a button, ESC key, or `dialog.close()`. And will be shown in the "top layer"

## Closing thoughts

When talking about `popover`, we specifically were talking about `popover="auto"`. `popover="manual"` will not give you the light dismiss functionality or closure of other popovers.

## Example

Here's a fun little example of the differences between the two types of dialogs:

<light-preview wrap="hard">
  <template slot="code">
    <dialog id="modal-dialog">
      Modal Dialog
      <br>
      <form method="dialog">
        <button>Close Dialog</button>
      </form>
    </dialog>

    <dialog id="popover-dialog" popover>
      Popover Dialog
      <br>
      <button popovertarget="popover-dialog">Close Dialog</button>
    </dialog>

    <button id="modal-trigger">
      Show modal dialog
    </button>

    <br><br>

    <button popovertarget="popover-dialog">
      Show popover dialog
    </button>

    <script type="module">
      document.querySelector("#modal-trigger").addEventListener("click", () => {
        document.querySelector("#modal-dialog").showModal()
      })
    </script>
  </template>
</light-preview>

## Additional Reading

- "Dialog with popover like triggers": <https://github.com/openui/open-ui/issues/741>
- "Modal dialog trigger without JavaScript": <https://github.com/openui/open-ui/issues/736>
- "Have some way of opening `<dialog>` elements without JavaScript": <https://github.com/whatwg/html/issues/3567>
- "Should we deprecate `dialog.show()`": <https://github.com/whatwg/html/issues/9376>
- Dialog Element MDN: <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog>
- Popover attribute MDN: <https://developer.mozilla.org/en-US/docs/Web/API/Popover_API>

