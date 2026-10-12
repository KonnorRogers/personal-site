---
title: Dude, where's my ActiveRecord?
categories: []
date: 2026-10-12
description: |
  A conceptual overview of how Hanami handles database access, persistence, and models.
published: false
---

So you've decided to try Hanami. And you're like "Dude, where is my ActiveRecord? How do I interact with the database? Where are my models?"

There's Repos, Relations, Changesets, and Structs, oh my!

Ironically, it took a while for these to click for me. In fact, I'm currently working on a _super duper top secret TypeScript project_ and have been doing a lot of research into frameworks beyond Rails. These include Laravel, Phoenix, and of course Hanami.

The biggest shock when starting with Hanami was the distinct lack of ActiveRecord. After all, this was all I really knew.

Maybe a part 2 of this post will come...(one day?) to explain why Hanami side-stepped the ActiveRecord pattern and opted for decoupling into Repos, Relations, and Structs...but thats a much lengthier post.

We're just going to be looking at the first example on the Hanami site.

<https://hanakai.org/hanami> (You may have to scroll down a little to see it)

```rb
# app/relations/articles.rb
class Articles < Hanami::DB::Relation
  schema :articles, infer: true

  def published
    where(published: true).order { created_at.desc }
  end
end

# app/repos/article_repo.rb
class ArticleRepo < MyApp::Repo
  def update(id, attributes)
    articles.by_pk(id).changeset(:update, attributes).commit
  end

  def find(id)
    articles.published.by_pk(id).one!
  end

  def latest
    articles.published.limit(10).to_a
  end
end

# app/structs/article.rb
class Article < MyApp::DB::Struct
  def summary
    "#{title} (#{author_name}, #{published_at.year})"
  end
end
```

There is quite a bit here, so lets back up a little bit.

## Structs

Let's start with Structs. Structs are essentially your "ActiveModel". They are the "Ruby object" layer. They are different from Rails ActiveModel in that they are immutable. ActiveModel in Rails leans fully into mutations and the concept of "dirty models" for tracking changes. Structs however are a "snapshot" of the data. In fact, the closest similarity is probably the new(ish?) [Data Class](https://shakacode.com/blog/ruby-3-2-adds-a-new-data-class/). And just like ActiveModel, Structs are not always need to be tied to a database object. There is not much else to talk about with structs. You can define methods on them for derived data and other "business logic", but they're largely what one would consider a PORO ("Plain old Ruby object").

## Relations

Up next are "Relations". Relations actually exist in Rails as well! If you've ever done something like: `Article.all`, you'll actually get an `ActiveRecord::Relation`.

Try it yourself:

```rb
rails(main):001> Post.all.inspect
Post Load (0.2ms)  SELECT "posts".* FROM "posts" /* loading for inspect */ LIMIT 11 /*application='Rails'*/
=> "#<ActiveRecord::Relation []>"
```

So Rails does have Relations, they're just hidden from you. Hanami, and more specifically "ROM", put Relations as a first class citizen. Relations are like "query builders". A Relation always returns another Relation. Perhaps a good analogy of Relations is they are a lot like `Enumerable`, they're chainable methods intended to build off of each other until you hit a "final" spot in which the `Enumerable` or `Relation` has to be executed.

For example, say we have the following `Relation`

```rb
# app/relations/articles.rb
class Articles < Hanami::DB::Relation
  schema :articles, infer: true

  def published
    where(published: true).order { created_at.desc }
  end
end
```

The `published` method Looks incredibly similar to Rails scopes. In fact, astute readers would correctly point out that scopes in Rails actually return an `ActiveRecord::Relation` ! We can look how we would write our "Relation" above by using ActiveRecord scopes, just to give an idea.

```rb
# app/models/article.rb
class Article < ApplicationRecord
  scope :published, -> { where(published: true).order(created_at: :desc) }
end
```

The core idea of ROM Relations is that they are a "query building layer". They always return another relation.

So we now have Structs defined, which are the "ActiveModel" layer. We have Relations defined, which is the "query building" layer for all your "scopes" / "filtering" in Rails. Stuff like `Article.all`, `Article.first`, `Article.where(foo: "bar")`, etc.

The one piece we're missing is "persistence". How do we actually "talk" to our database? We'll talk about that next when we look at "Repositories".

## Repositories

I saved Repositories for last as they are the "glue" layer.

They are what actually saves and loads things from your database (or other storage of your choice, it doesn't always need to be a database, but to keep things simple, we'll focus on SQL-based database).

A Repository at its core "executes" relations for querying, and "executes" changesets (which we haven't talked about) for mutations on your database.

A Repository is essentially the query part of ActiveRecord. If you think of Relations as the "query building", think of Repositories as the "query executor", its the thing that actually sends your SQL to the database, gets the data back, and turns it into a `Struct`.

In fact, if we *really* want to build the analogy, Repositories are your "ActiveRecord" class. Relations are the internal AREL query building that you never see. Structs are the "models" or "instantiated objects" you work with. This analogy does fall apart a *little bit* because of how Rails overloads model instances.

For example, in ActiveRecord to persist a change, you can do `Article.first.update({ title: "foo" }).save`, however, in Hanami, you'll need to define






