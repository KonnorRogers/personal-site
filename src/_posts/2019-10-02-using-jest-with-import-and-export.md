---
title: JS - Using Jest with Import and Export statements
date: "2019-10-02T18:20:55"
description: Using jest with import and export statements is not easy.
  I will detail how to use the ES6 based syntax in the following post.
---

# Purpose

When using new tools I like to create my own documentation of setup.<br />
In this case we will be looking at: [Jest](https://jestjs.io)<br />

Jest is a simple testing framework for javascript that uses
very similar syntax to RSpec. In fact, it even supports the \*.spec.js file extension.
I however, like to use the \*.test.js file, but you are free to do as you please.

## Quick Start

At the time of writing this, I am using Jest 24.9, Babel 7.6, and ESLint 6.5

ESLint is not necessary for this Jest to properly use the import / export syntax,
however, I like it for using prettier within my work environment.

### EDIT

I realized I never included the use of Webpack for bundling everything! I added the command below and my webpack config

```bash
# If its a new project
npm init

# install eslint, jest, and babel packages
npm install --save-dev webpack webpack-cli webpack-dev-server jest babel-jest babel-loader @babel/core @babel/preset-env regenerator-runtime eslint eslint-plugin-jest

# create a config file for jest and eslint
npx jest --init
npx eslint --init
```

Then modify eslint and jest config files accordingly.

[My webpack config](https://github.com/ParamagicDev/TicTacToeJS/blob/master/webpack.config.js)
Refer to webpack documentation for further instruction. I also have a previous writeup.
[https://paramagicdev.github.io/my-blog/javascript/webpackDevServerLiveReloading/](https://paramagicdev.github.io/my-blog/javascript/webpackDevServerLiveReloading/)

[My Jest Config](https://github.com/ParamagicDev/TicTacToeJS/blob/master/jest.config.js)
I just use the default from `npx jest --init`

[My ESLint Config](https://github.com/ParamagicDev/TicTacToeJS/blob/master/.eslintrc.js)

I simply used the default from `npx eslint --init` and chose the appropriate options for the project.
I added the following lines for use with Jest.

```javascript
module.exports = {
  // ...
  env: {
    "jest/globals": true,
  },
  extends: ["plugins:jest/recommended", "eslint:recommended"],
  plugins: ["jest"],
  // ...
}
```

[My Babel Config](https://github.com/ParamagicDev/TicTacToeJS/blob/master/babel.config.js)
There appears to be no `npx babel --init` so you must generate your own config file.
I generated my using the [Docs](https://jestjs.io/docs/en/getting-started#using-babel)
and it worked right out of the box.

```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
  ],
}
```

Now, all your tests will go into a `__tests__/` directory and you can name them
`*.test.js` and you're ready to rock and roll.

## The longer, more in depth guide

As with all projects using javascript, start with creating your package.json.<br />

```bash
npm init
```

After filling in the appropriate fields, you will have a package.json and package-lock.json
ready to go. Alternatively you can use yarn, and I actually prefer yarn for many reasons
that I will not get into in this guide.

### Installing Jest

[Jest Getting Started](https://jestjs.io/docs/en/22.x/getting-started.html)<br />

Jest's documentation is quite good. And I quite enjoyed reading it, I recommend you check it out<br />

To start run the following:

```bash
npm install --save-dev jest
```

That's it! You're done! Technically this is all you need to run Jest. However,
if you're using a non-Node based project IE: browser based project using ES6 imports,
Jest will quickly get in the way.

Also, as a quick note, if you go into your jest config, the file it searches for tests
is the `__tests__` directory. The getting started pages doesn't mention this, but
if you're like me, you like to use a seperate tests directory.

### Installing Babel

Jest uses the Node syntax of `module.exports = <variable>` and `require('<file>')`,
it will not support the `import` and `export` statements of ES6.

Luckily, people way smarter than me already thought of this,
so there is a babel transpiler for this.

To use this transpiler, you can install the following for use with Jest.

```bash
npm install --save-dev babel-jest @babel/core @babel/preset-env regenerator-runtime
```

`babel-jest`, `@babel/core`, `@babel/preset-env` are technically the only required
packages. `regenerator-runtime` according to the documentation is not needed with
NPM versions > 3/4 or Yarn. However, I included it just in case someone is using
a different package manager.

#### Adding a babel config

The next step is to add a Babel config.

[My Babel Config](https://github.com/ParamagicDev/TicTacToeJS/blob/master/babel.config.js)
There appears to be no `npx babel --init` so you must generate your own config file.
I generated my using the [Docs](https://jestjs.io/docs/en/getting-started#using-babel)
and it worked right out of the box.

```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
  ],
}
```

After adding this to the root of your project, you should be ready to start using
import / export statements wherever you want!

#### Ok, so how does this all work?

Well, based on what I have read it's super simple.
Let's take what the documentation uses.
Given the following file:

```javascript
// src/sum.js
export default function sum(a, b) {
  return a + b
}
```

```javascript
// __tests__/sum.test.js

import sum from "../src/sum.js"

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3)
})
```

So why does this work?

Well, Babel essentially takes your import statement: <br />
`import sum from "../src/sum.js";` <br />
And turns it into<br />
`const sum = require('../src/sum.js');`

And takes your export statement: <br />
`export default function sum(a, b) {`<br />
and turns it into<br />

```javascript
function sum(a, b) {
...code omitted for brevity
}
module.exports = sum
```

There are key differences when looking at import / export vs module.exports / require
if you dig further and look at the specs. I won't get into the differences here, but
there is a reason import / export statements are currently only experimental in NodeJS.

Technically, you could stop here, but I like to use ESLint to both lint and enforce code style.
If you don't tell ESLint about Jest, it will throw up many warnings. So, lets fix that.

### Installing ESLint

```bash
npm install --save-dev eslint eslint-plugin-jest
npx eslint --init
```

This will generate a eslint config file for you once you choose from the command line
options.

[My ESLint Config](https://github.com/ParamagicDev/TicTacToeJS/blob/master/.eslintrc.js)

I added the following lines for use with Jest in my `.eslintrc.js` file.

```javascript
module.exports = {
  // ...
  env: {
    "jest/globals": true,
  },
  extends: ["plugins:jest/recommended", "eslint:recommended"],
  plugins: ["jest"],
  // ...
}
```

### Closing thoughts

Setting up Jest for the first time took a bit of work, but I got it all working to
my liking and used it for testing in my [TicTacToe project](https://github.com/ParamagicDev/TicTacToeJS).
This was meant more so as a guide to myself, but if you found this helpful, feel free
to share with your friends.
