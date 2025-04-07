---
title: Inserting Many Users From JSON using Postgres
categories: []
date: 2025-04-07
description: |
  A small walkthrough of inserting many users into a Postgres database from JSON using Common Table Expressions (CTEs)
published: true
---

## The problem

My full time day job is working at [Font Awesome](https://fontawesome.com/) on the [Web Awesome](https://webawesome.com)
design system. Side note, at some point that Web Awesome link will go from Kickstarter to an actual Web Awesome website...this blog post is part of making that happen.

Anyways, we had many people back us on Kickstarter. Our goal when we go live with the Web Awesome site is to "reserve" the user's emails for them so they can "claim" their account using the email they backed us with. To do so, we need to create accounts for them.

We have a CSV from Backerkit with a number of emails, backerkitIds, and what "plan" they backed with.

Of course new users can keep getting added to the CSV after the site goes live, so I need this action to be repeatable ("idempotent" if you will).

But we won't get into that. I'm more concerned with "How can we bulk insert this CSV without making multiple round trips to the database?"

The first step is easy. Convert the CSV to JSON. Now how do we use that JSON with Postgres?

## jsonb_to_recordset has arrived

To solve our problem of turning our JSON into a usable query syntax for Postgres, we can use `jsonb_to_recordset`. `jsonb_to_recordset` basically takes a JSON array and turns it into an array of insertable values, but we need to tell it how to "coerce" the data and what keys to look for.

```sql
SELECT "email", "seats", "backerkitId", "planType"
FROM jsonb_to_recordset('[{"backerkitId":"1","email":"konnor@fontawesome.com","seats":1,"planType":"pro"},{"backerkitId":"2","email":"konnor@webawesome.com","seats":5,"planType":"pro"}]'::jsonb) AS t (
	  "email" text,
	  "backerkitId" text,
	  "seats" int,
	  "planType" text
)
```

BOOM! Done right?

Eh...not quite. We still need to do something with this data. We need to insert it into the following tables:

`users`, `teams`, and `team_memberships`

According to the lovely Andrew Culver, [Teams are a first class feature](https://blog.bullettrain.co/teams-should-be-an-mvp-feature/), and I agree! So now we need to take that data, and insert it into the appropriate tables + columns. But we want to do this fairly efficiently. We could have multiple write + read queries and iterate over multiple arrays, but thats not particularly fun. So, how can we "cache" some data after inserting it?

## Enter Common Table Expressions (CTEs)

Common Table Expressions sound scarier than they are. I like to think of them as "cached queries". They run prior to your follow up queries and maintain the results for you to access as needed. Perhaps "virtual results?" I don't know. Is this "correct"? Probably not. But thats how my brain works, so apologies in advance for "incorrectness".

Moving on, the initial CTE to generate the users and teams was a breeze. I was done in like 30minutes.

```sql
WITH
	data AS (
	    SELECT "email", "seats", "backerkitId", "planType"
	    FROM jsonb_to_recordset('[{"backerkitId":"1","email":"konnor@fontawesome.com","seats":1,"planType":"pro"},{"backerkitId":"2","email":"konnor@webawesome.com","seats":5,"planType":"pro"}]'::jsonb) AS t (
	        "email" text,
	        "backerkitId" text,
	        "seats" int,
	        "planType" text
	    )
	),

	users AS (
	    INSERT INTO users ("email", "backerkitId")
	    SELECT "email", "backerkitId"
	    FROM data
	    RETURNING *
	),
	teams AS (
	    INSERT INTO teams ("seats", "hasActiveSubscription", "teamType", "planType")
	    SELECT "seats", TRUE, 'team', "planType"
	    FROM data
	    RETURNING *
	)
```

Perfect! We have users, we have teams! We're done now??

Nope. And we have a particularly thorny problem. We have no way to join `teams` and `users` to insert into our `team_memberships` table, and the only common link between teams and users is their "insertion order".


After a lot of searching and digging I came across `row_number() OVER ()` which is basically just "the current index of the current row"

> The ROW_NUMBER() function is a window function that assigns a sequential integer to each row in a result set.

<https://neon.tech/postgresql/postgresql-window-function/postgresql-row_number>

So with the ability to now have the insertion index, we dont need to modify any columns in our users or teams tables, instead, we can have an additional CTE for both users and teams to assign an `"insertionId"` and then join on that `"insertionId"` and create the `team_memberships` with the appropriate foreign keys.

Here is what that looks like in code:

```sql
WITH
data AS (
	  SELECT "email", "seats", "backerkitId", "planType"
	  FROM jsonb_to_recordset('[{"backerkitId":"1","email":"konnor@fast.com","seats":1,"planType":"pro"},{"backerkitId":"2","email":"konnor@fasst.com","seats":5,"planType":"pro"}]'::jsonb) AS t (
	      "email" text,
	      "backerkitId" text,
	      "seats" int,
	      "planType" text
	  )
),

users AS (
	  INSERT INTO users ("email", "backerkitId")
	  SELECT "email", "backerkitId"
	  FROM data
	  RETURNING *
),
users_with_insertion_ids AS (
	  SELECT *, row_number() OVER () AS "insertionId" FROM users
),
teams AS (
	  INSERT INTO teams ("seats", "hasActiveSubscription", "teamType", "planType")
	  SELECT "seats", TRUE, 'team', "planType"
	  FROM data
	  RETURNING *
),
teams_with_insertion_ids AS (
	  SELECT *, row_number() OVER () AS "insertionId" FROM teams
),
team_membership_foreign_keys AS (
	  SELECT u."id" as "userId", t."id" as "teamId"
	  FROM users_with_insertion_ids u
	  JOIN teams_with_insertion_ids t ON u."insertionId" = t."insertionId"
)

INSERT INTO team_memberships ("userId", "teamId", "role", "state")
SELECT "userId", "teamId", 'owner', 'accepted' from team_membership_foreign_keys
```

There's a few tricks in the above like "table aliasing" to make table names more manageable, but the big thing is the 2nd query which maps over the users and teams queries respectively and adds an "insertionId" (we could call this anything, maybe insertionIndex makes more sense?).

Anyways, this problem was thornier than I originally thought, but I was glad I was able to solve it and come away with a few extra Postgres tricks and *finally* understand common table expressions.

Obviously some of the code above was altered from what is actually in the codebase, some comments added, etc. But this is the rough gist of what I did!

Thanks for reading, and hopefully you learned something new! Or refreshed existing knowledge!
