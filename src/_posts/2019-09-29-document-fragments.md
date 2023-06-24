---
title: JS - Appending multiple children to an element
date: "2019-09-29T17:34:12"
description:
  After searching and scouring the internet for the best way to append
  multiple children within the DOM at the same time, I came across
  the DocumentFragment API
---

## DocumentFragment - Appending multiple children to one or multiple elements

### Relevant Links

[DocumentFragment API via MDN](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment)
[Relevant StackOverflow answer](https://stackoverflow.com/a/36798254)
[My Github repository which uses DocumentFragment API](https://github.com/ParamagicDev/libraryBookJS)

### What is the DocumentFragment API?

Below is the description from MDN:<br />

> The DocumentFragment interface represents a minimal document object that has no parent. It is used as a lightweight version of Document that stores a segment of a document structure comprised of nodes just like a standard document. The key difference is that because the document fragment isn't part of the active document tree structure, changes made to the fragment don't affect the document, cause reflow, or incur any performance impact that can occur when changes are made.

<i>Key Takeaway:</i>
<br />
The key difference is that because the document fragment isn't part of the
active document tree structure, changes made to the fragment don't affect the
document, cause reflow, or incur any performance impact that can occur when
changes are made.
<br />

This means the DocumentFragment API is the go to way to append multiple elements
that do not need to be immediately rendered to the page.

### Using the DocumentFragment API

```bash
const docFrag = new DocumentFragment();
```

Thats all it takes to make a document fragment!

### Basic usage

#### Typical way of appending children

```bash
const div1 = document.createElement('div');

const div2 = document.createElement('div');
const div3 = document.createElement('div');

document.body.appendChild(div);
document.body.appendChild(p1);
document.body.appendChild(p2);
```

Everytime you append a child to a rendered portion of the browser, you are rerendering the page with each `appendChild()` call. Lets look at how we could recreate the same functionality without causing performance issues.

```bash
// Create a docFrag to add elements to
const docFrag = new DocumentFragment();

const div1 = document.createElement('div');
const div2 = document.createElement('div');
const div3 = document.createElement('div');

docFrag.appendChild(div1);
docFrag.appendChild(div2);
docFrag.appendChild(div3);

document.body.appendChild(docFrag);
```

It requires 2 simple extra lines of code but will significantly change
a users browser experience. Especially if you are doing something like
server side rendering where you create many HTML elements via JS.
This method as far as I'm aware is implemented by the major front-end frameworks like React, Vue, Angular etc.

#### Closing thoughts

I hope you found this useful and next time you go to append some children
you reach for DocumentFragment. Its a simple and easy to understand API with so
many benefits. I was very happy with how approachable it was and it was
very easy to see the benefits of the API.
