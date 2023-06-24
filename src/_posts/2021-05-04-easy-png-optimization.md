---
title: PNG optimization from the command line
date: "2021-05-04T09:43:02"
description:
  Optimize your pngs from the command line using
  pngquant and bash
---

<h2 id="installation">
  <a href="#installation">
    Installation
  </a>
</h2>

First step...install [pngquant](https://pngquant.org/)

If you're on MacOS, simply do:

```bash
brew install pngquant
```

<h2 id="commands">
  <a href="#commands">
    Running pngquant
  </a>
</h2>

The next step is to run pngquant on all your files you wish to optimize.

For example, if I have my `.png` files in my `app/assets/images`
directory, I would do the following:

```bash
cd app/assets/images

# Grab all png's by recursing through current directory.
# Quality and speed can be adjusted to personal needs.
# this is what I use.
pngquant ./**/*.png -quality 65-80 -speed 1
```

This will generate a bunch of files with the `-fs8.png` suffix like so:

```bash
.
├── file-1.png
├── file-1-fs8.png
├── file-2.png
├── file-2-fs8.png
├── file-3.png
├── file-3-fs8.png
├── file-4.png
└── file-4-fs8.png
```

Im sure theres a way to have `pngquant` overwrite your files, but this
lets me do an easy comparison of before / after sizes. Then I'll rename
the newly optimized files to overwrite their original file.

<h2 id="bash-command">
  <a href="#bash-command">
    Bash Command
  </a>
</h2>

This is the command I use to rewrite all my newly optimized images to
overwrite their parent. Use with caution :)

```bash
for FILE in ./**/*-fs8.png; do original=${FILE%%-fs8.png}; mv "$FILE" "$original.png"; done
```

<h2 id="pulling-it-all-together">
  <a href="#pulling-it-all-together">
    Pulling it all together
  </a>
</h2>

Quick easy command to do it all at once.

```bash
pngquant ./**/*.png -quality 65-80 -speed 1
for FILE in ./**/*-fs8.png; do original=${FILE%%-fs8.png}; mv "$FILE" "$original.png"; done
```

By using this method, I
managed to get my ~2-4mb PNGs in a site I'm working on down to
~100-400kb.

Thats it! May your png's be forever optimized!
