---
title: Exploring Slash Commands Accessibility
categories: []
date: 2024-04-23
description: |
  An article in which I explore accessibility of various slash command / suggestion implementations
published: true
---

## What we'll be doing

Exploring the accessibility of various "slash commands" or "suggestion" implementations in rich text editors and plain text editors.

## Foreword

This is a first pass document. There's very little editing / proofreading. Read at your own risk.

I am not an accessibility professional. If accessibility is paramount, please consult accessibility experts. I'm just someone who knows just enough to be dangerous.

This isn't meant to attack any companies or implementations. This is for learning purposes.

Due to time constraints, for this article I'll be using VoiceOver on MacOS and Firefox v125.

Part of the reason for not using Safari is because Firefox + VoiceOver has always been good for me
when using Comboboxes / Menus which is what we'll be exploring. Safari has some odd behavior with comboboxes.

Most users use NVDA / JAWS with Windows + Chrome. That is the ideal testing environment for accessibility testing,
but this article is less about the actual readings, and more about the actual structure of the slash commands.

I won't be pasting the full HTML, but rather small snippets of the general pattern with relevant pieces. Pasted HTML will be from when the suggestions are in the "expanded" state.

## Getting started

There's a few implementations of "slash commands" I can think of.

- GitHub
- Discord
- Slack
- TinyMCE
- Notion

So, let's see what they do!

### GitHub

GitHub has implemented "slash commands", also known as "suggestions" if you're familiar with ProseMirror Suggestion API for things like mentions.

Holy crap GitHub! This was so hard to get your HTML. Anytime I clicked in the devTools, the suggestions disappeared. I had to use a `setTimeout(() => alert("YO"), 5000)` and then open the suggestions to freeze it to be able to inspect the HTML. Well played.

```html
<textarea
  role="combobox"
  aria-controls="<wrapper-around-listbox-below>"
  aria-activedescendant="slash-command-item-code"
  aria-haspopup="listbox"
  aria-autocomplete="list"
></textarea>

<ul role="listbox">
  <li role="option" aria-selected="true">
    <form></form>
    <!-- other stuff -->
  </li>
</ul>
```

Now this is what I expect! If you maintain focus on the editor while showing commands, it should be a combobox. I would think!

What's interesting to note is that the `<textarea>` does not have a `role="combobox"` until it has a suggestion to show. So it dynamically adds the role. Don't know if the screenreader is going to like that, but we shall see!

Regardless, this is largely what I would've expected / done.

### How does GitHub suggestions read

Survey says it reads pretty well! It reads the currently selected option, tells you how many options there are, it tells you that you're within a listbox. What's interesting is if you focus the outer `<textarea>` is still reads it as a `<textarea>` and not a combobox, but I would argue that's minor.

Good stuff GitHub!

### Bonus rant about GitHub form in a form

Points deducted because if you look closesly enough, that `<form>` within the `<li>` for the suggestions is actually wrapped by a larger `<form>`, so there's actually nested forms in the "Issue" "slash command" suggestion, but beyond that, the HTML is quite clean.

Here's a quick little peek in the console:

```js
temp1
// => <form class="js-slash-command-suggestion-form" data-turbo="false" action="/KonnorRogers/personal-site/slash_apps/e96c27a140fd4d56fbfeac0c1d8919bf1351ccba1b6b6e8459d36f48db9ba90d/code?surface=issue_body" accept-charset="UTF-8" method="post"><input type="hidden" name="authenticity_token" value="YNOHTAZdeBduRkq56uGxHN9jV-fJuqttlnvBID018LZeuDBycPf21fL2jjayNOGGcv4xUlBgcD27W6b8J8E-Ew" autocomplete="off"></form>

temp1.closest("form")
// => <form class="js-slash-command-suggestion-form" data-turbo="false" action="/KonnorRogers/personal-s…code?surface=issue_body" accept-charset="UTF-8" method="post">
```

### Discord

First off, Discord apparently calls `preventDefault()` when doing <kbd>CMD+Option+i</kbd>, so it was really annoying to open devTools.

Anyways, here's the general structure of Discord's "slash commands":

```html
<!-- This is the rich text editor -->
<div
  role="textbox"
  aria-multiline="true"
  aria-haspopup="listbox"
  aria-autocomplete="list"
  contenteditable="true"
  aria-expanded="true"
  aria-controls="uid_269"
></div>

<-- This is the autocomplete -->
<div role="listbox">
  <ul role="group">
    <div role="option" tabindex="-1">
      <!-- more divs than I can count -->
    </div>
  </ul>
</div>
```

Now we can argue about the semantics of the HTML. I'll leave that for you the reader, to scratch your head.

Anyways, it's interesting to see they went with the `listbox` approach. Now what's interesting is that the `textbox` is setup like a `combobox` by having `aria-haspoup="listbox"`, but it doesn't utilize `aria-activedescendant`. Which means they could use a "roving tabindex" approach on the listbox and it _should_ work, but it requires shifting focus off of the `textbox`, which when testing, it does not do. It keeps focus on the `textbox` and uses "virtual focus" on the commands by using `aria-selected`.

So let's move on and see how it reads.

#### Discord usage with VoiceOver

Discord froze VoiceOver whenever I tried to use slash commands. In fact, Discord froze my whole browser ever just attempting to open dev tools. And when it didn't freeze, it auto closed the opened menu. So I wasn't able to get any good information about how VoiceOver + Firefox handles it.

### Slack

Alright, on to Slack's chat slash commands!

```html
<div
  contenteditable="true"
  role="textbox"
  tabindex="0"
  aria-multiline="true"
  spellcheck="true"
  aria-activedescendant="tab_complete_ui_item_0"
></div>

<ul role="listbox">
  <li role="option" tabindex="-1"></li>
</ul>
```

Nothing flashy with the listbox. Looks nice. I like it. If you notice in GitHub and in Slack, the options have `tabindex="-1"`, this allows screenreaders to focus the item which allows it to read the "option".

(Thank you to DiegoHaz creator of AriaKit for telling me about this)

Surprising things that are missing from the `textbox`:

- `aria-haspopup="listbox"`
- `aria-autocomplete="list"`
- `aria-expanded="true"`
- `aria-controls="<idref>"`

I'm surprised these are missing, but maybe because its not technically a `role="combobox"` it may not be needed?

Let's see how it reads.

### How Slack reads suggestions

Unfortunately, whenever VoiceOver would "focus" an option in the suggestions, it would immediately cause the suggestions menu to close. I was unable to get any information on how suggestions got read.

### TinyMCE

This isn't the actual TinyMCE, but rather the CodePen from this blog post because I couldn't find a proper example on their site.

<https://www.tiny.cloud/blog/slash-commands-rich-text-editor/>

<https://codepen.io/tinymce/pen/poebmjP>

So let's start with the HTML:

```html
<iframe>
  <body
    contenteditable="true"
    aria-activedescendant="menu-item_1354807282151713924642819"
    aria-owns="autocompleter_6731546931041713924532187"
  >
  </body>
</iframe>

<div role="menu">
  <div role="menuitem"></div>
</div>
```

Again, no `aria-expanded`, `aria-haspopup="listbox"`, `aria-autocomplete="list"`. But it does have `aria-activedescendant`.

Interesting to note they are using a menu, but the menu is in the host document, not in the `<iframe>`.

I would expect the `menu` to grab focus from the editor, but also, again, we'll see. You never know until you try.

### Running the TinyMCE slash commands through the screenreader

Interestingly, it reads pretty well. It tells you you're on a menu, it doesn't seem to steal focus from the main text editor, although I can't find any `aria-selected` on the menu items, nothing tells you it's selected. I suspect TinyMCE quickly focuses the menu item, then swaps focus back to the editor. This works well on my laptop, but could possibly be jarring on a phone where it may cause the virtual keyboard to quickly disappear and reappear if the user is using VoiceOver on their phone.

(Thank you to Devon Govett for pointing that out to me when talking about Comboboxes on Twitter with me)


## Notion

Again, HTML first.

```html
<div
  contenteditable="true"
>
</div>

<div id=":r14:" tabindex="0" role="menu" aria-activedescendant=":r15:">
  <div role="menuitem" tabindex="-1" id=":r15:"></div>
</div>
```

No `aria-haspopup`, `aria-activedescendant`, `aria-expanded`, `aria-autocomplete`, `role="textbox"`.

I don't have high hopes for this. Can `<idref>`s even start with a `:`? I don't even know. Again, like TinyMCE, it uses a `role="menu"`, I imagine it'll do like TinyMCE and leave focus on the editor and use the quick swap focus trick to get menu items to read.

Let us find out.

### How Notion reads suggestions

The cursor stays on the editor and doesn't leave. When I use arrow keys to "visually select" a suggestion,
nothing gets read. I don't even get read the text. It doesn't tell me I'm on a menu. Doesn't tell me I have a `menuitem` currently focused. In fact, when I enter a contenteditable text block on Notion, it just tells me I'm within a group. It doesn't tell me I'm in a textbox, input, nothing. There is no feedback.

## Conclusion

GitHub and TinyMCE seemed to be the only ones to have usable "suggestions" or "slash commands". It was impossible to evaluate Slack's / Discord's. Slack's seemed pretty similar to GitHub's in terms of structure.

If I were to build suggestions, it seems like the most reliable way is to use `role="combobox"`. I'll probably messing around in the future with different permutations, but this seems the most solid and expected behavior.

As always, test with an actual screenreader, test with different screenreaders + browser combos (which I didn't do here, because my free time is finite), hire accessibility professionals to audit this stuff for you, involve your accessbility team if you have one, etc.

That's all I got. Best of luck on your suggestions / slash commands! I hope you learned something, I know I did!

