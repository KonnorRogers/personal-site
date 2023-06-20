---
title: Why Jest is not for me
categories: jest, javascript, webdev, react
date: 2021-10-27 03:39:40 UTC
description: |
  Why make this at all?      I don't enjoy bashing other people's hard work. This isn't meant...
---

<h2 id="why-make-this-article">
  <a href="#why-make-this-article">
    Why make this at all?
  </a>
</h2>

I don't enjoy bashing other people's hard work. This isn't meant to disparage anyone from using Jest or to put down the creators of Jest. This is purely opinion. This post was inspired by these tweets:

<https://twitter.com/matteocollina/status/1453029660925861901>

<https://twitter.com/melissamcewen/status/1453116278445678598>

In addition, this post was also inspired by some issues I had integrating WebComponents into an existing Create-React-App that was using an older version of Jest / JSDOM.

<h2 id="guiding-principles">
  <a href="#guiding-principles">
    Guiding Principles
  </a>
</h2>

Let's start with one of my big gripes with Jest. Jest is a Node environment attempting to mock out a real DOM via JSDOM. It's essentially a hybrid framework. Now, in the abstract, this is fine.

The problem I have is that nowhere in the Jest documentation can I find this. At least, not immediately, I don't doubt that it is there somewhere, its just not in my face and up front.

Where did I find this info? Well, I was debugging an issue with our React app at work not playing nicely with Web Components. We use Create-React-App, so naturally, the first place I turned was CRA's documentation on testing. It is here that I discovered that Jest isnt quite Node and isnt quite a browser, its some weird in between.

> Create React App uses Jest as its test runner. To prepare for this integration, we did a major revamp of Jest so if you heard bad things about it years ago, give it another try.

> Jest is a Node-based runner. This means that the tests always run in a Node environment and not in a real browser. This lets us enable fast iteration speed and prevent flakiness.

> While Jest provides browser globals such as window thanks to jsdom, they are only approximations of the real browser behavior. Jest is intended to be used for unit tests of your logic and your components rather than the DOM quirks.

> We recommend that you use a separate tool for browser end-to-end tests if you need them. They are beyond the scope of Create React App.

<https://create-react-app.dev/docs/running-tests>

So basically, Jest is a unit test framework. Thats fine. The problem comes when you begin to realize a lot of people are using Jest like its an E2E solution. Jest / React have a number of functions that make you believe you're rendering in a browser, but you're not. For example, lets look at an example from Create-React-App.

<https://create-react-app.dev/docs/running-tests/#testing-components>

```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
```

That looks pretty close to what we would do in a real DOM to render our app! So why would we think it is not operating in a real browser?!

You think you're in a DOM, but you're really not. It looks like a duck, it quacks like a duck, but maybe its a swan? or a goose? /honk

<h2 id="mocked-dom">
  <a href="#mocked-dom">
    The Pitfalls of a Mocked DOM
  </a>
</h2>

So you may be thinking, "fine, just use Jest for unit tests." And this is correct, use it for unit tests. The problem is that if you import a web component (or any component for that matter) that relies on some sort of DOM function being available (looking at you [`window.matchMedia`](https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom>)) you're on the hook to mock it out yourself.

Now what if you're relying on a third party component that uses these mocked out functions in some way to produce side-effects and you want to know about them?

Well, you gotta implement a system test. Now what if despite all the mocking in the world, you just cant get it to work, now you're stuck mocking out an entire component, which isn't great. We'll talk more about mocking out ESM packages in the next section.

A mocked DOM makes you feel like you're working in a real DOM, but because its not a real DOM, it can give users false confidence in their tests.

<h2 id="the-module-problem">
  <a href="#the-module-problem">
    The Module Problem
  </a>
</h2>

While we're on the subject of mocking out a package, lets talk about Jest and modules. Jest has come a long way in this regards, but still does not fully support ES Modules. It also does not support mocking ES Modules (which I dont think any framework does, and I think its a good thing). This means, in order to mock a package, you must transform it into CJS, and then mock it out. `"transformIgnorePatterns"` ring any bells? <https://jestjs.io/docs/tutorial-react-native#transformignorepatterns-customization>

So now you're transpiling what you're testing by changing it from ESM to CJS which are similar, but not 100% the same. This changes your `import` syntax to `require` syntax. Part of the issue of Jest is that it's a full fledged batteries included framework (this is a double edged sword) that wraps your code and executes it. By wrapping your code and executing, you're moving further away from how your app is actually used and can lead to subtle bugs and difference in behavior.

<h2 id="why-is-jest-used">
  <a href="#why-is-jest-used">
    Why use Jest at all?
  </a>
</h2>

Given the above info that Jest is a large framework with a number of quirks including not fully supporting ES Modules, running in a weird hybrid space that isnt quite Node ([Jest actually has different globals from Node](https://github.com/facebook/jest/issues/2549)) but isn't quite a browser, why would anyone use it?

Well, the short answer is integrations. Jest has a first-class integration story with React. Jest is married to React (it makes sense, both are developed by Facebook) and most frontend developers have some familiarity with React. People like to test with what they're familiar with. Jest is familiar for a lot of developers and _just works_ for most use-cases.

Jest is very much a batteries included framework. It's designed to work well in certain projects, but in other projects, can produce nightmares that are hard to debug and can cause unexpected behavior.

<h2 id="what-is-recommended">
  <a href="#what-is-recommended">
    Okay, if not Jest, then what?
  </a>
</h2>

My personal preferences for unit-testing is split between Node based tests and browser based tests. 

For Node, I lean towards [UVU](https://github.com/lukeed/uvu) by [@lukeed](https://twitter.com/lukeed05) due to its simplicity. Its lightweight, fast, supports ESM out of the box. It feels like an easier to setup modern Mocha (without the wide array of plugins).

For browsers, I lean heavily towards [Web-Test-Runner](https://modern-web.dev/docs/test-runner/overview/) by the folks over at [@modern_web_dev](https://twitter.com/modern_web_dev). Web-Test-Runner is an opinionated browser based unit test framework that runs in a full DOM environment, is super fast, and has the option to run as system tests via E2E frameworks like Playwright or Puppeteer by turning on a config option and adding a package.

<https://modern-web.dev/docs/test-runner/browser-launchers/overview/>

<h2 id="closing-thoughts">
  <a href="#closing-thoughts">
    Closing Thoughts
  </a>
</h2>

If Jest works for you use it. Much of the problems I have faced with Jest have been addressed in [Jest 26.5](https://github.com/facebook/jest/blob/main/CHANGELOG.md#2650) which comes with [JSDOM 16.4](https://github.com/facebook/jest/pull/10578) which added support for WebComponents.

I don't think Jest is necessarily bad, I just think Jest can be deceiving. If it works for you, continue doing what works. I'm not going dissuade you from being productive or testing your code.

