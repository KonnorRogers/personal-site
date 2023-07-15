---
title: Wrapping Lit React Wrappers
categories: []
date: 2023-07-12
description: |
  Wrapping Lit React Wrappers
published: false
---

```ts
import * as React from 'react';
import { createComponent } from '@lit-labs/react';
import Component from '@shoelace-style/shoelace/dist/components/button/button.component.js';

const tagName = '${component.tagName}'

const component = createComponent({
  tagName,
  elementClass: Component,
  react: React,
  events: {
    ${events}
  },
  displayName: "${component.name}"
})

${jsDoc}
class SlComponent extends React.Component<Parameters<typeof component>[0]> {
  constructor (...args: Parameters<typeof component>) {
    super(...args)
    Component.define(tagName)
  }

  render () {
    const { children, ...props } = this.props
    return React.createElement(component, props, children)
  }
}

export default SlComponent;
```
