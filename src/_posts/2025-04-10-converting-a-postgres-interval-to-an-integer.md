---
title: Converting A Postgres Interval To An Integer
categories: []
date: 2025-04-10
description: |
  A very simple post about converting a postgres "interval" into an integer
published: true
---

## The problem

I had been playing around with Postgres' [interval](https://neon.tech/postgresql/postgresql-tutorial/postgresql-interval) for storing lengths of subscriptions.

Intervals are very convenient, especially when storing the "length of time" of a subscription, but subscriptions "timer" hasn't started yet, and will start at a future date.

The actual storage is simple.

```sql
CREATE TABLE subscriptions (
  "subscriptionLength" INTERVAL
)

INSERT INTO subscriptions ("subscriptionLength")
VALUES ('6 months')
```

Pretty great you can use plain text to insert an interval. Now the problem comes in with displaying the subscription length.

Postgres supports the following formats:
- sql standard
- postgres
- postgresverbose
- iso_8601

<https://neon.tech/postgresql/postgresql-tutorial/postgresql-interval#postgresql-interval-output-format>

With the default being "postgres".

Now, the annoying thing is when you go to display this after querying you get things like:

`"6 mons"`

Which kind of just looks like you typo'd months.

I definitely wanted to keep the interval data type, but figured I needed to rethink displaying. So the best I could think of was "convert the interval to an integer and just go from there".

So I did some searching on the conversion.

## Enter Epoch

I found this post on using the `EXTRACT(epoch FROM interval)` and it looked perfect for what I needed.

So here's the final code for converting the `subscriptionLength` from "subscriptions" into an integer number of months.

```sql
SELECT FLOOR(EXTRACT(EPOCH from "subscriptionLength") / (60 * 60 * 24 * 30)) FROM subscriptions
-- integers are based on seconds.                        ^ minutes
--                                                            ^ hours
--                                                                 ^ days
--                                                                      ^ months
```

Now obviously this starts to fall down if you have subscription lengths of "20 days" or any kind of partial month subscription length. But if you know everything will always be whole months, this seems to be pretty reasonable.

