---
title: Inserting a string on the first line of every file with Vim
categories: vim, programming
date: 2023-06-13 19:15:30 UTC
description: |
  Alright here it goes, I needed to add a header to all files. There are roughly ~72 files and I didn't...
---

Alright here it goes, I needed to add a header to all files. There are roughly ~72 files and I didn't want to do it by hand. The header in question was for test files in [Shoelace](https://shoelace.style). 

I stumbled across this StackOverflow link:

<https://stackoverflow.com/questions/30541582/how-do-i-insert-the-same-line-into-multiple-files-using-vim>

Which was 99% of what I wanted, but didnt show how to use "put" without using a register.

So here's the magic few commands that saved me a bunch of time.


```
:args ./**/*.test.ts
:argdo 1put! = 'import \"../../../dist/shoelace.js\"' | write | update
```

The first line `:args ./**/*.test.ts` tells us what files we want to look at. The second line: `:argdo 1put! = 'import \"../../../dist/shoelace.js\"' | write | update` says: "On the first line, put this statement above whatever is already on the first line, save the file, then update it in Vim.

That's all I got, mostly saving this for future me who may need this!


