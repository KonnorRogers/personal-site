---
title: Active Storage Variants with Rails 6.1
date: "2021-02-24T14:12:29"
description: "receiving the following error with ActiveStorage Variants with Rails 6.1? ActiveRecord::NotNullViolation (PG::NotNullViolation: ERROR:  null value in column 'record_id' of relation 'active_storage_attachments' violates not-null constraint) Let me help!"
---

<h2 id="error">
  <a href="#error">
    The Error!
  </a>
</h2>

Upgrading to Rails 6.1 and encountering the following error?

> ActiveRecord::NotNullViolation (PG::NotNullViolation: ERROR: null value
in column "record_id" of relation "active_storage_attachments" violates
not-null constraint)

Let me save you a couple hours!

Lets back up a step. Are you using `t.uuid :record_id` (is your
record_id for ActiveStorage a uuid?)

If you're not sure, you can check your `db/schema.rb`

```rb title=db/schema.rb
  create_table "active_storage_attachments", force: :cascade do |t|
    # ...
    t.uuid "record_id", null: false
    # ...
  end
```

If yes, keep reading. If not, sorry, this wont be much help.

<h2 id="using-uuid-me-too">
  <a href="#using-uuid-me-too">
    Using UUID for record_id, cool I was too
  </a>
</h2>

Alright now that we've located the source how do we fix it?

When you run `rails app:update` or `rails active_storage:update` it will
create 2 migrations for you. In particular we want to look at the one
generating the `active_storage_variant_records` table. The file should look
something like this:

```rb title=db/migrate/xxxx_create_active_storage_variant_records.active_storage.rb
class CreateActiveStorageVariantRecords < ActiveRecord::Migration[6.0]
  def change
    create_table :active_storage_variant_records do |t|
      t.belongs_to :blob, null: false, index: false
      t.string :variation_digest, null: false

      t.index %i[ blob_id variation_digest ], name: "index_active_storage_variant_records_uniqueness", unique: true
      t.foreign_key :active_storage_blobs, column: :blob_id
    end
  end
end
```

From here the fix is just to add a `uuid` constraint for the id like so:

```diff title=db/migrate/xxxx_create_active_storage_variant_records.active_storage.rb
class CreateActiveStorageVariantRecords < ActiveRecord::Migration[6.0]
  def change
-    create_table :active_storage_variant_records do |t|
+    create_table :active_storage_variant_records, id: :uuid do |t|
     # ...
  end
end
```


Now rollback your migrations, rerun your migrations, and onward to
victory!!

<h2 id="links">
  <a href="#links">
    Links
  </a>
</h2>

<h3 id="active-storage-docs">
  <a href="#active-storage-docs">
    Active Storage docs
  </a>
</h3>

- https://edgeguides.rubyonrails.org/active_storage_overview.html#setup

<h3 id="rails-6-1-migration">
  <a href="#rails-6-1-migration">
    Rails 6.1 migration docs
  </a>
</h3>

- Release notes:
https://edgeguides.rubyonrails.org/6_1_release_notes.html

- Upgrade guide: https://guides.rubyonrails.org/upgrading_ruby_on_rails.html
