---
title: How to setup TailwindCSS with PostCSS and Webpack
date: "2019-10-11T02:59:29"
description: I will detail how to setup TailwindCSS with PostCSS and Webpack.
  I will do the bare minimum setup to get it working without many plugins.
---

At the time of writing, this works using Tailwind v1.1.2

## [Reference Repository](https://github.com/paramagicdev/tailwind-example)

### File structure

```project
- current_directory/
| dist/
  |-- index.html
| src/
  |-- index.js
  |-- styles.css
| package-lock.json
| package.json
| postcss.config.js
| README.md
| tailwind.config.js
| webpack.config.js
```

### CLI Commands

```bash
npm init # if new project

# install packages
npm install --save-dev \
webpack webpack-cli webpack-dev-server  \
postcss tailwindcss \
postcss-loader css-loader style-loader \

# Setup config files
&& npx tailwind init \
&& touch webpack.config.js \
&& touch postcss.config.js
```

### Configuration files

This is the default from tailwind

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
}
```

<br />
<br />

If you don't want to use webpack-dev-server you don't have to. Personally, I like
it for live-reloading in my browser. All I can really say about this is just pay
attention to paths and make sure you check the webpack documentation. They do
a far better job of explaining what is going on here.

```javascript
// webpack.config.js
const path = require("path")

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
          "postcss-loader",
        ],
      },
    ],
  },

  // Optional for webpack-dev-server
  devServer: {
    watchContentBase: true,
    contentBase: path.resolve(__dirname, "dist"),
    open: true,
  },
}
```

<br />
<br />

Feel free to add PurgeCSS, postcss-nested, postcss-import, etc here.
For the simplicity of this guide, I will not include it here.

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require("tailwindcss")("./tailwind.config.js"),
    require("autoprefixer"),
  ],
}
```

<br />
<br />

Use basic tailwind directives, this is where you would import your own
components, utilities, and base css.

```css
/* src/styles.css */

@tailwind base;

@tailwind components;

@tailwind utilities;
```

<br />
<br />

<b> This is incredibly important </b>

If you do not import './styles.css' the tailwind directives will not run
and everything you just did above will not even run.

```javascript
// src/index.js
import "./styles.css"
```

<br />
<br />

Just a simple html template to play around with

```html
<!-- dist/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Title</title>
  </head>
  <body>
    <div class="text-red-500">Test Input</div>

    <!-- Where webpack will output to -->
    <script src="bundle.js"></script>
  </body>
</html>
```

Below are commands to run your newly set up repository:

```bash
npx webpack-dev-server # This will let you view it on localhost with live-reload
npx webpack # Will build the project
```

```javascript
// package.json
{
  // ...
  "scripts": {
    "dev:watch": "webpack-dev-server --mode=development --config webpack.config.js",
    "dev:build": "webpack --mode=development --config webpack.config.js"
  }
  // ...
}
```

```bash
npm run dev:watch
npm run dev:build
```

<br />

This should get you up and running with tailwindCSS in a development environment.
I don't recommend this for production particularly because it does not have PurgeCSS.
This is meant more as a quick reference to start a project. I also recommend digging
deeper into webpacks documentation as well as PostCSS to get a better idea on how
to use both.
