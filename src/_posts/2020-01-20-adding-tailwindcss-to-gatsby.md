---
title: Adding tailwindcss to a Gatsby project
date: "2020-01-20T02:26:43"
description: Details on how to add tailwindcss to a Gatsby project.
---

## Prerequisites

Node (preferably 8+, I used 11.15.0)<br />
Npm (I used 6.7.0)<br />
Git (Gatsby requires Git to pull in starters)<br />

## Note to windows users

I wrote this tutorial with intent for Unix based users. Whenever you see the
command `touch` it just means create a file and `mkdir` means create a directory (folder).
Also, I wrote filepaths with Unix based OS'es in mind.

## TLDR

For the full tutorial below [Click here](#full-tutorial)

### For new projects

```bash
npm install --global gatsby-cli
gatsby new tailwind-gatsby-project
cd tailwind-gatsby-project
```

### For new or existing projects

```bash
npm install gatsby-plugin-postcss
npm install --save-dev tailwindcss
npx tailwind init

touch postcss.config.js
mkdir src/styles
touch src/styles/tailwind.css
```

<br />

<strong>1. Add gatsby-postcss-plugin to `./gatsby-config.js`</strong>

```javascript
// ./gatsby-config.js
module.exports = {
  // Above code omitted for brevity
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-plugin-postcss`,
    // Below code omitted for brevity
  ],
}
```

<br />

<strong>2. Add the following values to `./postcss.config.js`</strong>

```javascript
// ./postcss.config.js

const tailwindcss = require(`tailwindcss`)

module.exports = {
  plugins: [tailwindcss(`./tailwind.config.js`), require("autoprefixer")],
}
```

<br />

<strong>3. Add tailwindcss directives to `./src/styles/tailwind.css`</strong>

```css
/* ./src/styles/tailwind.css */
@tailwind base
@tailwind utilities;
@tailwind components;
```

<br />

<strong>
  4. Add tailwindcss globally by importing it in `gatsby-browser.js`
</strong>

```javascript
// ./gatsby-browser.js

import "./src/styles/tailwind.css"
```

<br />

<strong>
  5. Add a tailwind style to a an item in `./src/pages/index.js` to test that
  its working
</strong>

```javascript
// ./src/pages/index.js

// Above code omitted for brevity
<h1 className="bg-red-500">Hi people</h1>
// Below code omitted for brevity
```

<br />

<strong>6. Start up your server</strong>

```bash
gatsby develop
```

<br />

<strong>
  7. Navigate to `localhost:8000` to see if Tailwind is working. That's it!
</strong>

<h2 id="full-tutorial"> Full tutorial</h2>

If you already have a Gatsby project feel free to skip ahead to the
[Adding to an existing project section](#adding-to-an-existing-project)

<strong>
  1. First, start by creating a new Gatsby project. The easiest way to do so is:
</strong>

```bash
npm install --global gatsby-cli
```

<br />

<strong>2. Then to create a new project:</strong>

```bash
gatsby new tailwind-gatsby-project
```

<br />

This will create a new Gatsby project called `tailwind-gatsby-project`

<strong>3. Now, navigate into the project directory:</strong>

```bash
cd tailwind-gatsby-project
```

<br />

Make sure running `gatsby develop` works before moving on.

<h2 id="adding-to-an-existing-project"> Adding to an existing project</h2>

<strong>
  4. Add
  [gatsby-plugin-postcss](https://www.gatsbyjs.org/packages/gatsby-plugin-postcss/)
  package
</strong>

```bash
npm install gatsby-plugin-postcss
```

<br />

<strong>5. Add gatsby-postcss-plugin to `gatsby-config.js`</strong>

```javascript
// ./gatsby-config.js
module.exports = {
  // Above code omitted for brevity
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-plugin-postcss`,
    // Below code omitted for brevity
  ],
}
```

<br />

<strong>6. Create a `postcss.config.js` file in the root directory</strong>

```bash
touch postcss.config.js
```

<br />

<strong>7. Add the following content to `postcss.config.js`:</strong>

```javascript
// ./postcss.config.js

const tailwindcss = require(`tailwindcss`)

module.exports = {
  plugins: [tailwindcss(`./tailwind.config.js`), require("autoprefixer")],
}
```

<br />

<strong>
  8. Add the [TailwindCSS](https://tailwindcss.com/docs/installation) package
</strong>

```bash
npm install --save-dev tailwindcss
```

<br />

<strong>9. Create a directory called in `styles` in the `src` directory</strong>

```bash
mkdir src/styles
```

<br />

<strong>
  10. Create a stylesheet called `tailwind.css` in the `src/styles` directory
</strong>

```bash
touch src/styles/tailwind.css
```

<br />

<strong>11. Add the following content:</strong>

```css
/* ./src/styles/tailwind.css */

@tailwind base;
@tailwind components;
@tailwind utilities;
```

<br />

<strong>
  12. To add tailwind styles globally, import it in `gatsby-browser.js`
</strong>

```javascript
import "./src/styles/tailwind.css"
```

<br />

Everything should now be working! However, we currently have no way of telling.
Lets add a tailwind style to the index page.

<strong>
  13. Add a tailwind style to the `<h1></h1>` tag in `src/pages/index.js`
</strong>

```javascript
// ./src/pages/index.js

// Above code omitted for brevity
<h1 className="bg-red-500">Hi people</h1>
// Below code omitted for brevity
```

<br />

<strong>14. Run `gatsby-develop`</strong>

You should now see a red background for the text that says "Hi people". This
lets you know tailwind is working as expected! Hope this worked for you getting
TailwindCSS setup in Gatsby.

Make sure if you still have the server from earlier running to shut it down and
restart it.

## Links

### My github repo using Tailwind and Gatsby

[Reference Repository](https://github.com/ParamagicDev/tailwind-gatsby-project)

### Gatsby

[Gatsby](https://www.gatsbyjs.org)<br />
[Gatsby + Tailwind tutorial](https://www.gatsbyjs.org/docs/tailwind-css/)<br />
[Using CSS in Gatsby](https://www.gatsbyjs.org/tutorial/part-two/#creating-global-styles-with-standard-css-files)<br />

### Tailwind

[TailwindCSS](https://tailwindcss.com/)<br />
[TailwindCSS Installation](https://tailwindcss.com/docs/installation)<br />
