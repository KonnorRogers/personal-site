require "fileutils"

class Commands < Thor
  desc "create_post FILE", ""
  def create_post(*files)
    base_dir = "src/_posts/"
    files.flatten(1).each do |file|
      date = Time.now.to_s.split(" ")[0]
      post_name = base_dir + date + "-" + file + ".md"
      puts "Creating: ", post_name

      title = file.split("-").map(&:capitalize).join(" ")

      data = <<~MD
        ---
        title: #{title}
        categories: []
        date: #{date}
        description: |
          #{title}
        published: false
        ---
      MD
      File.write(post_name, data)
    end
  end
end
