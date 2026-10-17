---
title: Untangling the data layer of Hanami
categories: []
date: 2026-10-12
description: |
  A conceptual overview of how Hanami handles database access, persistence, and objects.
published: true
---

Coming from Rails, Hanami can be a massive shock. Immediately when starting Hanami you get introduced to Repositories, Relations, Changesets, and Structs, oh my!

Rails is my biggest point of reference and will be used throughout to compare and contrast, and is also why Hanami presenting these structures is so foregin to me.

Ironically, it took a while for these to click for me.

When starting with Hanami, there is a distinct lack of ActiveRecord.

We won't detail "why" too much, other than that rather than having everything related to "mutations", "persistence", "data mapping", and "queries" in a singular `class`, Hanami splits these into Repositories, Relations, Structs, and Changesets so as not to overload a single object and to provide clear splits of responsibility.

To start off, let's look at the first example on the Hanami site.

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

Let's start with Structs. Structs are essentially your "ActiveModel". They are the "Ruby object" layer. They are different from Rails ActiveModel in that they are immutable. ActiveModel in Rails leans fully into mutations and the concept of "dirty models" for tracking changes. Structs however are a "snapshot" of the data. In fact, the closest similarity is probably to the [Data Class](https://shakacode.com/blog/ruby-3-2-adds-a-new-data-class/). And just like ActiveModel, Structs do not always need to be tied to a database object. There is not much else to talk about with structs. You can define methods on them for derived data and other "business logic", but they're largely what one would consider a PORO ("Plain old Ruby object"). The only thing a Struct knows is the data it was instantiated with and the methods you have defined on it.

## Relations

Up next are "Relations". Relations actually have an equivalent in Rails as well! If you've ever done something like: `Article.all`, you'll actually get an `ActiveRecord::Relation`.

Try it yourself:

```rb
rails(main):001> Article.all.inspect
Article Load (0.2ms)  SELECT "articles".* FROM "articles" /* loading for inspect */ LIMIT 11 /*application='Rails'*/
=> "#<ActiveRecord::Relation []>"
```

So Rails does have Relations, they're just hidden from you. Hanami, and more specifically "ROM", put Relations as a first class citizen. Relations are like "query builders". Perhaps a good analogy of Relations is they are a lot like `Enumerable`, they're chainable methods intended to build off of each other until you hit a "final" spot in which the `Enumerable` or `Relation` has to be executed. Terminating methods are methods like `#to_a`, `#first`, which expect to get back actual data from the database. ROM, more specifically, `rom-sql` uses [Sequel](https://sequel.jeremyevans.net/) as its foundational building block for SQL relations. `rom-sql` relations are datasets from Sequel, and the Sequel docs themselves describe `datasets` as "Enumerable"

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

The `published` method looks incredibly similar to Rails scopes. In fact, astute readers would correctly point out that scopes in Rails actually return an `ActiveRecord::Relation` ! Look at how we would write our "Relation" above by using ActiveRecord scopes, just to give an idea.

```rb
# app/models/article.rb
class Article < ApplicationRecord
  scope :published, -> { where(published: true).order(created_at: :desc) }
end
```

The core idea of ROM Relations is that they are a "query building layer". Essentially, Relations are what are actually talking to your database. Your Relations (specifically your SQL Relations!) are using Sequel similar to how Rails uses ARel under the hood for its query building.

So we now have Structs defined, which are the "ActiveModel" layer. We have Relations defined, which is the "query building" layer for all your "scopes" / "filtering" and data retrieval from the database.

## Repositories

So if Structs are ActiveModel, and Relations are ActiveRecord, where do Repositories fit in?

Well...they kind of don't. There's no great 1:1 comparison.

We can look at Martin Fowler's description of a "Repository" for some guidance.

<https://martinfowler.com/eaaCatalog/repository.html>

> Mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects.

Repositories are your "contracts" for getting data out of your database and turning it into a "Domain Object" (Struct).

For example, lets look back at the initial example from Hanami:

```rb
# app/repos/article_repo.rb
class ArticleRepo < MyApp::Repo
  def update(id, attributes)
    articles.by_pk(id).changeset(:update, attributes).commit # => returns the Struct of your newly saved article.
  end

  def find(id)
    articles.published.by_pk(id).one! # => returns a Struct. If no record found, raises an error.
  end

  def latest
    articles.published.limit(10).to_a # => returns an array of Structs
  end
end
```

We "define" queries which call our Relations ("articles" in this case) and returns our domain objects. Repositories sound big and scary, but they're really just a mapping layer.

## Changesets

We've covered Repositories and Relations, but we missed a piece in the middle called "Changesets". If you were paying close attention, the initial Repository example had a changeset in it.

```rb
# app/repos/article_repo.rb
class ArticleRepo < MyApp::Repo
  def update(id, attributes)
    articles.by_pk(id).changeset(:update, attributes).commit
  end
end
```

What this says is "Fetch this article from the database, compare it with the attributes I pass in, and only update the things that changed."

So lets say my Article in the database looked like this:

```json
{
  "id": 1,
  "title": "Hello!",
  "content": "I am a teapot!"
}
```

And we call a changeset like so:

```rb
article_repo.update(1, { title: "Goodbye!" })
```

The `:update` changeset in particular will compare _only the fields that changed_. So it would essentially send the following SQL query:

```sql
UPDATE articles
SET title = 'Goodbye'
WHERE id = 1;
```

(Postgres-flavored SQL is what I'm familiar with, so that is what I wrote above. The `rom-sql` adapter will produce the proper SQL for your database in your app.)

Only the `update` changeset has this functionality of diffing. The `:create` and `:delete` changesets do not handle diffing as there is nothing to diff against!


Okay...but what is the Rails equivalent to changesets you may ask? Well...changesets are tough to map 1:1 with Rails, so instead we'll compare and contrast. Rails diffs based on the object via dirty tracking and then mutates in the database when you call `model.save`). ROM diffs at commit time against the row in the database `changeset(:update, attrs).commit`.

You can read more about changesets here: <https://hanakai.org/learn/rom/v5.0/changesets>

You can read about Rails dirty tracking here if you're interested: <https://guides.rubyonrails.org/active_model_basics.html#dirty>

## Conclusion

To put a bow on everything, let's recap the basics of the 4 building blocks of data in Hanami.

- Structs. Basic objects that are considered your "domain objects".
- Relations. The API that is used to communicate with your database (or any other data storage layer you may have)
- Repositories. The layer where you write methods to be used elsewhere in your application. This is your "contract" for retrieving data from a relation and mapping it to a Struct.
- Changesets. Changesets are how "writes" happen. Whether that is `:create`, `:delete`, or `:update`, and in the case of `:update`, only sends the fields that are different from what is in the database. If there are no changes, it sends nothing.
