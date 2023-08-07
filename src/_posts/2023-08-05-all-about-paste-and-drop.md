---
title: All About Paste And Drop
categories: []
date: 2023-08-05
description: |
  All About Paste And Drop
published: false
---

```js
test("paste event fires", () => {
  // Simple spy
  let called = false
  function handleCalled () { called = true }
  document.addEventListener("paste", handleCalled)

  // Set up the paste event data
  const clipboardData = new DataTransfer()
  clipboardData.setData("text/plain", "abcde")
  const pasteEvent = new ClipboardEvent("paste", { clipboardData, bubbles: true })
  document.dispatchEvent(pasteEvent)

  // Check that it was called
  assert(called === true)
})
```

File helper:

<https://gist.github.com/KonnorRogers/04b7d65a9f0c218a65f84dd5b9a1affa>
