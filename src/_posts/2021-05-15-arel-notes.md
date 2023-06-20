---
title: Arel Notes
categories: arel, ruby, rails, sql
date: 2021-05-15 21:09:08 UTC
description: |
  Notes from RailsConf 2014   Link to talk: https://www.youtube.com/watch?v=ShPAxNcLm3o...
---

# Notes from RailsConf 2014 

Link to talk: https://www.youtube.com/watch?v=ShPAxNcLm3o

## What is Arel?

Arel stands for: "A Relational Algebra"

In actuality, Arel is an AST (Abstract Syntax Tree) parser
that takes Ruby code and turns it into SQL syntax. Arel knows nothing about your tables or database. Its purely a Query Builder that uses Ruby to talk to ActiveRecord.

## Arel Helpers

https://github.com/camertron/arel-helpers

What do they do?

They reduce the verbosity of Arel syntax.

Example:

```rb
Post.select(:id) # using ActiveRecord
Post.arel_table(:id) # using bare Arel
Post[:id] # using Arel Helpers.
```

## What are Terminal methods

```rb
Post.select(:id).count.to_sql 
# => NoMethodError: undefined method `to_sql' for 107:Integer
```

`#count` is a "Terminal Method" meaning it will "terminate" the SQL chain and not allow for continuous chaining.

## Adding functions

Lets say you need to add a function thats not part of the Arel functions IE: non-standard SQL methods that may vary from database to database.

Heres how that would happen:

```rb
Post.select(
  Arel::Nodes::NamedFunction.new(
    "LENGTH", [Post.arel_table[:text]]
  ).as("length")
).to_sql
# => SELECT LENGTH('posts', 'text') AS length from 'posts'

## To reduce verbosity

include Arel::Nodes

Post.select(
  NamedFunction.new(
    "LENGTH", [Post[:text]]
  ).as("length")
).to_sql
# => SELECT LENGTH('posts', 'text') AS length from 'posts'
```

## Arel Star!

Substitute `"*"` with `Arel.star` !

```rb
Post.select("*")
# => SELECT * from 'posts'

Post.select(Arel.star)
# => SELECT * from 'posts'
```

## Select From

```rb
Post.select(:id).from(Post.select([:id, :text]).ast).to_sql
# => SELECT id FROM SELECT id, text FROM 'posts'
```

`.ast` will give you the constructed AST for a given Arel function.

## Where

```rb
Post.where(title: "Arel is Cool").to_sql # using ActiveRecord
Post.where(Post[:title].eq("Arel is Cool")).to_sql # Using Arel

Post.where("title != 'Arel is Cool'").to_sql
# Using AR
# => SELECT 'posts'.* from 'posts'
#    WHERE (title != 'Arel is Cool')

Post.where(Post[:title].not_eq("Arel is Cool")).to_sql 
# Using Arel
# => SELECT 'posts'.* from 'posts'
#    WHERE 'posts'.'title' != 'Arel is Cool'


Post.where(Post[:title].not_eq(nil)).to_sql
# => SELECT 'posts'.* FROM 'posts'
#    WHERE 'posts.title' IS NOT NULL

# Greater than
Post.where(Post[:visitors].gt(250)).to_sql
# => SELECT 'posts'.* FROM 'posts'
#    WHERE 'posts'.'visitors' > 250

# Less than
Post.where(Post[:visitors].lt(250)).to_sql
# => SELECT 'posts'.* FROM 'posts'
#    WHERE 'posts'.'visitors' < 250

# Greater than or equal to
Post.where(Post[:visitors].gteq(250)).to_sql
# => SELECT 'posts'.* FROM 'posts'
#    WHERE 'posts'.'visitors' >= 250

# Less than or equal to
Post.where(Post[:visitors].lteq(250)).to_sql
# => SELECT 'posts'.* FROM 'posts'
#    WHERE 'posts'.'visitors' <= 250

# Chaining AND + OR

Post.where(
  Post[:title].eq("Arel is Cool")
  .and(
    Post[:id].eq(22)
    .or(
      Post[:id].eq(23)
    )
  )
).to_sql
# => SELECT 'posts'.* FROM 'posts'
#    WHERE (
#    'posts'.'title' = 'Arel is Cool' 
#     AND
#     ('posts'.'id' = 22 OR 'posts'.'id' = 23)
#    )

# Using IN

Post.where(
  Post[:title].eq("Arel is Cool")
  .and(
    Post[:id].in(22, 23)
  ) 
)

# => SELECT 'posts'.* FROM 'posts'
#    WHERE (
#     'posts'.'title' = 'Arel is Cool' 
#     AND
#     'posts'.'id' IN (22, 23)
#    )

# Using our NamedFunction

Post.where(
  Post[:title].eq("Arel is Cool")
  .and(
    NamedFunction.new("LENGTH", [Post[:slug]]).gt(10)
  )
).to_sql
# => SELECT 'posts'.'title' = 'Arel is Cool' AND
#    LENGTH('posts'.'slug') > 10
```

## Using joins

### Setup

We'll assume the following setup:

```rb
class Post < ApplicationRecord
  has_many :comments
end

class Comment < ApplicationRecord
  belongs_to :post
  has_one :author
end

class Author < ApplicationRecord
  belongs_to :comment
end
```

### Using it

To use a regular `INNER JOIN` you would do the following:

```rb
Author.joins(
  Author.arel_table.join(Comment.arel_table)
    .on(Comment[:id].eq(Author[:comment_id]))
    .join_sources
)
.where(Post[:id].eq(42))
.to_sql
```

To use an `OUTER JOIN` you would do the following:

```rb
Author.joins(
  Author.arel_table.join(Comment.arel_table, Arel::OuterJoin)
    .on(Comment[:id].eq(Author[:comment_id]))
    .join_sources
)
.where(Post[:id].eq(42))
.to_sql
```

### Cleaning up with ArelHelpers

To clean up the above code we can use ArelHelpers `#join_association` method.

```rb
include ArelHelpers::JoinAssociation

# INNER JOIN
Author.joins(
  join_association(Author, :comment)
)
.where(Post[:id].eq(42))
.to_sql

# OUTER JOIN
Author.joins(
  join_association(Author, :comment, Arel::OuterJoin)
)
.where(Post[:id].eq(42))
.to_sql
```

## join_association block

Join associations can also yield a block and we can use that block to further specify join conditions.

```rb
Author.joins(
  join_association(Author, :comment) do |assoc_name, join_conds|
     join_conds.and(Comment[:created_at].lteq(1.day.ago))
   end
)
.where(Post[:id].eq(42))
.to_sql
```

### Join Tables


#### Setup

Given the following setup:
 
```rb
class Course < ApplicationRecord
  has_and_belongs_to_many :teachers
end

class Teacher < ApplicationRecord
  has_and_belongs_to_many :courses
end
```

2 possibilities:

A teacher can teach many courses
A course can have many teachers

This means there are 3 tables:

- Courses table
- Teachers table
- CoursesTeachers table

```rb
Course.arel_table # => courses
Teacher.arel_table # => teachers

# ??? No model for courses_teacher join table. 
```

To create a join_table you would do:

```rb
courses_teachers = Arel::Table.new(:courses_teachers)
```

Using the above variable we can then construct the following query:

```rb
Course.joins(
  Course.arel_table.join(Teacher.arel_table)
    .on(Course[:id].eq(courses_teachers[:course_id]))
    .and(Teacher[:id].eq(courses_teachers[:teacher_id]))
    .join_sources
)
```

## Order

```rb
# Using ActiveRecord
Post.order(:views)
Post.order(:views).reverse_order

# Using Arel
Post.order(Post[:views].desc).to_sql
Post.order(Post[:views].asc).to_sql
```

## IN

```rb
Post.where(
  Post.arel_table[:title].in(
    Post.select(:title).where(id: 5).ast
  )
)
```

## Like Queries with Matches

```rb
Post.where(Post[:title].matches("%arel%")).to_sql
# => SELECT 'phrases'.* from 'phrases'
#    WHERE ('phrases'.'key' LIKE x'256172656c25')
```

## Query Builder Pattern

```rb
class QueryBuilder
  # https://ruby-doc.org/stdlib-2.7.3/libdoc/forwardable/rdoc/Forwardable.html
  extend Forwardable
  attr_reader :query
  def_delegators :@query, :to_a, :to_sql, :each

  def initialize(query)
    @query = query
  end

  protected
  
  # instantiates a new class and allow chaining.
  def reflect(query)
    self.class.new(query)
  end
end
```

### Using it

```rb
class PostQueryBuilder < QueryBuilder
  def initialize(query = nil)
    super(query || Post.unscoped)
  end

  def with_title_matching(title)
    reflect(
      query.where(post[:title].matches("%#{title}%"))
    )
  end
  # PostQueryBuilder.new.with_title_matching("stimulus_reflex")

  def with_comments_by(usernames)
    reflect(
      query
        .joins(comments: :author)
        .where(Author[:username].in(usernames))
    )
  end

  # PostQueryBuilder.new.with_comments_by(["hopsoft", "leastbad"])

  def since_yesterday
    reflect(
      query.where(
        post[:created_at].gteq(1.day.ago) 
      )
    )
  end
end

PostQueryBuilder.new
  .with_title_matching("stimulus_reflex")
  .with_comments_by(["hopsoft", "leastbad"])
  .since_yesterday
```

## Scuttle!

http://www.scuttle.io/

Turns your SQL into Arel code.

Thanks for sticking with me, this is more of a reference for myself for the future!

## Bonus!

To see all the available matchers like:

- `#gt`
- `#gteq`
- `#lt`
- `#lteq`

You can run the following in the rails console:

```rb
bundle exec rails console

Arel::Predications.instance_methods
# => [
  :eq,
  :eq_any,
  :between,
  :not,
  # ...
]
```
