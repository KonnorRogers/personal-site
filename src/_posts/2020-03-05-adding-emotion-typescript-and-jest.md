---
title: Adding Emotion, Typescript, and Jest to Gatsby
date: "2020-03-05T21:17:08"
description: A detailed description of adding emotion, typescript, jest, and react-testing-library.
---

## [Purpose](#)

The purpose of this is to detail how to add Emotion, Typescript, Jest,
and React-testing-library to an existing project.

<h3 id="table-of-contents">
  <a href="#table-of-contents">Table of Contents</a>
</h3>

- #### [Step by Step additions](#guide-start)

  - [Adding Typescript](#adding-typescript)
  - [Adding ESLint](#adding-eslint)
  - [Adding Emotion](#adding-emotion)
  - [Adding Emotion Snapshot Testing](#adding-emotion-testing)
  - [Adding Jest](#adding-jest)
  - [Adding React-testing-library](#adding-rtl)

- #### [Quick start](#quick-start)

  - [I know what I'm doing, lets do it quick](#i-know-what-im-doing)

- #### [Resources](#resources)
  - [Jest](#jest)
  - [React-Testing-Library](#rtl)
  - [Typescript](#typescript)
  - [Emotion](#emotion)
  - [ESLint](#eslint)
  - [Starter Repo](#starter-repo)

I will be going through adding the above items based on using the
[Gatsby Default Starter](https://www.gatsbyjs.org/starters/gatsbyjs/gatsby-starter-default/)

This is essentially a guide to adding the above technologies to an existing Gatsby
project.

<h3 id="adding-typescript">
  <a href="#adding-typescript">Adding Typescript</a>
</h3>

```bash
npm install --save-dev typescript
```

Typescript is now in your project! However, typescript on its own does not do much.

In addition, we must now add typescript to Gatsby.

```bash
npm install gatsby-plugin-typescript
```

Now lets add it to our `gatsby-config.js` file.

```javascript
// gatsby-config.js
modules.exports = {
  // Above code omitted
  plugins: [
    // Other plugins
    "gatsby-plugin-typescript",
  ],
}
```

Lets now configure ESLint to work with typescript
to lint our files.

<h3 id="adding-eslint">
  <a href="#adding-eslint">Adding ESLint</a>
</h3>

The Gatsby default comes with a `.prettierrc` file defined.
It does not however come with a `.eslintrc.js` defined in the root directory.
So, lets add it.

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  parser: "@typescript-eslint/parser",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": "error",
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    camelcase: "off",
    "@typescript-eslint/camelcase": ["error", { properties: "never" }],
    "react/prop-types": "off",
  },
  plugins: ["@typescript-eslint", "prettier", "react", "jest"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:jest/recommended",
  ],
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      alias: [
        ["~components", "./src/components"],
        ["~", "./src/"],
      ],
    },
  },
}
```

Add an `.eslintignore` with the following config:

```javascript
// .eslintignore
node_modules
dist
coverage
gatsby-*
```

We will also have to define a `tsconfig.json` file.

```js
// tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "esnext",
    "jsx": "preserve",
    "lib": ["dom", "esnext"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": false,
    "esModuleInterop": true,
    "noUnusedLocals": false,
    "allowJs": true,
    "baseUrl": ".",
    "paths": {
      "~*": ["src/*"],
      "~components/*": ["src/components/*"]
    }
  },
  "exclude": ["node_modules", "public", ".cache", "gatsby*"]
}
```

Next, install the packages required to get ESlint to work.

```bash
npm install --save-dev eslint @typescript-eslint/parser \
@typescript-eslint/eslint-plugin eslint-plugin-jest eslint-plugin-react \
eslint-plugin-prettier eslint-import-resolver-alias
```

We save these as dev dependencies because they are not needed for runtime files.

Now, typescript should be working in your editor of choice using ESLint.

To confirm its working from the command line, let's add some scripts to our `package.json`

```javascript
// package.json
{
  // Above code omitted
  scripts: {
    // Other scripts
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noEmit",
  }
}
```

Now we can run:

```bash
npm run type-check
npm run lint # runs eslint
```

So now, we are able to change our `.js` files to `.tsx` files. I won't go over it here,
but I will have the corrected `.tsx` files in my gatsby starter.

<h3 id="adding-emotion">
  <a href="#adding-emotion">Adding Emotion</a>
</h3>

What is emotion? Emotion is a CSS-in-JS solution similar to styled components.

I used emotion in a previous project and enjoyed using it, so I wanted to add it to this starter.

As a bonus, css-in-js snapshot testing is great for looking for style changes when we add Jest later.

```bash
npm install gatsby-plugin-emotion @emotion/core @emotion/styled
```

After this, add the following to your `gatsby-config.js`

```javascript
// gatsby-config.js
module.exports = {
  // ...
  plugins: [
    // ...additional plugins
    `gatsby-plugin-emotion`,
  ],
}
```

Now, you're all set to add emotion to your files. Again, I won't go over that here, but the updated files will be in my starter.

<h2 id="adding-jest">
  <a href="#adding-jest">Adding Jest</a>
</h2>

Now, lets add unit testing.

```bash
npm install --save-dev \
@types/jest @types/node jest ts-jest \
babel-jest react-test-renderer \
babel-preset-gatsby identity-obj-proxy
```

Just a quick note, ts-jest runs typechecking which jest does not run by default.

Add a testing scripts to `package.json`

```javascript
// package.json
module.exports {
  // ...code above omitted
  scripts: {
    // ... Above scripts omitted
    "test": "jest",
    "test:watch": "jest --watch",
    "test:watchAll": "jest --watchAll"
  }
}
```

Alright, now lets actually make jest work in Gatsby.

Create a `jest.config.js` file and add the following content:

```javascript
// jest.config.js
module.exports = {
  transform: {
    "^.+\\.[jt]sx?$": `<rootDir>/jest-preprocess.js`,
  },
  moduleNameMapper: {
    ".+\\.(css|styl|less|sass|scss)$": `identity-obj-proxy`,
    ".+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": `<rootDir>/__mocks__/file-mock.js`,
    "~(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: [`node_modules`, `\\.cache`, `<rootDir>.*/public`],
  transformIgnorePatterns: [`node_modules/(?!(gatsby)/)`],
  globals: {
    __PATH_PREFIX__: ``,
  },
  testURL: `http://localhost`,
  setupFiles: [`<rootDir>/loadershim.js`],
}
```

Now create a `jest-preprocess.js` with the following content:

```javascript
// jest-preprocess.js
const babelOptions = {
  presets: ["babel-preset-gatsby", "@babel/preset-typescript"],
}

module.exports = require("babel-jest").createTransformer(babelOptions)
```

Now, we need to add a `__mocks__` directory with a `file-mock.js` file.

```javascript
// __mocks__/file-mock.js
module.exports = "test-file-stub"
```

We'll also add a gatsby mock file `__mocks__/gatsby.js`.

```javascript
// __mocks__/gatsby.js
const React = require("react")
const gatsby = jest.requireActual("gatsby")

module.exports = {
  ...gatsby,
  graphql: jest.fn(),
  Link: jest.fn().mockImplementation(
    // these props are invalid for an `a` tag
    ({
      activeClassName,
      activeStyle,
      getProps,
      innerRef,
      partiallyActive,
      ref,
      replace,
      to,
      ...rest
    }) =>
      React.createElement("a", {
        ...rest,
        href: to,
      })
  ),
  StaticQuery: jest.fn(),
  useStaticQuery: jest.fn(),
}
```

Then we add a `loadershim.js` file.

```javascript
// loadershim.js
global.___loader = {
  enqueue: jest.fn(),
}
```

<h3 id="adding-emotion-testing">
  <a href="#adding-emotion-testing">Adding Emotion Snapshot Testing</a>
</h3>

By default, jest does not know how to serialize the css provided by Emotion. Lets change this
so we can have meaningful snapshot testing.

```bash
npm install --save-dev jest-emotion babel-plugin-emotion
```

Now, we must add this to our `jest-preprocess.js` file.

```javascript
// jest-preprocess.js
const babelOptions = {
  presets: [
    "babel-preset-gatsby",
    "@emotion/babel-preset-css-prop",
    "@babel/preset-typescript",
  ],
  plugins: ["emotion"],
}

module.exports = require("babel-jest").createTransformer(babelOptions)
```

Now we must create a `setup-test-env.js` file to be able to add the snapshot serialization.

```javascript
// setup-test-env.js
import { createSerializer } from "jest-emotion"
import * as emotion from "@emotion/core"

expect.addSnapshotSerializer(createSerializer(emotion))
```

Finally, tell your `jest.config.js` to setup this file.

```javascript
// jest.config.js
modules.exports = {
  // Above code omitted
  jest: {
    setupFilesAfterEnv: [`<rootDir>/setup-test-env.js`],
  },
  // Below code omitted
}
```

Phew, that was a lot of work simply to add testing. No wonder why no one bothers
testing anything! you could stop here if you'd like, but I really enjoy
working with [React-Testing-Library](https://github.com/testing-library/react-testing-library) So lets add that next.

<h3 id="adding-rtl">
  <a href="#adding-rtl">Adding React-Testing-Library</a>
</h3>

```bash
npm install --save-dev react-testing @testing-library/react \
@testing-library/jest-dom @types/testing-library__react
```

Now add the line `import "@testing-library/jest-dom/extend-expect"` to your `setup-test-env.js` file.

```javascript
// setup-test-env.js
import { createSerializer } from "jest-emotion"
import * as emotion from "@emotion/core"
import "@testing-library/jest-dom/extend-expect"

expect.addSnapshotSerializer(createSerializer(emotion))
```

Writing the first test

<h3 id="first-test">
  <a href="#first-test">Writing your first test</a>
</h3>

There are many ways to add tests, I prefer having a top level `__tests__` directory.

```bash
mkdir __tests__
```

In this directory is where i can add integration tests, unit tests etc.

Below is an example of one of my tested components in my starter. Just a note, i do use import
aliases so it wont be a relative path for importing.

```js
// __tests__/components/header.test.tsx
import React from "react"
import { render } from "@testing-library/react"
import Header from "~components/header"

describe("Unit testing", () => {
  test("Should render a header with the given testid", () => {
    const { getByTestId } = render(
      <Header siteTitle="test-title" className="header" data-testid="header" />
    )

    const header = getByTestId("header")
    expect(header).toHaveClass("header")
    expect(header).toHaveTextContent("test-title")
  })
})

describe("Snapshot testing", () => {
  test("Should render a header without error", () => {
    const { asFragment } = render(
      <Header siteTitle="test-title" className="header" data-testid="header" />
    )

    expect(asFragment()).toMatchSnapshot()
  })

  test("Renders a header without a siteTitle defined", () => {
    const { asFragment } = render(<Header />)

    expect(asFragment()).toMatchSnapshot()
  })
})
```

And that's it! You should be up and running using Jest / React-testing-library.
This was much longer than expected so I may add another post about adding Cypress for E2E testing.

<h3 id="quick-start">
  <a href="#quick-start">Quick Start</a>
</h3>

If you've done this before, if you know what you're doing, and feel confident,
below is the quick guide as to everything covered above. I don't recommend this
if you don't have prior experience implementing Gatsby, Typescript, Emotion, and Jest.
Proceed at your own risk.

<h4 id="i-know-what-im-doing">
  <a href="#i-know-what-im-doing">I know what I'm doing - Let's do this</a>
</h4>

```bash
# Create directories
mkdir -p __tests__/components __mocks__/

# Create files
touch jest.config.js jest-preprocess.js loadershim.js __mocks__/file-mock.js \
setup-test-env.js .eslintrc.js .eslintignore  __mocks__/gatsby.js

# add development packages
npm install --save-dev typescript eslint @typescript-eslint/parser \
@typescript-eslint/eslint-plugin eslint-plugin-jest eslint-plugin-react \
eslint-plugin-prettier eslint-import-resolver-alias @types/jest @types/node \
jest ts-jest babel-jest react-test-renderer babel-preset-gatsby \
identity-obj-proxy jest-emotion babel-plugin-emotion \
react-testing @testing-library/react @testing-library/jest-dom @types/testing-library__react

# add runtime packages
npm install gatsby-plugin-typescript gatsby-plugin-emotion @emotion/core @emotion/styled
```

```javascript
// package.json
{
  // Above code omitted
  scripts: {
    // Other scripts
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:watchAll": "jest --watchAll"
  }
}
```

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  parser: "@typescript-eslint/parser",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": "error",
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    camelcase: "off",
    "@typescript-eslint/camelcase": ["error", { properties: "never" }],
    "react/prop-types": "off",
  },
  plugins: ["@typescript-eslint", "prettier", "react", "jest"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:jest/recommended",
  ],
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      alias: [
        ["~components", "./src/components"],
        ["~", "./src/"],
      ],
    },
  },
}
```

```javascript
// .eslintignore
node_modules
dist
coverage
gatsby-*
```

```javascript
// gatsby-config.js
module.exports = {
  // ...
  plugins: [
    // ...additional plugins
    "gatsby-plugin-typescript",
    "gatsby-plugin-emotion",
  ],
}
```

```javascript
// loadershim.js
global.___loader = {
  enqueue: jest.fn(),
}
```

```javascript
// jest-preprocess.js
const babelOptions = {
  presets: [
    "babel-preset-gatsby",
    "@emotion/babel-preset-css-prop",
    "@babel/preset-typescript",
  ],
  plugins: ["emotion"],
}

module.exports = require("babel-jest").createTransformer(babelOptions)
```

```javascript
// setup-test-env.js
import { createSerializer } from "jest-emotion"
import * as emotion from "@emotion/core"
import "@testing-library/jest-dom/extend-expect"

expect.addSnapshotSerializer(createSerializer(emotion))
```

```javascript
// jest.config.js
module.exports = {
  transform: {
    "^.+\\.[jt]sx?$": `<rootDir>/jest-preprocess.js`,
  },
  moduleNameMapper: {
    ".+\\.(css|styl|less|sass|scss)$": `identity-obj-proxy`,
    ".+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": `<rootDir>/__mocks__/file-mock.js`,
    "~(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: [`node_modules`, `\\.cache`, `<rootDir>.*/public`],
  transformIgnorePatterns: [`node_modules/(?!(gatsby)/)`],
  globals: {
    __PATH_PREFIX__: ``,
  },
  testURL: `http://localhost`,
  setupFiles: [`<rootDir>/loadershim.js`],
  setupFilesAfterEnv: ["<rootDir>/setup-test-env.js"],
}
```

```javascript
// __mocks__/file-mock.js
module.exports = "test-file-stub"
```

```javascript
// __mocks__/gatsby.js
const React = require("react")
const gatsby = jest.requireActual("gatsby")

module.exports = {
  ...gatsby,
  graphql: jest.fn(),
  Link: jest.fn().mockImplementation(
    // these props are invalid for an `a` tag
    ({
      activeClassName,
      activeStyle,
      getProps,
      innerRef,
      partiallyActive,
      ref,
      replace,
      to,
      ...rest
    }) =>
      React.createElement("a", {
        ...rest,
        href: to,
      })
  ),
  StaticQuery: jest.fn(),
  useStaticQuery: jest.fn(),
}
```

```js
// tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "esnext",
    "jsx": "preserve",
    "lib": ["dom", "esnext"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": false,
    "esModuleInterop": true,
    "noUnusedLocals": false,
    "allowJs": true,
    "baseUrl": ".",
    "paths": {
      "~*": ["src/*"],
      "~components/*": ["src/components/*"]
    }
  },
  "exclude": ["node_modules", "public", ".cache", "gatsby*"]
}
```

<h3 id="resources">
  <a href="#resources">Useful Resources / Resources used</a>
</h3>

<h4 id="jest">
  <a href="#jest">Jest</a>
</h4>

- [http://jestjs.io/](http://jestjs.io/)
- [https://www.gatsbyjs.org/docs/unit-testing/](https://www.gatsbyjs.org/docs/unit-testing/)

<h4 id="rtl">
  <a href="#rtl">React-Testing-Library</a>
</h4>

- [https://www.gatsbyjs.org/docs/testing-react-components/](https://www.gatsbyjs.org/docs/testing-react-components/)
- [https://www.gatsbyjs.org/docs/testing-css-in-js/](https://www.gatsbyjs.org/docs/testing-css-in-js/)

<h4 id="typescript">
  <a href="#typescript">Typescript</a>
</h4>

- [https://www.typescriptlang.org/](https://www.typescriptlang.org/)
- [https://www.gatsbyjs.org/packages/gatsby-plugin-typescript/](https://www.gatsbyjs.org/packages/gatsby-plugin-typescript/)

<h4 id="emotion">
  <a href="#emotion">Emotion</a>
</h4>

- [https://emotion.sh/docs/introduction](https://emotion.sh/docs/introduction)
- [https://www.gatsbyjs.org/docs/emotion/](https://www.gatsbyjs.org/docs/emotion/)
- [https://www.gatsbyjs.org/packages/gatsby-plugin-emotion/](https://www.gatsbyjs.org/docs/emotion/)

<h4 id="eslint">
  <a href="#eslint">Eslint</a>
</h4>

- [https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md](https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md)
- [https://github.com/prettier/eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)
- [https://eslint.org/](https://eslint.org/)

These are not all the links I used, there was a lot of googling and stackoverflow involved,
but this is a pretty good starting point. Hope this helped! Good luck out there!

Also, here's the starter I created in the process of all this it has some additions not covered here.

<h4 id="starter-repo">
  <a href="https://github.com/ParamagicDev/gatsby-starter-emotion-typescript-and-tests">
    Starter Repository
  </a>
</h4>
