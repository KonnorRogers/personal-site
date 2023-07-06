require 'bundler/inline'

gemfile do
  source 'https://rubygems.org'
  gem "front_matter_parser"
end

puts 'Gems installed and loaded!'

require "fileutils"
require "front_matter_parser"
require "time"

Dir["./**/*.md"].each do |file|
  parsed = FrontMatterParser::Parser.parse_file(file)
  new_file_name = File.basename(file)
  date = Time.parse(parsed["date"]).to_s
  file_date = date.split(" ").first
  new_file_name = file_date + "-" + new_file_name
  new_file_name.gsub!(/([A-Z])/, '-\1')
  new_file_name.downcase!
  puts new_file_name
  FileUtils.cp(file, "./flat_posts/#{new_file_name}")

end
