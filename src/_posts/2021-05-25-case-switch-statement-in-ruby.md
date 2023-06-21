---
title: Case / Switch Statement in Ruby
categories: [ruby, case, conditional]
date: 2021-05-25 00:12:18 UTC
description: |
  Why is this here?   I always forget how to write case statements and always find myself look...
---

## Why is this here?

I always forget how to write case statements and always find myself looking it up. This is my note to future self on how to write case / switch statements in Ruby.

## Syntax

Syntax for a case statement is as follows:

```rb
case argument
when condition
  # do stuff
else
  # do stuff if nothing else meets the condition
end
```

"Else" is optional and represents the "default" case.

All case statements written in this syntax are compared with the `===` operator so be aware of that! `===` has slightly different semantics from `==` which can be found here:

This same `===` feature is what allows us to compare Regexs on Strings and other cool behavior. `===` is overriden by individual modules but is _usually_ aliased to `==`



## Basic statement

```rb
arg = "blah"
case arg
when /blah/
  puts "woah, what a blah!"
else
  puts "Theres no blah here!"
end
```

## Adding multiple conditionals

```rb
def fruit_identifier(fruit)
  case fruit
  when "orange", "grapefruit"
    puts "Woah! Thats some good citrus!"
  when "apple", "banana", "pear"
    puts "Just some normal fruits. Nothing to see here."
  end
end
```

## One liners

```rb
def one_line_case
  case "only_one"
  when "only_one" then puts "Look ma! One line!"
  end
end
```

## if / else syntax

```rb
a = 2
case
when a == 1, a == 2
  puts "a is one or two"
when a == 3
  puts "a is three"
else
  puts "I don't know what a is"
end
```

## Further Reading

https://www.rubyguides.com/2015/10/ruby-case/

https://ruby-doc.org/core-2.7.3/doc/syntax/control_expressions_rdoc.html#label-case+Expression
