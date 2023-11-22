---
title: Run A Vim Macro On Every File
categories: []
date: 2023-11-21
description: |
  Run A Vim Macro On Every File
published: true
---

I'll keep this short sweet and simple. You have a vim macro you recorded. `qq` for example.
This will record a macro under `@q`. If you did `qa` you would do `@a` to call the macro.

To call this macro on every file in a list, we can make an `arglist` of all files using a wildcard.

```vim
:args *.js
:argdo execute "normal @q" | write | update
```

Or on all open buffers:

```vim
:bufdo execute "normal @q" | write | update
```
