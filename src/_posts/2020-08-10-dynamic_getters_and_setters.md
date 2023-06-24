---
title: Dynamic Getters and Setters on an Object
date: "2020-08-10T15:35:09"
description:
  A guide to defining dynamic getters and setters on a Ruby Object
---

<h2 id="problem">
  <a href="#problem">
    The Problem
  </a>
</h2>

So I'm currently making a Rubygem called
[Snowpacker](https://github.com/paramagicdev/snowpacker) and I ran into
an interesting problem.

In Snowpacker, I allow users to define various attributes within a Rails app initializer like so:

```ruby title=config/initializers/snowpacker.rb
Snowpacker.configure do |snowpacker|
  snowpacker.config_dir = Rails.root.join("config", "snowpacker")
  # ... more options
end
```

The code to set this up is fairly straight forward. In my gem I have the
following 2 files:

First, we have to make a `Configuration` object.

```ruby title=lib/snowpacker/configuration.rb
module Snowpacker
  class Configuration
    attr_accessor :config_dir
    attr_accessor :config_file
    attr_accessor :babel_config_file

    # ... more accessors

  end
end
```

Then, we need to make the configuration available project wide. To do
so, we have to create a class method to define a `Configuration` instance
and then we create an `attr_accessor` to be able to set & get the
`Configuration` values. In a nutshell we want to be able to do the
following:

```ruby
Snowpacker.configure do |snowpacker|
  snowpacker.attr = "value"
end
```

As well as be able to do this:

```ruby
Snowpacker.config.attr = "other value"
```

To do so, we have to do the following:

```ruby title=lib/snowpacker.rb
# ... other require statements
require "snowpacker/configuration"

module Snowpacker
  # Everything below this is the same as def self.method; stuff; end
  class << self
    attr_accessor :config

    def configure
      self.config ||= Configuration.new
      yield(config) if block_given?
    end
  end
end
```

So now everything works as expected. There's just one problem. What if a
user wants to define another `attr_accessor`? I can't possibly account
for this. So, lets look at how to define a dynamic `attr_accessor`.

<h2 id="attr_accessor">
  <a href="#attr_accessor">
    What does attr_accessor actually do?
  </a>
</h2>

Well first, `attr_accessor` combines `attr_writer` and `attr_reader`.

Totally not helpful right? Well lets break it down further.

`attr_reader :name` is the equivalent of:

```ruby
def name
  @name
end
```

And `attr_writer :name` is the equivalent of:

```ruby
def name=(value)
  @name = value
end
```

So `attr_accessor` neatly provides the 2 above methods for us.

The only issue is, you can't technically dynamically define an
`attr_accessor`, instead, you have to manually define both methods listed
above to achieve the same functionality.

<h2 id="why-care">
  <a href="#why-care">
    Why should I care?
  </a>
</h2>

But Konnor, why does that matter? Well the reason it matters is that in
my `snowpack.config.js` I read the value of Environment variables to
make certain things behave in certain ways. The way these values are
set are via instance variables that are read from the `Configuration` object. Basically, `Snowpacker` will take all
the instance_variables of the `Configuration` object and prepend
"SNOWPACKER\_" to them.

For example, if you're given the following code:

```ruby title=rails_app/config/initializers/snowpacker.rb
Snowpacker.configure do |snowpacker|
  snowpacker.config_dir = Rails.root.join("config", "snowpacker")
  snowpacker.babel_config_file = File.join(snowpacker.config_dir, "babel.config.js")
  # ... more options
end
```

What Snowpacker will do at runtime is create a `SNOWPACKER_CONFIG_DIR`
environment variable as well as a `SNOWPACKER_BABEL_CONFIG_FILE`. Both
values can now be accessed via `ENV["SNOWPACKER_CONFIG_DIR"]` and `ENV["SNOWPACKER_BABEL_CONFIG_FILE"]` respectively.

<h2 id="okay-cool">
  <a href="#okay-cool">
    Okay, fine, its important, so whats the next step?
  </a>
</h2>

Initially I had a very ugly non-idiomatic workaround. Then it dawned on
me to use the `method_missing` approach.

In a nutshell, the `method_missing` is a method defined on every
`Object` that checks to see if a method exists. If it does not exist, it
prints a stacktrace and raises a `NoMethodError`. So what we're doing is
overriding the existing `method_missing` on the `Configuration` Object
to be able to dynamically define methods. Rails makes heavy use of this
pattern.

Here's how I setup dynamic attribute getting and setting in Snowpacker.

```ruby title=lib/snowpacker/configuration.rb
module Snowpacker
  class Configuration
    attr_accessor :config_dir
    # ... Other base accessors
`
    def method_missing(method_name, *args, &block)
      # Check if the method missing is an "attr=" method
      raise unless method_name.to_s.end_with?("=")

      setter = method_name
      getter = method_name.to_s.slice(0...-1).to_sym
      instance_var = "@#{getter}".to_sym

      define_singleton_method(setter) do |new_val|
        instance_variable_set(instance_var, new_val)
      end

      define_singleton_method(getter) { instance_variable_get(instance_var) }

      # Ignores all arguments but the first one
      value = args[0]

      # Actually sets the value on the instance variable
      send(setter, value)
    rescue
      # Raise error as normal, nothing to see here
      super(method_name, *args, &block)
    end
  end
end
```

So now with the above we could add an attr onto our `Configuration`
object without worry about adding an `attr_accessor`.

<h2 id="dont-get-it">
  <a href="#dont-get-it">
    Yea...I dont get it, whats happening?
  </a>
</h2>

If you're sitting there scratching your head, I don't blame you.
This may seem like a lot but lets break it down line by line.

`def method_missing(method_name, *args, &block)`

All this means is that we're overriding `method_missing` for all
Configuration Objects.

<br />

`raise unless method_name.to_s.end_with?("=")`

If the method name does not end with an equal sign, raise an error.
In other words, we want to raise an error if the method we're trying to
call is not a `setter` (`attr=`). That's it, pretty cool right!

Heres an example of what we want:

```ruby
Snowpacker.config.test # will raise an error

Snowpacker.config.test = "value" # will not raise an error.
Snowpacker.config.test # now returns "value"
```

So now that we know we're only dealing with methods that look like
`random_attribute=` we can start making more assumptions.

<br />

`setter = method_name` we're just renaming the argument to make our intent more clear.

`getter = method_name.to_s.slice(0...-1).to_sym` Because the setter method
contains an equal sign, the getter cannot contain the equal sign. So to
fix this we turn it to a string, `slice` off the equal sign at the end,
then convert it back to a symbol so we can use it as a method.

`instance_var = "@#{getter}".to_sym` When we create add an instance
variable it must be in the form:

`:@example_instance_variable` so all we're doing here is prepending a "@" to tell Ruby that its an instance variable.

Alright now we're getting to do the actual work:

```ruby
define_singleton_method(setter) do |new_val|
  instance_variable_set(instance_var, new_val)
end
```

This is our setter method. What we're saying is "create a method in the
form `variable_name=(value)`. In other words, we're recreating
`attr_writer` here. This allows us to write new values to the instance
variable.

`define_singleton_method(getter) { instance_variable_get(instance_var) }`

So if the previous method was the `attr_writer`, this is the
`attr_reader`. So now we technically have the `attr_accessor`
functionality we were looking for, theres one issue though. When a user
goes to set the value for the first time, it wont actually set. To fix
this we implement the below code:

```ruby
value = args[0]
send(setter, value)
```

This sets our instance variable to the value we passed in.

For example:

```ruby
Snowpacker.config.test_attr = "attr_value"
# "test_attr" is the setter
# "attr_value" is the value
```

Alright so thats all the logic. But what does that last little bit do?

```
rescue
  super(method_name, *args, &block)
end
```

All this does, is if any error occurs, send it up the `method_missing`
call chain and raise a `NoMethodError`.

That's it. Wield this new found power wisely!

<h2 id="links">
  <a href="#links">
    Links
  </a>
</h2>

[Snowpacker](https://github.com/ParamagicDev/snowpacker)

[Snowpacker Configuration
File](https://github.com/ParamagicDev/snowpacker/blob/d2d534642de9626d3beb5579a9bd6f42eb46d06f/lib/snowpacker/configuration.rb)

[Method Missing
Documentation](https://ruby-doc.org/core-2.7.0/BasicObject.html#method-i-method_missing)

## Extra cleanup

If you use a linter, it will probably tell you to define a
`respond_to_missing?` method. It's really not needed here since we're
directly defining methods, but if you want to make your linter happy,
here ya go:

```ruby
def respond_to_missing?(method_name, include_private = false)
  method_name.to_s.end_with?("=") || super
end
```

We're just telling Ruby, any method that ends with an equal sign is
actually a method for the `Configuration` Object.

Heres the Thoughtbot post on it:
[https://thoughtbot.com/blog/always-define-respond-to-missing-when-overriding](https://thoughtbot.com/blog/always-define-respond-to-missing-when-overriding)

Happy Rubying, or whatever the kids say these days!
