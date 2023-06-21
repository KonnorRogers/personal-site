---
title: Testing scopes with Rails
categories: [rails, ruby]
date: 2022-04-08 18:36:33 UTC
description: |
  The Problem   A common problem I've seen and that took me a long time to understand was how...
---

## The Problem

A common problem I've seen and that took me a long time to understand was how to properly test Rails scopes. I have searched online many times for how to properly tests scopes and find a bunch of old stackoverflow posts which really don't address the issue.

## Why are they hard to test?

Scopes can be hard to test because generally you're operating on an entire database which if you include a large number of fixtures can cause global data to leak into your test and cause tests to fail intermittently.

## The naive approach

Initially, I thought to "stub" out the `ActiveRecord::Relation` that scopes tend to operate on, but I found stubbing out the data to be error prone, rigid, and hard to get right.

## The approach that operates on a known dataset

After fighting with this for so long, I finally came to a realization. Attach the scope to a known dataset and use that for the test case! But how do we do this? The easiest way is to create a set of records, and then pass their `id` into a `where()` query on the model. Let's look at an example.

Let's say we have a model called `User` and we want to have a scope for both newest and oldest users.

If you're like me, you never know the difference between ASC and DESC for datetime columns.

So lets add our scopes quick and then see if we get it right:

```rb
class User < ActiveRecord::Base
  scope :newest, -> { order(created_at: :asc) }
  scope :oldest, -> { order(created_at: :desc) }
end
```

Now, how could we test it?

Well, in our model test we should first setup a few users.

```rb
class UserTest < ActiveSupport::TestCase
  def setup
    @user_one = User.create!(created_at: 1.day.ago)
    @user_two = User.create!(created_at: 2.days.ago)
    @user_three = User.create!(created_at: 3.days.ago)

    # This lets us have a known set of data. We don't have a polluted global scope of users.
    @users = User.where(id: [@user_one.id, @user_two.id, @user_three.id])
  end
end
```

Now that we have a known set of data, we chain off of it and test our scope.

```rb
class UserTest < ActiveSupport::TestCase
  def setup
    # ...
  end

  test "Newest users and oldest users should be sorted properly" do
    # By testing both newest and oldest, we're coupling these tests together
    # We test both just in case our records just happen to be returned in the correct order.
    # we could use reverse_scope to test newest, but instead we just make this explicit.

    # chain off of @users so we use a known set of data rather than the whole database.
    newest_users = @users.newest
    assert_operator newest_users.first.created_at, :>=, newest_users.second.created_at
    assert_operator newest_users.first.created_at, :>=, newest_users.third.created_at
    assert_operator newest_users.second.created_at, :>=, newest_users.third.created_at

    oldest_users = @users.oldest
    assert_operator oldest_users.first.created_at, :<=, oldest_users.second.created_at
    assert_operator oldest_users.first.created_at, :<=, oldest_users.third.created_at
    assert_operator oldest_users.second.created_at, :<=, oldest_users.third.created_at
  end
end
```

On running this test you should get something like this:

```console
ruby user_test.rb

# Running:

F

Finished in 0.013149s, 76.0489 runs/s, 76.0489 assertions/s.

  1) Failure:
UserTest#test_Newest_users_and_oldest_users_should_be_sorted_properly [single_line_active_record.rb:52]:
Expected 2022-04-05 18:15:24.185615 UTC to be >= 2022-04-06 18:15:24.184933 UTC.
```

Oops! It failed...perhaps we got the column direction wrong? Let's try this:

```diff
class User < ActiveRecord::Base
-  scope :newest, -> { order(created_at: :asc) }
+  scope :newest, -> { order(created_at: :desc) }


-  scope :oldest, -> { order(created_at: :desc) }
+  scope :oldest, -> { order(created_at: :asc) }
end
```

Then test it again:

```console
ruby user_test.rb

# Running:

.

Finished in 0.021307s, 46.9331 runs/s, 281.5983 assertions/s.

1 runs, 6 assertions, 0 failures, 0 errors, 0 skips
```

Yayyy we did it!!

## Adding another scope

Alright, the first scope test may not have been too useful for this limited scope, so lets make an exclusionary scope that checks for users created after a certain date / time.

## The scope

```rb
class User < ApplicationRecord
  scope :created_after, ->(date) { where("created_at >= ?", date) }
end
```

## The test

```rb
class UserTest < ActiveSupport::TestCase
  def setup
    # ...
  end

  test "Should only show users created from 2 days ago and later" do
    # Always use beginning of day. I believe 2.days.ago drops the "time" causing it to act like
    # #end_of_day which will cause our user created "2.days.ago" to be excluded.
    users = @users.created_after(2.days.ago.beginning_of_day)

    # We know there should only be 2 users created within the last 2 days.
    assert_equal users.size, 2

    assert_includes users, @user_one
    assert_includes users, @user_two
  end
end
```

## Touchdown

```console
$ ruby user_test.rb

# Running:

..

Finished in 0.024298s, 82.3114 runs/s, 452.7127 assertions/s.

2 runs, 11 assertions, 0 failures, 0 errors, 0 skips
```

## Wrapping up

Now is this the first use case of checking `created_at` useful for this type of limited scope testing? Maybe not. For this particular test of testing creation time, it shouldn't matter because we expect the sorting algorithm to get it right. However, using this method of a limited scope of data makes it easier to start testing more advanced scopes and scopes where data from other tests / fixtures may leak in and its much easier to test results. It also works great on exlusionary scopes / queries like we did with our `created_after` scope.

## Recreation

A gist can be found here of recreating this testing in a single file:

https://gist.github.com/konnorrogers/f59d02bed10308c9ca60a43c87de26d9
