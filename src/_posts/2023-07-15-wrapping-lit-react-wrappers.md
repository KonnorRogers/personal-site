---
title: Wrapping Lit React Wrappers
categories: []
date: 2023-07-15
description: |
  In this post we'll walk through how you can take a Web Component, wrap it with @lit-labs/react, and wrap
  it again to provide your own lifecycle hooks.
published: true
---

Recently I had been working through some tree-shaking issues in [Shoelace](https://shoelace.style)'s
React Wrappers. While I was there I noticed that we use [Lit Labs React Wrappers](https://https://www.npmjs.com/package/@lit-labs/react). Now the first problem was Shoelace relied on auto-defining components.

To effectively tree-shake and open up the possibility of [Scoped Custom Elements](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Scoped-Custom-Element-Registries.md) in the future
I had to split out auto-registering and non-auto-registering routes. The next step after that
was getting our React wrappers to define their underlying custom element when they get rendered.

Now I thought this would be easy, but turns out I didn't want to add JSX transpiling to our bundle.

I'll save you the steps I went through and give you the final product of how to wrap a
React Wrapper from `@lit-labs/react`.

```ts
import * as React from 'react';
import { createComponent } from '@lit-labs/react';
import SlButton from '@shoelace-style/shoelace/dist/components/button/button.component.js';

const tagName = "sl-button"

const component = createComponent({
  tagName,
  elementClass: SlButton,
  react: React,
  events: {},
  displayName: "SlButton"
})

class SlButtonComponent extends React.Component<Parameters<typeof component>[0]> {
  constructor (...args: Parameters<typeof component>) {
    super(...args)

    // Register the customElement. Technically we could do this on `componentDidMount()` as well.
    if (!customElements.get(tagName)) {
      customElements.define(tagName, SlButton)
    }
  }

  render () {
    const { children, ...props } = this.props
    return React.createElement(component, props, children)
  }
}

export default SlButtonComponent;
```

Now technically `createComponent` could be considered a side-effect. I haven't looked
at the Lit implementation. To get TS types right it takes a little bit more work, but we could also do
something like this where we dont define the component until the constructor has been initialized.

```ts
import * as React from 'react';
import { createComponent } from '@lit-labs/react';
import SlButton from '@shoelace-style/shoelace/dist/components/button/button.js';

const tagName = "sl-button"
const events = {
  onSlChange: "sl-change"
} as const

type SlButtonComponentType = ReturnType<typeof createComponent<SlButton, typeof events>>
type Props = Parameters<SlButtonComponentType>[0]

class SlButtonComponent extends React.Component<Props> {
  // Make it static so we only evaluate this once instead of for every instance.
  static component: SlButtonComponentType = createComponent({
    tagName,
    elementClass: SlButton,
    react: React,
    events,
    displayName: "SlButton"
  })

  constructor (...args: ConstructorParameters<typeof React.Component<Props>>) {
    super(...args)

    // Register the customElement. Technically we could do this on `componentDidMount()` as well.
    if (!customElements.get(tagName)) {
      customElements.define(tagName, SlButton)
    }
  }

  render () {
    const { children, ...props } = this.props
    return React.createElement(SlButtonComponent.component, props, children)
  }
}

export default SlButtonComponent;
```

As you can see using a component that lives within the class requires a bit more work
to get the typings right. The beauty of both examples above is we didn't need JSX!

`React.createElement` was all we needed! The class based components are what I showed here, but
you could also use hooks if you're more familiar!

Here's how we could do it using hooks and functional components:

```ts
import * as React from 'react';

import { createComponent } from '@lit-labs/react';
import SlButton from '@shoelace-style/shoelace/dist/components/button/button.component.js';

const tagName = "sl-button"

const component = createComponent({
  tagName,
  elementClass: SlButton,
  react: React,
  events: {},
  displayName: "SlButton"
})

function SlButtonComponent (props: Paramaters<typeof component>[0]) {
  React.useEffect(() => {
    // Register the customElement on initial mount.
    if (!customElements.get(tagName)) {
      customElements.define(tagName, SlButton)
    }
  }, [])


  const { children, ...props } = props
  return React.createElement(component, props, children)
}

export default SlButtonComponent;
```

## Conclusion

And that ends this fun exploration into how we can take a React component created
by Lit and extend it to create our own component to do additional work on lifecycles.

I used this in [Shoelace](https://shoelace.style) to be able to define our custom elements
without side-effects to allow for tree-shakeable bundles!

Here the PR if you're interested. (As of this blog post still WIP)

<https://github.com/shoelace-style/shoelace/pull/1450>

