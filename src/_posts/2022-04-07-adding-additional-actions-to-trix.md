---
title: Adding additional actions to Trix
categories: ["trix", "rails", "webdev", "javascript"]
date: 2022-04-07 14:37:03 UTC
description: |
  It's not documented how to add additional "actions" to Trix.  Current actions can be found...---

It's not documented how to add additional "actions" to Trix.

Current actions can be found here:

https://github.com/basecamp/trix/blob/7940a9a3b7129f8190ef37e086809260d7ccfe32/src/trix/controllers/editor_controller.coffee#L301-L318

But how do we make additional actions?

It appears an action is an object:

```js
{
  test: Boolean,
  perform: void
}
```

So `test` is like "hey should we perform the action?"

and `perform` is what gets called if `test === true`. Seems reasonable. 

Now to the hard part, I couldn't find any docs to add an additional Trix action. 

But, in sleuthing through the console I found this:

```js
document.querySelector("trix-editor").editorController.actions

/* 
Object { 
  attachFiles: Object { test: test(), perform: perform() }
  decreaseNestingLevel: Object { test: test(), perform: perform() }
  increaseNestingLevel: Object { test: test(), perform: perform() }
  link: Object { test: test() }
  redo: Object { test: test(), perform: perform() }
  undo: Object { test: test(), perform: perform() }
}
*/
```

So it appears we can add additional actions by tapping into the `editorController.actions` on a currently active instance of "trix-editor".

So a simple example to add an action may look like this:

```js
document.addEventListener('trix-initialize', updateActions);

function updateActions() {
  const editors = document.querySelectorAll("trix-editor")
  const myAction = { test: true, perform: console.log("Hi!") }
  editors.forEach((editor) => Object.assign(editor.editorController.actions, { myAction })
}
```

And now when we add an item to the toolbar, we should be able to do something like this to trigger our action:

```html
<button data-trix-action="myAction"></button>
```

This is a small precursor to me exploring table support, but figured I'd share as it took a while to track down!