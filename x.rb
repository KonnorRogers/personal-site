#!/usr/bin/env ruby

require "json"
require "net/http"
require "time"


username = "konnorrogers"

json = JSON.parse(
  Net::HTTP.get(URI("https://dev.to/api/articles?username
=#{username}"))
)

# Alternatively we could write to a file to explore the data.
# filename = "./articles.json"
# File.write(filename,
#   JSON.pretty_generate(
#     JSON.parse(
#       Net::HTTP.get(URI("https://dev.to/api/articles?username
# =#{username}"))
#     )
#   ).to_s
# )
#
# Read from the file we generated
# json = JSON.parse(
#   File.read(filename)
# )

sleep 1

json.each do |obj|
  title = obj["title"]
  file_title = title.downcase.gsub(/[^0-9a-z]/i, "-").split(/-+/).join("-")

  # don't waste an API call!
  next if File.exist(file_title)

  description = obj["description"]
  categories = obj["tag_list"]
  date = Time.parse(obj["published_at"]).to_s

  file_date = date.split(" ").first

  article_path = obj["path"]
  article_url = URI("https://dev.to/api/articles#{article_path}")

  article_json = JSON.parse(Net::HTTP.get(article_url))
  body_markdown = article_json["body_markdown"]

  filepath = "./src/_posts/#{file_date}-#{file_title}.md"
  content = "---\n"
  content << "title: #{title}\n"
  content << "categories: #{categories}\n"
  content << "date: #{date}\n"
  content << "description: |\n  #{description}"
  content << "---\n\n"
  content << body_markdown

  File.write(filepath, content, mode: "w")

  # One second seems to be the secret sauce to get around rate limiting.
  sleep 1
end
