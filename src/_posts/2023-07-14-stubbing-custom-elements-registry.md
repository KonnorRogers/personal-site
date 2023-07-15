---
title: Stubbing the Custom Elements Registry
categories: []
date: 2023-07-14
description: |
  Stubbing the Custom Elements Registry In Web Test Runner
published: false
---

So today I was working on a fun problem, testing custom element registrations in
[Shoelace](https://shoelace.style).

Now if you've worked with [CustomElementsRegistry](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry) before you'll know that if you try to register the same element
twice you'll get a browser error.

Here's the final product:

```js
// These tests all run in the same tab so they pollute the global custom element registry.
// Some tests use this stub to be able to just test registration.
function stubCustomElementsRegistry() {
  const map = new Map();

  Sinon.stub(window.customElements, 'get').callsFake(str => {
    return map.get(str);
  });

  const proxy = new Proxy(window.customElements.define, {
    apply(target, thisArg, argumentsList) {
      const [str, ctor] = argumentsList as Parameters<CustomElementRegistry['define']>;

      if (map.get(str)) {
        return
      }

      // Assign it a random string so it doesnt pollute globally.
      const randomTagName = str + "-" + counter.toString();
      counter++;
      target.apply(thisArg, [randomTagName, ctor]);

      map.set(str, ctor);
    }
  });
  Object.defineProperty(window.customElements, 'define', {
    value: proxy,
    configurable: true
  });
}
```
