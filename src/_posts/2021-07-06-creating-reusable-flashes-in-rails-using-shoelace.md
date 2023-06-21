---
title: Creating reusable flashes in Rails using Shoelace
categories: rails, shoelaces, alerts, flashes
date: 2021-07-06 20:14:04 UTC
description: |
  Purpose   To document how I made a reusable flash system leveraging Shoelace + Rails       ...
---

## Purpose

To document how I made a reusable flash system leveraging Shoelace + Rails

## The Problem

We all like beautiful flashes! But sometimes it takes work to make a reusable flash system. I'm going to show how I implemented mine with Shoelace, but this could easily be extended to any other CSS framework or your own CSS.

## Building a reusable interface

There are 2 steps to building a reusable interface for flashes. The first is for the backend.

## Creating a controller concern

Flashes are accessed from a Controller, so as such, its easiest to create a controller concern called: `Flashable`

In your `app/controllers/concerns` directory, create a file called `flashable.rb`

In your `app/controllers/concerns/flashable.rb` file we're going to add a number of convenience methods to interface with flash.

Basically what we want to do is be able to call things like `flash_success("My message")` or `flash_danger("Dangerous operation!")` from a controller. So lets first start by building a `#show_flash` base.

```rb
# app/controllers/concerns/flashable.rb

module Flashable
  extend ActiveSupport::Concern

  # These are the icons that come from the Shoelace docs on Alert.
  ICONS = {
    primary: "info-circle",
    success: "check2-circle",
    info: "gear",
    warning: "exclamation-triangle",
    danger: "exclamation-octagon"
  }.freeze

  included do
    def show_flash(type, message, now: false, icon: nil)
      icon ||= ::Flashable::ICONS[type]

      hash = { message: message, icon: icon }

      return flash.now[type] = hash if now

      flash[type] = hash
    end
  end
end
```

This is the building block for our convenience methods. Our convenience methods will build off the structure we have in place here.

Our final result will look like this:

```rb
# app/controllers/concerns/flashable.rb

module Flashable
  extend ActiveSupport::Concern

  ICONS = {
    primary: "info-circle",
    success: "check2-circle",
    info: "gear",
    warning: "exclamation-triangle",
    danger: "exclamation-octagon"
  }.freeze

  included do
    def flash_primary(message, now: false, icon: nil)
      show_flash(:primary, message, now: now)
    end

    def flash_success(message, now: false, icon: nil)
      show_flash(:success, message, now: now)
    end

    def flash_info(message, now: false, icon: nil)
      show_flash(:success, message, now: now, icon: icon)
    end

    def flash_warning(message, now: false, icon: nil)
      show_flash(:warning, message, now: now, icon: icon)
    end

    def flash_danger(message, now: false, icon: nil)
      show_flash(:danger, message, now: now, icon: icon)
    end

    def show_flash(type, message, now: false, icon: nil)
      icon ||= ::Flashable::ICONS[type]

      hash = {message: message, icon: icon}

      return flash.now[type] = hash if now

      flash[type] = hash
    end
  end
end

```

Yes there are some ways we could've meta-programmed our flash messages, but sometimes verbosity is okay! So now, wherever the `Flashable` module gets included, it will define these methods in the context of the Class or Module that includes it.

The next step is to go into your `app/controllers/application_controller.rb` and `include Flashable` like so:

```rb
# app/controllers/application_helper.rb

class ApplicationController
  include Flashable
end
```

This means every controller now has access to our new flash methods.

## Reusable frontend interface

Now that our controller can successfully call `flash_success("message")` now we have to create a way for the frontend to interpret the flash hash and render it accordingly.

In your `app/helpers/application_helper.rb` we're going to make the following helper method: `#show_alert`

This will take in the following parameters: `type, message, icon` and will use these 3 arguments to render a shoelace alert.

Heres what the method ends up looking like:

```rb
# app/helpers/application_helper.rb

module ApplicationHelper
  def show_alert(type:, message:, icon:)
    tag.sl_alert(type: type, open: true, closable: true) do
      tag.sl_icon(nil, slot: "icon", name: icon) + "\n" + message
    end
  end
end
```

### Example

In any one of our views we can do call the following code to display a Shoelace flash:

```erb
<%%= show_alert(type: "success", message: "You have successfully logged in!", icon: ::Flashable::ICONS[:success] %>
```

And heres what it will look like:

![Image of Shoelace Alert](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xcf8n7rbxrpsbg7c524n.png)


## Final piece of the puzzle

Alright now we have a way for displaying flashes, but now we actually need to add a flash handler in our layout.

Go to `app/views/layouts/application.html.erb` and we'll add the flash handler code.

```erb
<html>
  <head>
  </head>
  <body>
    <div>
      <%% flash.each do |type, hash| %>
        <div style="margin: 1rem 0;"></div>
        <%%= show_alert(type: type, message: hash[:message], icon: hash[:icon]) %>
      <%% end %>
    </div>

    <main>
      <%%= yield %>
    </main>
  </body>
</html>
```

## What it all looks like

In a controller of your choice, add some flashes, and then go check out a page! Heres how all the flashes would stack up on the same page!

```rb
class HomeController < ApplicationController
  def index
    %w[primary success info warning danger].each do |str|
      flash_method = "flash_#{str}".to_sym
      public_send(flash_method, str, now: true)
    end
  end
end
```

![All flashes](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lqiovesndo27of0c2l6j.png)


