---
title: Learning PHP - Part 5 - Lets make it functional
date: "2019-08-26T02:19:15"
description: "Lets learn a little bit about functions"
---

# Part 5

[Laracasts main site](https://laracasts.com)<br />
[Laracasts - PHP for beginners](https://laracasts.com/series/php-for-beginners)

## Chapters covered:

[Chapter 10 - Functions](https://laracasts.com/series/php-for-beginners/episodes/10)

### Chapter 10 - Functions

Functions are simple, but very powerful reusable pieces of code. They are the
building blocks of any language. Lets see how they help shape PHP.

```php
// index.php
<?php

// Will echo the values of $one, $two, and $three onto your web page
function dumper($one, $two, $three){
  var_dump($one, $two, $three);
}

```

Lets break it down.

`function` : This tells the PHP interpreter youre defining a function<br />
`dumper()` : 'dumper' is the name of the function when you call it<br />
`($one, $two, $three)` : These are whats called "arguments" or
"parameters". These are what are passed into the function, this can be blank.<br />

```php
{
  var_dump($one, $two, $three);
}
```

<br />

This calls the function:
[var_dump()](https://www.php.net/manual/en/function.var-dump.php)<br />
This will output your variables onto the page.<br />

Lets get a little bit more advanced. Lets create a dd() function.

```php
// index.php
<?php

// Die and dump
function dd($val){
  echo '<pre>';
  die(var_dump($val));
  echo '</pre>';
}

// Will stop anything after this function
dd('hello world');

// Will not run
dd('hi there');
```

Lets look at what `dd($val)` is doing.<br />

So first, it defines the function dd, then it will take in a 1 variable argument.<br />
Next, it will wrap the value of `die(var_dump($val)` inside of \<pre>\</pre> tags.
Finally, it will kill the execution of the php program. Equivalent to `exit`.

#### Homework

Assume you own a night club. Only allow people 21 or older inside and print a message
telling them if they're allowed to come in.<br />

My solution:

```php
// functions.php
<?php

function isOldEnough($age){
  return ($age >= 21 ? true : false);
}

function echoOldEnough($age){
  echo '<p>';
  echo 'You are, ' . $age . ". ";
  echo (isOldEnough($age) ? "You can enter the club." : "You cannot enter.");
  echo '</p>';
}

```

```php
// index.php
<?php

require 'functions.php';

echoOldEnough(21); // is allowed inside
echoOldEnough(20); // is not allowed inside
```

I'm not going to go too in depth, but basically `echoOldEnough()` is a wrapper around
`isOldEnough()`. This allows you to print a readable message on the webpage.<br />
This function is imported into 'index.php' when you run: <br />
`require 'functions.php';`

Lets go to Chapter 11 in the next part.

## Links

<strong>
  [Follow along with my repo](https://github.com/ParamagicDev/php-for-beginners)
  <br />
</strong>
[Laracasts main site](https://laracasts.com)
<br />
[PHP for beginners](https://laracasts.com/series/php-for-beginners)
<br />
