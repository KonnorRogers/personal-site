---
title: Jest, Vitest, and WebComponents
categories: jest, vitest, shadowdom, webcomponents
date: 2022-11-22 17:46:45 UTC
description: |
  Purpose   Jest and the newer Vitest are inextricably linked with frontend testing tools....
---

## Purpose

Jest and the newer Vitest are inextricably linked with frontend testing tools. While I personally do not care for these tools, its important to understand a lot of projects are tied to them. As a result, even though their web component support / DOM mocking isn't the best, we should at least look at what it does support.

## Shadow Root rendering

Jest underwent a major revamp and received support for web components around version [26.5.0](https://github.com/facebook/jest/blob/main/CHANGELOG.md#2650) when it introduced JSDOM version [16.2.0](https://github.com/jsdom/jsdom/blob/master/Changelog.md#1620) which added the ability to render shadow roots. Prior to this version, rendering of shadowRoots would not work as expected, so its important if your project is using shadowRoots, you make sure to check what version of JSDOM / Jest you're using.

## Mocking more of the DOM

This major revamp also included a number of mocks for built-in 
browser functions such as MutationObserver, document.createRange, and many others.

However, there are still some notable missing functionalities such as `matchMedia`, `IntersectionObserver`, `ResizeObserver`, and more that I'm sure I haven't bumped into. So if your WebComponents use these, make sure to mock those too!

https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom

## Jest transforms

I don't believe Vitest has this issue due to using ESM transforms via Vite, but when using Jest its important to remember that it expects CommonJS files, but will not transform node_modules for you. Many WebComponent libraries do not ship CJS files. So if you have an NPM package that ships ESM, you'll want to tell Jest to transform it via the `"transformIgnorePatterns"`.

For example, if I were using Shoelace, I'd do this:

```json
    "transformIgnorePatterns": ["node_modules/?!(@shoelace-style)"]
```

for more on transformIgnorePatterns, check this out:

https://jestjs.io/docs/tutorial-react-native#transformignorepatterns-customization

## Focus order and keyboard events

I've noticed focus order and keyboard events can get messed up in JSDOM. Here's a spot where I don't have a fix. I've noticed that JSDOM does not always behave as expected with these and the only thing I can chalk it up to is that its dispatching events rather than sending the real actions to a browser.

JSDOM and Jest / Vitest come with so many caveats for WebComponents and browser testing in general, I can't recommend them in good faith. Nobody browses the web in JSDOM. If you hook up a custom runner to Jest that uses a real browser, now you're cookin'! I guess all this to say most of my beef lies with JSDOM and not necessarily Jest itself...

There are other projects like [Playwright](https://playwright.dev/) and [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/) which will give you a real browser to work with and more closely mirror how your users will use your components.