---
title: Migrating HLS videos to Mp4 format in Rails.
categories: ["hls", "video", "rails", "activestorage"]
date: 2021-07-02 00:13:36 UTC
description: |
  Purpose   Recently, I was tasked with migrating our HLS videos over to mp4 format and store...---

## Purpose

Recently, I was tasked with migrating our HLS videos over to mp4 format and store it on S3 for a variety of reasons. I wanted to document the magic incantations I followed to make this happen.

## The FFMPEG command.

The first step is how do you convert HLS to mp4. Well, theres a number of ways. FFMPEG is my go to solution because its widely available and generally on most servers.

To begin, I googled around and found this was the secret sauce to be able to convert HLS video into mp4.

```bash
ffmpeg -i <input> -acodec copy -bsf:a aac_adtstoasc -vcodec copy <output>
```

Whats super cool to note is `<input>` can actually be a fully qualified `https://provider/video.m3u8` url so the HLS manifest doesn't have to be available locally.

## Moving it to Rails

Okay, but how do we do that in Rails?

```rb
system("ffmpeg", "-i", hls_url, "-acodec", "copy", "-bsf:a", "aac_adtstoasc", "-vcodec", "copy", path)
```

You'll notice I didn't make this one big string. Instead the first argument is the command, and everything else afterwards are flags. The reason for this is to help prevent command injection.

## Whats next

Alright, now that we have the command to convert the video, now we have to clean up some loose ends including generating a temporary file for storage, and then shoving the file contents into S3 via ActiveStorage.

### Housekeeping

Since I know this method is going to do a couple things, lets call it `migrate_to_mp4`. This method will also exist on the `Video` model and the `Video` will have one attached mp4 video like so:

```rb
class Video < ApplicationRecord
  has_one_attached :mp4_video
  
  def migrate_to_mp4
    system("ffmpeg", "-i", hls_url, "-acodec", "copy", "-bsf:a", "aac_adtstoasc", "-vcodec", "copy", path)
  end
end
```

### Generating a temporary file

Now that we have some structure in place, lets work on expanding this method to actually work!

```rb
  def migrate_to_mp4
    tempfile = ::Tempfile.new(["video", ".mp4"])
    path = tempfile.path
    tempfile.close
    tempfile.unlink

    # hls_url is a db column on the video record.
    system("ffmpeg", "-i", hls_url, "-acodec", "copy", "-bsf:a", "aac_adtstoasc", "-vcodec", "copy", path)
  end
```

First we create a `Tempfile` which has a number of semantics that make it great for creating...you guessed it, temporary files.

By passing `::Tempfile.new` an array we say: "Generate a temporary file with a random name prefixed with 'video' and ending with '.mp4'"

Next we save its path since its going to be unique. Then we close it and unlink it so it gets deleted immediately. We do this because if the file exists, FFMPEG will give us a warning and we have to manually address it which we dont want to have to do.

Finally, we pass the path along to the ffmpeg command and we're nearly done!

### Writing to ActiveStorage

The next step is to write this newly created file to ActiveStorage. To do so, we call the `#attach` method on `mp4_video`.

Like so:

```rb
mp4_video.attach(io: File.open(tempfile), filename: "video-#{id}.mp4")
```

### Cleaning up

Okay we did it! Its done! Not quite, theres still a couple other loose ends to tie up. First, since we actually wrote this file onto disk, we should delete it. We should also wrap FFMPEG in a `begin/ensure` clause to ensure we delete the file regardless of whether or not it succeeds.

Heres what our final method looks like:

```rb
  def migrate_to_mp4
    return if hls_url.blank?

    tempfile = ::Tempfile.new(["video", ".mp4"])
    path = tempfile.path
    
    # We dont actually want the tempfile, just its path.
    tempfile.close
    tempfile.unlink

    begin
      system("ffmpeg", "-i", hls_url, "-acodec", "copy", "-bsf:a", "aac_adtstoasc", "-vcodec", "copy", path)
      mp4_video.attach(io: File.open(tempfile), filename: "video-#{id}.mp4")
    ensure
      # always cleanup our mess.
      File.delete(path)
    end
  end
```

Alright thats the final method I ended up with!


## Closing thoughts

There are a couple extra steps as part of the migration process that I'll add here. I also had to do the following:

1.) Find all videos not migrated
2.) If they're not migrated, migrate them.

So this is easily broken up into 2 parts. The first part is writing the query to find all non-migrated videos. Heres what my query looked like:

```rb
  scope :not_migrated,
        -> {
          left_joins(
            :mp4_video_attachment,
          ).finished.where(active_storage_attachments: {id: nil})
        }
```

Alright, that takes care of _HOW_ to find not migrated videos. The next step is to do something about it.

When I find I need to do imperative items like this, I like to reach for `ActiveJob`. We also use Sidekiq so its worth noting to make sure to use JSON serializable parameters with Sidekiq.

Heres what my job to migrate looked like:

```rb
class MigrateVideoStorageJob < ApplicationJob
  queue_as :default

  def perform(video_id=nil)
    if video_id.blank?
      ids = Video.not_migrated.ids

      ids.each { |id| MigrateVideoStorageJob.perform_later(id) }
      return
    end

    video = Video.find(video_id)

    return if video.mp4_video.attached?

    video.migrate_to_mp4
  end
end
```

So then, in a console you can do the following:

```bash
bundle exec rails console
MigrateVideoStorageJob.perform_later
```

Now there are some issues with this job. 

The first issue is that it goes 1 by 1 which means for every video we're going to incur a full DB query. 

Its not great, but there was only roughly 100 videos to migrate so I didn't think it was worth batching and worrying about performance. 

"Real artists ship".

## Yes. We're done.

Anyways, this was my foray into migrating HLS videos over to MP4 videos. Thanks for coming along for the ride!