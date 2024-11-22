---
title: Object Element Loading Is Weird
categories: []
date: 2024-11-22
description: |
  Object Element Loading Is Weird. Lets dive into a weird quirk of `<object>` loading I discovered.
published: true
---

As the post implies the `<object>` element has some...interesting rules about if it will load its data.

So in its simplest form we can make an `<object>` load data by doing the following:

```js
const obj = document.createElement("object")
obj.data = "<url>"
```

However, this will not load anything until you "connect" it to the DOM:

```js
document.body.append(obj)
```

Now the browser will "fetch" the URL and either load or error.

## The use case

Let's talk about why I'm doing the above quickly.

In [Rhino Editor](https://rhino-editor.vercel.app), an issue was recently raised where on throttled connections an XHR request may show as complete, but the server never actually finished receiving the request. So I had the brilliant idea of "re-fetching" the uploaded file to guarantee that the file uploaded.

The "easiest" way to do this I _thought_ was using an `<object>` element.

PR: <https://github.com/KonnorRogers/rhino-editor/pull/227>

Issue: <https://github.com/KonnorRogers/rhino-editor/issues/226>

## Where everything went wrong

So initially I tried to be clever and hide the `<object>` element inside of a `<template>` to prevent layout shifting, something like the following:

```js
    const template = document.createElement("template");
    const obj = document.createElement("object");
    template.append(obj);

    obj.onload = () => {
      template.remove()
      this.progress = 100;
      this.setUploadProgress();
      this.element.dispatchEvent(new AttachmentUploadSucceedEvent(this));
      this.element.dispatchEvent(new AttachmentUploadCompleteEvent(this));
    };

    obj.onerror = () => {
      template.remove();
      this.handleError();
    };

    obj.data = blobUrl;
    // Needs to append to body for onerror / onload to fire.
    document.body.append(obj);
```

As it turns out, Safari 17.5 will not load an `<object>` element inside of a `<template>`.

Firefox 132 and Chrome 131 *will* load an `<object>` inside of a `<template>`

### Trying display: none;

Okay. No biggie. Let's try making it `display: none;` we may hit CSP issues, but lets at least try it.

```js
    const obj = document.createElement("object");
    obj.style.display = "none"

    obj.onload = () => {
      obj.remove()
      this.progress = 100;
      this.setUploadProgress();
      this.element.dispatchEvent(new AttachmentUploadSucceedEvent(this));
      this.element.dispatchEvent(new AttachmentUploadCompleteEvent(this));
    };

    obj.onerror = () => {
      obj.remove();
      this.handleError();
    };

    obj.data = blobUrl;
    // Needs to body append to for onerror / onload to fire.
    document.body.append(obj);
```

The following will not load in Chrome 131, Safari 17.5, but _will_ load in Firefox 132.

Now I _kind of_ expected this, but I was curious more than anything.

## Why not just use fetch?

I tried it, and for some reason it still did not guarantee the file actually loaded. `<object>` did however work with throttled connections.

## `<embed>` , `<iframe>` anything?

I also tried using the `<embed>` and `<iframe>` elements.

`<embed>` will never fire the `"load"` event for CSV files in Firefox / Chrome, even with proper mime types set.

`<iframe>` will attempt to download the resource, which can be stopped with the `sandbox` attribute, but in Chrome it never fires the `load` event when I pass it a CSV.

## Final thoughts

Browsers behaving slightly differently on this stuff is always annoying. I hope this saves someone some time in the future debugging why their `<object>` won't load.

It seems detecting uploads completed and are accessible via a loading element is a pipe dream, and fetch may just have to do, despite in my tests not always 100% working.
