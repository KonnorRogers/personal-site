---
title: JS - How to configure webpack-dev-server live-reloading
date: "2019-10-10T23:05:07"
description: In this post, I will go over how to configure webpack and
  webpack-dev-server to allow for live-reloading similar to live-server
---

## Quick Start

[Reference Repository](https://github.com/paramagicdev/TicTacToeJS)

```bash
npm init # if it's a new project

npm install webpack webpack-cli webpack-dev-server
```

Add the following configuration in your root directory and it will allow for
live reloading as well as automatically opening the default browser

[Reference Webpack Config](https://github.com/paramagicdev/TicTacToeJS/blob/master/webpack.config.js)

```javascript
// webpack.config.js
const path = require("path")

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },

  devServer: {
    open: true,
    publicPath: "",
    contentBase: path.resolve(__dirname, "dist"),
    watchContentBase: true,
    compress: true,
  },
}
```

Then running `npx webpack-dev-server` will automatically open the default web
browser and allow automatic browser refreshing on file changes.

## In depth explanation

Alright, so there's a few assumptions when creating this configuration.

### File structure:

```project
dist/
|-- style.css
|-- index.html
src/
|-- index.js
```

```html
// dist/index.html
<html lang="en">
  <head></head>
  <body>
    <!-- Name of your webpack bundle -->
    <script src="./bundle.js"></script>
  </body>
</html>
```

It is important that the script you source, `<script src="./bundle.js></script>"`
is the same path as what is output by webpack in your `webpack.config.js` file

```javascript
// Resolves to './dist/bundle.js'
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
```

This is important because webpack-dev-server saves your new bundle into memory
and does not actually build a new `bundle.js` in your `dist/` directory.

### DevServer configuration

```javascript
// webpack.config.js

module.exports = {
  // Above code omitted for brevity
  devServer: {
    open: true, // Tells webpack-dev-server to open your default browser
    publicPath: "", // Where your webpack bundle will be sent to
    contentBase: path.resolve(__dirname, "dist"), // Where your static files are, ie: index.html
    watchContentBase: true, // Enable live-reloading
    compress: true, // no real significance here
  },
}
```

Alright, lets go through line by line

- `open: true` : Tells webpack-dev-server to automatically open the browser to the
  path provided by `contentBase`.

- `publicPath: ""` : This tells webpack where to send the bundle to. In this case, just set it to the current directory. This is prepended to

```javascript
output: {
  path: path.resolve(__dirname, 'dist'),
  filename: 'bundle.js',
}
```

So if publicPath was set to `"dist/"`, then in that case, your `bundle.js` file
would be in `./dist/dist/bundle.js` instead of `./dist/bundle.js`. Yes, it's confusing. I know, it tripped me up for a while.

- `contentBase: path.resolve(__dirname, "dist")` : This tells webpack-dev-server
  what files to watch. This should be where your static files are. IE: index.html,
  style.css, etc.., basically, anything that webpack does not touch when bundling.

- `watchContentBase: true` : This enables live-reloading, this auto-refreshes
  the browser.

In my [Tic Tac Toe Repo](https://github.com/ParamagicDev/TicTacToeJS) I see
the following output:

```bash
ℹ ｢wds｣: Project is running at http://localhost:8080/
ℹ ｢wds｣: webpack output is served from /
ℹ ｢wds｣: Content not from webpack is served from /home/krog/odin-project/javascript/TicTacToeJS/dist
### Below code omitted
```

This is telling me, if I open up `http://localhost:8080` it will automatically
display `'/index.html'` for me. Webpack output is set to `/bundle.js` Both files
will have `dist/` prepended to them because that is the directory that we are opening.

Yes. I know. Confusing.<br /><br />
Play around with my repo, play with the config.
Read the [webpack-dev-server documentation](https://webpack.js.org/configuration/dev-server/). Eventually it will click. Best of luck learning webpack!<br /><br />
If you have any questions feel free to email me: Konnor7414@gmail.com
