---
title: Learning PHP - Part 2 - Lets get coding!
date: "2019-08-18T04:03:54"
description: Learn php with me! Part 2
---

# Part 2

[Laracasts main site](https://laracasts.com)<br />
[Laracasts - PHP for beginners](https://laracasts.com/series/php-for-beginners)

## Chapters

[Chapter 2 - Install a code editor](https://laracasts.com/series/php-for-beginners/episodes/2)<br />
[Chapter 3 - Variables](https://laracasts.com/series/php-for-beginners/episodes/3)<br />
[Chapter 4 - PHP and HTML](https://laracasts.com/series/php-for-beginners/episodes/4)<br />
[Chapter 5 - Seperation of PHP logic](https://laracasts.com/series/php-for-beginners/episodes/5)

## Hello World

Are you really learning a new program if you don't create a simple hello world?

```php
// hello-world.php
<?php

echo 'Hello World';

```

<br />

In a terminal run:

```bash
php hello-world.php
```

<br />

Should echo 'Hello World' to the command line.

<strong>Note: </strong> Also of note, when in a plain php file, without the closing ?> it is best
practice due to parsing errors if you add extra lines after ?>

Easy win after the nightmare install process.

## Variables

```php
// index.php
<?php

$name = 'Konnor Rogers';

// Concats $name onto 'Hello'
echo 'Hello' . $name;

// Or
echo "Hello {$name}";
```

<br />

## HTML + PHP

Pulling in parameters

```php
// index.php
<?php

// pulls in the 'name' parameter
$name = htmlspecialchars($_GET['name']);

echo "Hello, " . $name;
// localhost:8888/?name=konnor #=> Hello, Konnor
```

<br />

`htmlspecialchars();` Will convert special characters as the name suggests so
people cannot inject malicious links, scripts, etc

## Seperating php logic

In a small low level MVC framework, this is a microcosm of a view.
index.view.php is essentially a template to be rendered, and index.php provides
any necessary variables to be rendered. For example: <br />
`$greeting` may be the result of a database call. You want that to be done server
side without concern for the actual way it is being rendered.

```php
// index.php
<?php

$greeting = 'Hello World';

// pulls in the view defined below
require 'index.view.php';
// Optionally, you can use: include 'index.view.php';
// Read the note below about the difference
```

<br />

<strong>Note: </strong> After perusing some documentation, `include` and `require`
do essentially the same thing. They pull in variables and other data @ the level
it is called. The only difference is the following:
<br />
`include` <em>will not cause</em> a compilation error if the file does not exist
or is unreadable. It will only send a compilation warning.
<br />
`require` <em>will cause</em> a compilation error if the file does not exist or is
unreadable

```php
// index.view.php
<!DOCTYPE html>
<html lang="en">
  <meta charset="UTF-8">
  <title>Document</title>
  <style>
    header {
      background: #e3e3e3;
      padding: 2rem;
      text-align: center;
    }
  </style>
  </head>
  <body>
    <header>
      <h1><?= $greeting; ?></h1>
    </header>
  </body>
</html>
```

<br />

`<?= ?> is the same as <?php echo "string" ?>`

## Links

<strong>
  [Follow along with my repo](https://github.com/ParamagicDev/php-for-beginners)
</strong>
<br />
[Laracasts main site](https://laracasts.com)
<br />
[PHP for beginners](https://laracasts.com/series/php-for-beginners)
<br />
