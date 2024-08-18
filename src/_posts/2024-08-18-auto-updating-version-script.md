---
title: Auto Updating Version Script for NPM
categories: []
date: 2024-08-18
description: |
  Create an automatic version updater for your NPM packages without using replacer functions.
published: true
---

Something I like to do for my web components is provide a `version`.

The library I work on for my day job is [Shoelace](https://shoelace.style)

We set a `version` in every component by setting a placeholder and then ESBuild will use a "replacer" function to change the placeholder to a proper string.

It works for Shoelace, but I was contemplating if there was a way to do this _without_ needing to use heavy handed build tooling.

## The approach

First, I knew I wanted a git-tracked file to store the version.

So I made a `internal/version.js` file.

Roughly looks like this:

```js
// internal/version.js
export const version = "1.0.0"
```

So then in my `BaseElement` I can do something like this:

```js
// internal/base-element.js

import { version } from "./version.js"

export class BaseElement extends HTMLElement {
  static version = version
}
```

Easy!

Now, the hard part is getting that `internal/version.js` to update whenever we use the `npm version` command.

## Adding auto updating

I came across this issue: <https://github.com/npm/npm/issues/8620>

Which pointed me here: <https://docs.npmjs.com/cli/v10/commands/npm-version#description>

Which basically amounts to:

- `"preversion"` will have the old version. We don't want that. We want the new version we're bumping to.
- `"version"` and `"postversion"` will have the new version.
- `"version"` is where files should be added prior to tagging, `"postversion"` is meant for doing cleanup.

So based on the above, I wanted the "new" package version, and I wanted to add a file as part of versioning. So I wanted the `"version"` hook.

In my `package.json` I added the `"version"` hook to point a `scripts/update-version.js`, a file we will make in the next section.

So here's roughly what our `package.json` should look like:

```json
// package.json
{
  "scripts": {
    "update-version": "node ./scripts/update-version.js"
    "version": "npm run update-version && git add internal/version.js"
  }
}
```

In the above, make sure to have the `git add internal/version.js` so your tagged commit will have updated version number.

## Writing our update script

Writing the update script is fairly straightforward.

<role-tab-list>
  <role-tab slot="tab">ESM</role-tab>
  <role-tab slot="tab">CJS</role-tab>

  <role-tab-panel slot="panel">
<%= markdownify(<<~JS
```js
// scripts/update-version.js

import * as fs from "fs"
import * as path from "path"
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const __filename = url.fileURLToPath(new URL(import.meta.url));

const filepath = path.relative(process.cwd(), __filename)

const version = process.env.npm_package_version
// console.log("VERSION: ", version)
if (!version) {
  console.error(`"${filepath}" must be run via NPM's runner. Use: "npm run update-version" for this to work properly.`)
  process.exit(1)
}

const data = `// This file is auto-generated. Do not manually edit this.
export const version = "${version}";`

fs.writeFileSync(path.resolve(__dirname, "../internal/version.js"), data)
```
JS
) %>
  </role-tab-panel>

  <role-tab-panel slot="panel">
<%= markdownify(<<~JS
```js
// scripts/update-version.js

const fs = require("fs")
const path = require("path")

const filepath = path.relative(process.cwd(), __filename)

// This gets set by `npm run`
const version = process.env.npm_package_version

if (!version) {
  console.error(`"${filepath}" must be run via NPM's runner. Use: "npm run update-version" for this to work properly.`)
  process.exit(1)
}

// This is what will get written to `internal/version.js`
const data = `// This file is auto-generated. Do not manually edit this.
export const version = "${version}";`

fs.writeFileSync(path.resolve(__dirname, "../internal/version.js"), data)
```
JS
) %>
  </role-tab-panel>
</role-tab-list>


Now, whenever we run `npm version [patch | minor | major]` our `internal/version.js` will always stay up to date! I hope this was helpful!
