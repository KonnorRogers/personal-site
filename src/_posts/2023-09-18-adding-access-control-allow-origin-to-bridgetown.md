---
title: Adding Access-Control-Allow-Origin Header to Bridgetown
categories: []
date: 2023-09-18
description: |
  A brief guide to adding the Access-Control-Allow-Origin header to Bridgetown
published: true
---

I'll keep this brief. I was playing around with `<iframe>`s for displaying previews of source code.
The problem is they require certain cross-origin headers, in my case `Access-Control-Allow-Origin`.

Originally, I tried using the new [Roda Initializer](https://www.bridgetownrb.com/docs/configuration/initializers#adding-roda-blocks)
but to no avail. I don't know if I did something wrong or what happened.

Anyways, I decided to try [rack-cors](https://github.com/cyu/rack-cors) and it worked for me!

Here's what I did.

First, I added `rack-cors` to my Gemfile.

```bash
bundle add rack-cors
```

Then, I went to `config.ru` and made it look like the following:

```rb
# config.ru

require "bridgetown-core/rack/boot"
require "rack-cors"

Bridgetown::Rack.boot

use Rack::Cors do
  allow do
    origins '*'
    resource '*', headers: :any, methods: [:get, :post, :patch, :put]
  end
end

run RodaApp.freeze.app # see server/roda_app.rb
```

And here's the diff.

```diff
# config.ru

require "bridgetown-core/rack/boot"
+ require "rack-cors"

Bridgetown::Rack.boot

+ use Rack::Cors do
+  allow do
+    origins '*'
+    resource '*', headers: :any, methods: [:get, :post, :patch, :put]
+  end
+ end

run RodaApp.freeze.app # see server/roda_app.rb
```

And now my static assets are served with the following header: `Access-Control-Allow-Origin: "*"`

Short, sweet, to the point.
