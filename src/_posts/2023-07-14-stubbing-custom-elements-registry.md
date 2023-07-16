---
title: Stubbing the Custom Elements Registry
categories: []
date: 2023-07-14
description: |
  In this post we'll walk through how we can stub the custom elements registry to do
  things like enable multiple registration using things like Proxies and Sinon.
published: true
---

So today I was working on a fun problem, testing custom element registrations in
[Shoelace](https://shoelace.style).

Now if you've worked with [CustomElementsRegistry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry) before you'll know that if you try to register the same element
twice you'll get a browser error.

Now I ran into a lot of issues around `Illegal Invocation` errors when trying to call
`window.customElements.define` with [Sinon](https://sinonjs.org/).

After a while of searching around, I found the issue was it needs a different `this` applied to it.

Here's the final product of how I stubbed the registry:

```ts
import Sinon from "sinon";

let counter = 0

// These tests all run in the same tab so they pollute the global custom element registry.
// Some tests use this stub to be able to just test registration.
function stubCustomElements() {
  const map = new Map<string, CustomElementConstructor>();

  Sinon.stub(window.customElements, 'get').callsFake(str => {
    return map.get(str);
  });

  const stub = Sinon.stub(window.customElements, "define")
  stub.callsFake((str, ctor) => {
    if (map.get(str)) {
      return
    }

    // Assign it a random string so it doesnt pollute globally.
    const randomTagName = str + "-" + counter.toString();
    counter++;

    // This is where the real magic happens.
    // if you do `stub.wrappedMethod(randomTagName, ctor)` you'll get "Illegal Invocation" errors.
    stub.wrappedMethod.apply(window.customElements, [randomTagName, ctor]);
    map.set(str, ctor);
  })
}


beforeEach(() => {
  Sinon.restore()
})
```

Accompanying PR: <https://github.com/shoelace-style/shoelace/pull/1450/files#diff-a71e8b19f6ab790d5006ce8091a82544b2355d3988f8508df89bdf9f6ea7e8b9>

## Bonus Section!

So the above uses Sinon, which if you have plans to patch registrations to the registry
for other reasons...well maybe you don't want to pull in a stubbing library. Let's
look at how we could build it with a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

```ts
let counter = 0;

// These tests all run in the same tab so they pollute the global custom element registry.
// Some tests use this stub to be able to just test registration.
function stubCustomElementsRegistry() {
  const map = new Map();

  const proxy = new Proxy(window.customElements, {
    get(target, prop, receiver) {
      if (prop === "define") {
        return function (...args) {
          const [str, ctor] = args as Parameters<CustomElementRegistry['define']>;

          if (map.get(str)) {
            return
          }

          // Assign it a random string so it doesnt pollute globally.
          const randomTagName = str + "-" + counter.toString();
          counter++;

          // We still need to call the original function to be able to register the element.
          const originalFunction = target[prop]
          originalFunction.apply(target, [randomTagName, ctor]);

          map.set(str, ctor);
        }
      }

      if (prop === "get") {
        return function (str) {
          return map.get(str);
        }
      }

      return Reflect.get(...arguments);
    },
  });
  Object.defineProperty(window, 'customElements', {
    value: proxy,
    configurable: true
  });
}

beforeEach(() => {
  stubCustomElements()
})
```

The above had a lot, but I want to highlight one important bit. The reason it took
so long for me to get the Proxy to work is because the `originalFunction` needed to have
the original version of `window.customElements` and not the Proxy.

```js
// We still need to call the original function to be able to register the element.
const originalFunction = target[prop]
originalFunction.apply(target, [randomTagName, ctor]);
```

Now with that in place we can test constructor functions of our customElements which was
my use-case! If you need to test `createElement` lifecycle functions, you may need to
additionally add a stub onto their to check your map for your random element.

Anyways, here's a small test case I used in Shoelace:

```js
it('Should register "scopedElements" when the element is constructed the first time', () => {
  class MyElement extends ShoelaceElement {
    static scopedElements = { 'sl-button': SlButton }
    static version = "random-version"
  }

  expect(Boolean(window.customElements.get('sl-button'))).to.be.false;

  MyElement.define('sl-element');

  // this should be false until the constructor is called via new
  expect(Boolean(window.customElements.get('sl-button'))).to.be.false;

  // We can call it directly since we know its registered.
  new (window.customElements.get("sl-element"))

  expect(Boolean(window.customElements.get('sl-button'))).to.be.true;
});
```
