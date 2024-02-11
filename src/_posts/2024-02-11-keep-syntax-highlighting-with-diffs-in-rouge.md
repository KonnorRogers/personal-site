---
title: Keep Syntax Highlighting with Diffs in Rouge
categories: []
date: 2024-02-11
description: |
  Learn how to maintain proper syntax highlighting while using diffs in Rouge.
published: true
---

## The problem

Ever used rouge and want to show a diff, but notice you lose your language's syntax highlighting?

Me too.

If you haven't, here's a before and after using diffs and diffs with existing highlighting.

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;">
  <figure style="margin: 0;">
    <img src="/images/diff-without-highlighting.png" alt="">
    <figcaption>A picture of Rouge with only the <code class="highlight">diff</code> highlighting.</figcaption>
  </figure>
  <figure style="margin: 0;">
    <img src="/images/diff-with-highlighting.png" alt="">
    <figcaption>A picture of Rouge <code class="highlight">diff</code> highlighting and <code class="highlight">javascript</code>highlighting.</figcaption>
  </figure>
</div>

<br>

Alright? So how did we get there?

Well, after a lot of research it seemed that the combination of Kramdown and Rouge didn't really like the idea of multiple highlighters running on a single code block.

Here's some iterations of what I tried:

```markdown
~~~
~~~
{: .language-diff .language-js }

~~~ js:diff
~~~

~~~
~~~
{: class="language-diff language-js" }
```

Bridgetown / Kramdown weren't having it though. It would only ever take the first language defined.

So, off to the Rouge repo.

After a lot of searching I found this issue from 2017:

<https://github.com/rouge-ruby/rouge/issues/642>

It didn't have a lot of activity, and was closed with a workaround.

The workaround looked something like this:

```rb
require "rouge"

module Rouge
  module Lexers
    class JavascriptDiff < Javascript
      tag "javascript-diff"
      aliases "js-diff"


      # Ruleset courtesy of this issue:
      # https://github.com/rouge-ruby/rouge/issues/642
      rule(/^\+.*$\n?/, lexer::Generic::Inserted)
      rule(/^-+.*$\n?/, lexer::Generic::Deleted)
      rule(/^!.*$\n?/, lexer::Generic::Strong)
      rule(/^@.*$\n?/, lexer::Generic::Subheading)
      rule(/^([Ii]ndex|diff).*$\n?/, lexer::Generic::Heading)
      rule(/^=.*$\n?/, lexer::Generic::Heading)
    end
  end
end
```

And then in your markdown you would do something like the following:

```markdown
~~~js-diff
+ add
- delete
~~~
```

Which that solution kind of works. It's annoying to have to do that for every language. And also, I would like to be able to add diffs to any language I wanted. So of course, not being satisfied, here's how I hacked diffs into every Lexer from Rouge in my bridgetown site. At the bottom of my `config/initializers.rb` I added the following:


```rb
Bridgetown.configure do |config|
  # ...
end

require "rouge"

module Rouge
  module Lexers
    # These lexers don't implement the `prepend` class method so they'll raise an error if we don't skip them.
    problem_lexers = [
      ::Rouge::Lexers::ConsoleLexer,
      ::Rouge::Lexers::Escape,
      ::Rouge::Lexers::IRBLexer,
      ::Rouge::Lexers::PlainText
    ]

    ::Rouge::Lexer.all.each do |lexer|
      next if problem_lexers.include?(lexer)

      # Ruleset courtesy of this issue:
      # https://github.com/rouge-ruby/rouge/issues/642
      lexer.prepend :root do
        rule(/^\+.*$\n?/, lexer::Generic::Inserted)
        rule(/^-+.*$\n?/, lexer::Generic::Deleted)
        rule(/^!.*$\n?/, lexer::Generic::Strong)
        rule(/^@.*$\n?/, lexer::Generic::Subheading)
        rule(/^([Ii]ndex|diff).*$\n?/, lexer::Generic::Heading)
        rule(/^=.*$\n?/, lexer::Generic::Heading)
      end
    end
  end
end
```

Now I was able to add diffs into my markdown without needing to change anything. Do note,
I have no idea what this breaks, so use with caution. There's my disclaimer!

Anyways, I hope you found this useful, this has been annoying me forever and I'm happy to have finally found a solution.

Let me know how this works for you! And possibly what breaks! I'd be happy to edit this with a better solution!
