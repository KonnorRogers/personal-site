---
title: Converting a callback to a promise
categories: javascript, webdev
date: 2022-03-13 01:45:42 UTC
description: |
  Sometimes you want your synchronous function to run asynchronously. Perhaps you want to run multiple...
---

Sometimes you want your synchronous function to run asynchronously. Perhaps you want to run multiple functions asynchronously using something like `Promise.allSettled` or `Promise.all`.

I have a number of setup functions that dont depend on each other in an application and I was curious how hard it would be to convert the setup functions to async functions without touching their internal code. (Some functions come from libraries)

The TLDR is that yes, I managed to do it.

```js
function asPromise (callback, ...args) {
  return new Promise((resolve, reject) => {
    try {
      resolve(callback(...args))
    } catch(e) {
      reject(e)
    }
  })
}
```

Now for some examples:

```js
function greet (greeting, name) { return "${greeting}, {name}" } 
await asPromise(greet, "hi", "konnor") 
// => "hi, konnor"
```

Now what if we pass an object?

```js
function greet ({greeting, name}) { return "${greeting}, {name}" } 
await asPromise(greet, {greeting: "hi", name: "konnor"}) 
// => "hi, konnor"
```

And finally, what about an array?

```js
function greet (ary) {
  return `${ary[0]}, ${ary[1]}`
}

await asPromise(greet, ["hi", "konnor"])
// => "hi, konnor"
```

Are there edge cases? Probably. Mostly around `this`

if your function calls rely on `this` make sure to bind within the Promise like so:

```js
await asPromise(myFunction.bind(myThis), "arg1")
```

And that's all for today! Short and sweet.