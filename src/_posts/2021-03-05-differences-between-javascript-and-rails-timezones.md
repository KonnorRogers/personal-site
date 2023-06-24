---
title: Differences between JavaScript and Rails timezones
date: "2021-03-05T12:33:46"
description:
  Common pitfalls and issues with Rails timezones.
  Differences between the browser and the server, and various other
  tidbits.
---

<h2 id="work">
  <a href="#work">
    What I'm working on
  </a>
</h2>

I currently work for Veue (https://veue.tv) and recently was tasked with
creating a scheduling form for streamers.

When working on this I was given a design that looked roughly like the
following:

<form>
  <div style="margin-bottom: 1rem;">
    <select>
      <option value="">Pick a Day</option>
      <option value="1">5 March 2021 (Today) </option>
      <option value="2">6 March 2021 (Tomorrow) </option>
      <option value="3">7 March 2021 </option>
    </select>
  </div>

  <div>
    <select>
      <option value="">Pick a Time (Time Zone)</option>
      <option value="15">00:15 (EST)</option>
      <option value="30">00:30 (EST)</option>
    </select>
  </div>
</form>

And then on the Rails backend I had a schema that looked roughly like
this:

```rb title=db/schema.rb
create_table "videos" do |t|
  t.datetime :scheduled_at
end
```

So I had a few options, I decided to prefill a `<input type="hidden"
name="video[scheduled_at]>` field and then use a Stimulus controller to
wire everything together to send off a coherent `datetime` to the
server.

I'm not going to get into how I actually built this because it will be
quite verbose, instead, I'm going to document the inconsistencies I found
between Javascript and Rails and some of the pitfalls.

<h2 id="dates">
  <a href="#dates">
    Dates arent what they seem.
  </a>
</h2>

<h3 id="local-time">
  <a href="#local-time">
    Local time
  </a>
</h3>

In JavaScript, `new Date()` is the same as Ruby's `Time.now`. They both
use the TimeZone for your system.

<h3 id="setting-timezone">
  <a href="#setting-timezone">
    Setting a timezone
  </a>
</h3>

In Ruby, if you use `Time.current` it will use the value of `Time.zone` or the value set by
`ENV["TZ"]`. If neither are specified by your app, `Time.zone` will default to UTC.

<h3 id="linting">
  <a href="#linting">
    Linting complaints
  </a>
</h3>

Rubocop will always recommend against `Time.now` and instead recommend `Time.current` or `Time.zone.now`,
or a number of other recommendations here:

https://www.rubydoc.info/gems/rubocop/0.41.2/RuboCop/Cop/Rails/TimeZone

Basically, it always wants a timezone to be specified.

<h3 id="month-of-year">
  <a href="#month-of-year">
    Month of year
  </a>
</h3>

The month of the year is 0 indexed in JS and 1-indexed in Ruby.

<h4 id="js-month-of-year">
  <a href="#js-month-of-year">
    Javascript
  </a>
</h4>

```js title=javascript
// month of year
new Date().getMonth()
// => 0 (January), 1 (February), 2 (March), ... 11 (December)
// 0-indexed month of the year
```

<h4 id="rb-month-of-year">
  <a href="#rb-month-of-year">
    Ruby / Rails
  </a>
</h4>

```rb title=ruby
# month of year
Time.current.month
# => 1 (January), 2 (February), 3 (March), ... 12 (December)
# 1-indexed month of the year
```

<h3 id="day-of-week">
  <a href="#day-of-week">
    Day of Week
  </a>
</h3>

The day of the week in JavaScript is called via:

`new Date().getDay()`

And in Rails its:

`Time.current.wday`

<h4 id="js-day-of-week">
  <a href="#js-day-of-week">
    Javascript
  </a>
</h4>

```js title=javascript
// Day of the week
new Date().getDay()
// => 0 (Sunday) ... (6 Saturday)
// 0-indexed day of week
```

<h4 id="rb-day-of-week">
  <a href="#rb-day-of-week">
    Ruby / Rails
  </a>
</h4>

```rb title=ruby
# Day of the week
time.wday
# => 0 (Sunday) ... 6 (Saturday)
# 0-indexed day of week
```

<h3 id="day-of-month">
  <a href="#day-of-month">
    Day of Month
  </a>
</h3>

<h4 id="js-day-of-month">
  <a href="#js-day-of-month">
    Javascript
  </a>
</h4>

```js title=javascript
// Day of the month
date.getDate()
// => 1 (day 1 of month), ..., 11 (day 11 of month), 28 ... 31 (end of month)
// 1-indexed day of the month
```

<h4 id="rb-day-of-month">
  <a href="#rb-day-of-month">
    Ruby / Rails
  </a>
</h4>

```rb title=ruby
# Day of month
time.day
# => 1 (first day), 11 (11th day), ... 28 ... 31 (end of month)
# 1-indexed day of the month
```

<h2 id="iso-utc-what">
  <a href="#iso-utc-what">
    ISO Strings, UTC, what?!
  </a>
</h2>

<h3 id="find-utc-time">
  <a href="#find-utc-time">
    Finding the UTC time
  </a>
</h3>

In JavaScript, the UTC number returned is 13 digits for March 5th, 2021
In Ruby, the UTC integer will be 10 digits when converting to an
integer. Why the inconsistency?

In Javascript, `Date.now()` returns a millisecond based representation,
while in Ruby, `Time.current.to_i` returns a second based representation.

By millisecond vs second based representation I mean the number of
seconds or milliseconds since January 1, 1970 00:00:00 UTC.

Below, I have examples on how to make JS behave like Ruby and
vice-versa.

<h4 id="js-find-utc-time">
  <a href="#js-find-utc-time">
    Javascript
  </a>
</h4>

```js title=javascript
Date.now()
// => 1614968619533
// Returns the numeric value corresponding to the current time—the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC, with leap seconds ignored.

// Ruby-like, second based approach
parseInt(Date.now() / 1000, 10)
// => 1614968619
// Without milliseconds
```

<h4 id="rb-find-utc-time">
  <a href="#rb-find-utc-time">
    Ruby / Rails
  </a>
</h4>

```rb title=ruby
Integer(Time.current.utc)
# => 1614971384
# Returns an integer value, seconds based approach


Integer(Float(Time.current.utc) * 1000)
# => 1614971349307
Returns an integer value, milliseconds based approach
```

<h3 id="iso-string">
  <a href="#iso-string">
    ISO Strings?!
  </a>
</h3>

<h4 id="use-them">
  <a href="#use-them">
    Use them in your database.
  </a>
</h4>

ISO strings are king. Use them. Even postgres recommends them for `date` / `time` / `datetime` columns.

https://www.postgresql.org/docs/13/datatype-datetime.html#DATATYPE-DATETIME-DATE-TABLE

```
Example 	Description
1999-01-08 	ISO 8601; January 8 in any mode (recommended format)
```

<h4 id="look-for-z">
  <a href="#look-for-z">
    Look for the Z!
  </a>
</h4>

Look for a `Z` at the end of an ISO String since
it will indicate `Zulu` time otherwise known as UTC time. This how you
want to save times on your server. The browser is for local time, the
server is for UTC time.

<h4 id="how-to-find-iso-string">
  <a href="#how-to-find-iso-string">
    How to find the ISO string
  </a>
</h4>

Here we'll look at how to find an ISO string in JS and in Ruby. Again,
JS records millisecond ISO strings. Ill cover how to make both use
milliseconds.

<h5 id="js-find-iso">
  <a href="#js-find-iso">
    Javascript
  </a>
</h5>

```js title=javascript
new Date().toISOString()
// => "2021-03-05T18:45:18.661Z"
// Javascript automatically converts to UTC when we request an ISO string
```

According to the docs it says it follows either the 24 or 27 character
long approach. However, based on my testing it was always 27 character
millisecond based time. My best guess is its dependent on browser. For
Chrome, Safari, and Mozilla I got the same 27 character string. As far
as I can tell theres no way to force a 24 character string other than by
polyfilling it yourself.

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString


<h5 id="rb-find-iso">
  <a href="#rb-find-iso">
    Ruby
  </a>
</h5>

```rb title=ruby
Time.current.iso8601
# => "2021-03-05T13:45:46-05:00"
# Notice this has an offset, this is not using UTC time. To get Zulu time we
# need to chain utc.

Time.current.utc.iso8601
# => "2021-03-05T18:45:54Z"
# Without milliseconds

Time.current.utc.iso8601(3)
# => "2021-03-05T18:59:26.577Z"
# With milliseconds!
```

<h3 id="reference">
  <a href="#reference">
    Full reference of above
  </a>
</h3>

<h4 id="js-ref">
  <a href="#js-ref">
    Javascript
  </a>
</h4>

```js title=javascript
// Month, day, date

const date = new Date()

// Month of year
date.getMonth()
// => 0 (January), 1 (February), 2 (March), ... 11 (December)
// 0-indexed month of the year

// Day of the week
date.getDay()
// => 0 (Sunday) ... (6 Saturday)
// 0-indexed day of week

// Day of the month
date.getDate()
// => 1 (day 1 of month), ..., 11 (day 11 of month), 28 ... 31 (end of month)
// 1-indexed day of the month


// UTC
Date.now()
// => 1614968619533
// Returns the numeric value corresponding to the current time—the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC, with leap seconds ignored.

// Ruby-like, second based approach
parseInt(Date.now() / 1000, 10)
// => 1614968619
// Without milliseconds

// ISO Strings
new Date().toISOString()
// => "2021-03-05T18:45:18.661Z"
// Javascript automatically converts to UTC when we request an ISO string
```

<h4 id="rb-ref">
  <a href="#rb-ref">
    Ruby / Rails
  </a>
</h4>

```rb title=ruby
# Month, day, date
time = Time.current

# Month of year
time.month
# => 1 (January), 2 (February), 3 (March), ... 12 (December)
# 1-indexed month of the year

# Day of the week
time.wday
# => 0 (Sunday) ... 6 (Saturday)
# 0-indexed day of week

# Day of month
time.day
# => 1 (first day), 11 (11th day), ... 28 ... 31 (end of month)
# 1-indexed day of the month

# UTC
Integer(Time.current.utc)
# => 1614971384
# Returns an integer value, seconds based approach

Integer(Float(Time.current.utc) * 1000)
# => 1614971349307
Returns an integer value, milliseconds based approach


# ISO Strings
Time.current.iso8601
# => "2021-03-05T13:45:46-05:00"
# Notice this has an offset, this is not using UTC time. To get Zulu time we
# need to chain utc.

Time.current.utc.iso8601
# => "2021-03-05T18:45:54Z"
# Without milliseconds

Time.current.utc.iso8601(3)
# => "2021-03-05T18:59:26.577Z"
# With milliseconds!
```

<h2 id="bonus">
  <a href="#bonus">
    Bonus! Testing!
  </a>
</h2>

Thanks for sticking with me this far. When writing system tests in
Capybara, the browser will use the timezone indicated by your current
system and will be different for everyone.

`Time.zone` is not respected by Capybara. Instead, to tell Capybara what
TimeZone to use, you have to explicitly set the `ENV["TZ"]`.

So, here at Veue, we randomize the timezone on every test run. This
catches possible failures due to timezones and provides the same experience locally and in
CI. There are gems for this but heres an easy snippet
you can use to set your TimeZone to be a random timezone for tests.

To find a random TimeZone we can access
`ActiveSupport::TimeZone::MAPPING` which as it states, provides a hash
mapping of timezones. From here, its just wiring it all up.

https://api.rubyonrails.org/classes/ActiveSupport/TimeZone.html

<h3 id="rspec">
  <a href="#rspec">
    Rspec
  </a>
</h3>

```rb rspec
# spec/spec_helper.rb

RSpec.configure do |config|
  # ...
  config.before(:suite) do
    ENV["_ORIGINAL_TZ"] = ENV["TZ"]
    ENV["TZ"] = ActiveSupport::TimeZone::MAPPING.values.sample
  end

  config.after(:suite) do
    ENV["TZ"] = ENV["_ORIGINAL_TZ"]
    ENV["_ORIGINAL_TZ"] = nil
  end
  # ...
end
```

<h3 id="minitest">
  <a href="#minitest">
    Minitest
  </a>
</h3>

```rb minitest
# test/test_helper.rb

# ...
ENV["_ORIGINAL_TZ"] = ENV["TZ"]
ENV["TZ"] = ActiveSupport::TimeZone::MAPPING.values.sample

module ActiveSupport
  class TestCase
    # ...
  end
end

Minitest.after_run do
  ENV["TZ"] = ENV["_ORIGINAL_TZ"]
  ENV["_ORIGINAL_TZ"] = nil
end
```

Thanks for reading, and enjoy your day from whatever timezone you may be in!
