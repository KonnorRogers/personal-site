---
title: Learning PHP - Part 4 - Lets get conditional
date: "2019-08-19T00:28:06"
description: Dealing with conditionals and booleans
---

# Part 4

[Laracasts main site](https://laracasts.com)<br />
[Laracasts - PHP for beginners](https://laracasts.com/series/php-for-beginners)

## Chapters covered:

[Chapter 8 - Booleans](https://laracasts.com/series/php-for-beginners/episodes/8)<br />
[Chapter 9 - Conditionals](https://laracasts.com/series/php-for-beginners/episodes/9)

## Chapter 8 - Booleans

I diverged from laracasts here. I didn't want to make
multiple \<li\> tags, so I used a conditional which is
in the next chapter. The code is as follows:

```php
// index.view.php
<!-- Above HTML omitted for brevity -->
<ul>
  <?php foreach ($task as $key => $value) : ?>
    <li>
      <strong><?= ucwords($key); ?>: </strong>
        <?php if ($key == 'completed') {
          $value = ($value) ? 'Completed' : 'Incomplete';
        }; ?>
      <?= $value; ?>
    </li>
  <?php endforeach; ?>
</ul>
<!-- Below HTML omitted for brevity -->
```

<br />

Yes, I know it looks like a lot but lets highlight the keypart:

```php
<?php if ($key == 'completed') {
  $value = ($value) ? 'Completed' : 'Incomplete';
}; ?>
```

<strong>Line 1: </strong> <pre>&lt;?php if (\$key == 'completed')</pre>

If the current key equal to the string 'completed', then move to
the next line, if it's not equal to 'completed', then move past
the curly braces.

<strong>Line 2: </strong> `$value = ($value) ? 'Completed' : 'Incomplete';`
<br />
set $value equal to 'Completed' if TRUE set $value equal to 'Incomplete' if FALSE
'Incomplete'
<br />
This is called the "ternary operator" should you want to read more
<br />

<strong>Line 3: </strong> `}; ?\>`
<br />
End the block, continue to the end

<strong>
  <em>Note: </em>
</strong>
<br /> I cannot find any definitive documentation as to whether to use:
<br />
`True vs TRUE vs true`
<br />
`False vs FALSE vs false`
<br />
All of the above are booleans.

I found this article [PHP The Right Way Keyword & Type](https://www.php-fig.org/psr/psr-12/#25-keywords-and-types)

This suggests to use `true` and `false` for booleans

## Chapter 9 - Conditionals

Plain if statement in php:

```php
<?php

if (condition) {
  do stuff
} else {
  do other stuff
};

```

<br />

If statements that drop down to plain html to make it more readable:

```php
<!-- more HTML -->

<?php if (condition) : ?>
  <p><strong>Words</strong></p>
<?php else : ?>
  <h1>Do other stuff</h1>
<?php endif; ?>

<!-- more HTML -->
```

<br />

Checking if something is NOT true:

```php
<?php

$boolean = true
if (! $boolean){
  // Will run if the value of $boolean == false
} else {
  // Will run if the value of $boolean == true
}
```

This is called the "BANG" operator.

This is all I got for chapter 9. Lets move to chapter 10.

## Links

<strong>
  <a href="https://github.com/ParamagicDev/php-for-beginners)">Follow along with my repo</a>
  <br />
</strong>

[Laracasts main site](https://laracasts.com)
<br />
[PHP for beginners](https://laracasts.com/series/php-for-beginners)
<br />
[PHP The Right Way](https://phptherightway.com)
