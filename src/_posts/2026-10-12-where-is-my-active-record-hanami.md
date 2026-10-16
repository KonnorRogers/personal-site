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

Maybe a part 2 of this post will come...(one day?) to explain why Hanami side-stepped the ActiveRecord pattern and opted for decoupling into Repos, Relations, Changesets, and Structs...but thats a much lengthier post.

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

Let's start with Structs. Structs are essentially your "ActiveModel". They are the "Ruby object" layer. They are different from Rails ActiveModel in that they are immutable. ActiveModel in Rails leans fully into mutations and the concept of "dirty models" for tracking changes. Structs however are a "snapshot" of the data. In fact, the closest similarity is probably the new(ish?) [Data Class](https://shakacode.com/blog/ruby-3-2-adds-a-new-data-class/). And just like ActiveModel, Structs are not always need to be tied to a database object. There is not much else to talk about with structs. You can define methods on them for derived data and other "business logic", but they're largely what one would consider a PORO ("Plain old Ruby object"). All Structs know are the data they are defined with, and the methods defined on the Struct itself.

## Relations

Up next are "Relations". Relations actually exist in Rails as well! If you've ever done something like: `Article.all`, you'll actually get an `ActiveRecord::Relation`.

Try it yourself:

```rb
rails(main):001> Post.all.inspect
Post Load (0.2ms)  SELECT "posts".* FROM "posts" /* loading for inspect */ LIMIT 11 /*application='Rails'*/
=> "#<ActiveRecord::Relation []>"
```

So Rails does have Relations, they're just hidden from you. Hanami, and more specifically "ROM", put Relations as a first class citizen. Relations are like "query builders". A Relation always returns another Relation. Perhaps a good analogy of Relations is they are a lot like `Enumerable`, they're chainable methods intended to build off of each other until you hit a "final" spot in which the `Enumerable` or `Relation` has to be executed.

In fact, Sequel, the core building block of ROM, describes `datasets` as "Enumerable"

<https://sequel.jeremyevans.net/rdoc/files/doc/cheat_sheet_rdoc.html#label-Datasets+are+Enumerable>

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

The core idea of ROM Relations is that they are a "query building layer". Essentially, Relations are what are actually talking to your database. Your Relations are using [Sequel](https://sequel.jeremyevans.net/) under the hood for all the query building (similar to how Rails uses ARel under the hood for its query building).

So we now have Structs defined, which are the "ActiveModel" layer. We have Relations defined, which is the "query building" layer for all your "scopes" / "filtering" and data retrieval from the database.

One final note, you may have heard "Changesets" mentioned, we won't talk too much about them as they're largely an implementation detail, but all you really need to know is that instead of the ActiveModel / ActiveRecord pattern of tracking "dirty" changes by directly mutating itself and storing changes in a private field, Changesets are a more transparent way for the Relation to know what properties need to change.


## Repositories

So if Structs are ActiveModel, and Relations are ActiveRecord, where do Repositories fit in?

Well...they kind of don't. There's no great 1:1 comparison.

Repositories are like your "predefined queries". Anything which you know you will be doing often.

Repositories let you decide how much or how little of Relations you want to expose. They are essentially your "public contract". Yes it sounds weird because they're internal to your app, but the idea is that if you need data from your database, you use a Repository to get it.

The idea of Repositories is that they are the "glue" between Structs and Relations. You execute a Relation and return a Struct, array of Structs, or `nil`.

For example:

```rb
# app/repos/article_repo.rb
class ArticleRepo < MyApp::Repo
  def update(id, attributes)
    articles.by_pk(id).changeset(:update, attributes).commit # => returns nil
  end

  def find(id)
    articles.published.by_pk(id).one! # => returns a Struct. If no record found, throws an error.
  end

  def latest
    articles.published.limit(10).to_a # => returns an array of Structs
  end
end
```

So thats it! Now you're an expert! (...maybe?)
