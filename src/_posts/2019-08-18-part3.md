---
title: Learning PHP - Part 3 - Arrays, Arrays, and more Arrays
date: "2019-08-18T19:27:44"
description: Lets dive deep into arrays and associative arrays
---

# Part 3

[Laracasts main site](https://laracasts.com)<br />
[Laracasts - PHP for beginners](https://laracasts.com/series/php-for-beginners)

## Chapters covered:

[Chapter 6 - Understanding Arrays](https://laracasts.com/series/php-for-beginners/episodes/6)<br />
[Chapter 7 - Associative Arrays](https://laracasts.com/series/php-for-beginners/episodes/7)<br />

## Chapter 6 - Understanding Arrays

### Looping through an array

```php
// index.php
<?php

$names = ['Bob', 'Billy', 'Jimmy'];

foreach ($names as $name) {
  echo $name . ', ';
};

// Outputs: Bob, Billy, Jimmy,
```

<br />

Alright, now lets break it out to the view and create a list:

```php
// index.php
<?php

$names = ['Bob', 'Billy', 'Jimmy'];
```

```php
// index.view.php
<ul>
  <?php
    foreach ($names as $name) {
      echo "<li>$name</li>";
    }
  ?>

  <-- Alternative syntax -->
  <?php foreach ($names as $name) : ?>
    <!-- PHP parsing has stopped, drop to HTML -->
    <li>
      <!-- Start parsing PHP -->
      <?= $name ?>
      <!-- End parsing PHP -->
    </li>
  <!-- End the loop by parsing PHP again -->
  <?php endforeach; ?>
</ul>
```

<br />

This will produce the following:

---

> - bob
> - billy
> - jimmy
> - bob
> - billy
> - jimmy

---

## Chapter 7 - Associative Arrays

These appear to me to be similar to a ruby hash so here we go:

```php
// index.php
<?php

$person = [
  'age' => 23,
  'hair' => 'blonde',
  'career' => 'web developer'
];

require 'index.view.php';
```

```php
// index.view.php
<!-- Above html omitted for brevity -->
<ul>
  <?php foreach ($person as $key => $feature) : ?>
    <li>
      <strong><?= $key; ?>: </strong><?= $feature; ?>
    </li>
  <?php endforeach; ?>
</ul>
<!-- Below html omitted for brevity -->
```

This will produce the following:

---

> - <strong>age: </strong>23
> - <strong>hair: </strong>blonde
> - <strong>career: </strong>web developer

---

### Pushing to Arrays

```php
// index.php
<?php

// Pushing to associative arrays
$person = [
  'age' => 23,
  'hair' => 'blonde',
  'career' => 'web developer'
];

$person['name'] = 'Bob';
// Appends bob to $person

// Pushing to non-associative arrays
$animals = ['dog', 'cat'];

$animals[] = 'zebra';
// Appends 'zebra' to $animals
```

### Printing Arrays

```php
// index.php
<?php

$person = [
  'age' => 23,
  'hair' => 'blonde',
  'career' => 'web developer'
];

$person['name'] = 'Bob';

// Will convert the array to a string then print it
var_dump($person);

// Will stop parsing after this function, will still print $person
die(var_dump($person));

// Wont get evaluated because of die();
require 'index.view.php'
```

### Removing an item from an associative array

```php
// index.php
<?php

// associative array
$person = [
  'age' => 23,
  'hair' => 'blonde',
  'career' => 'web developer'
];

// Remove hair
unset($person['hair']);

/* $person = [
    'age' => 23,
    'career' => 'web developer'
    ]
*/
```

### Homework

```php
// homework.php
<?php

$task = [
  'title' => 'Renew registration',
  'due_date' => 'tomorrow',
  'assigned_to' => 'Konnor',
  'completed' => True
];
```

## Links

<strong>
  [Follow along with my repo](https://github.com/ParamagicDev/php-for-beginners)
  <br />
</strong>
[Laracasts main site](https://laracasts.com)
<br />
[PHP for beginners](https://laracasts.com/series/php-for-beginners)
<br />
