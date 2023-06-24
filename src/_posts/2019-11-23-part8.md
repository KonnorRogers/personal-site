---
title: PHP for Beginners - Part 8 - What the heck is PDO?
date: "2019-11-23T13:02:49"
description: Lets learn about PDO and why its important.
---

Okay, lets continue where we left off with MySQL prior to learning classes.

First, make sure your MySQL still works. Ensure you have a usable database for use
by the PDO builtin class for PHP.

```bash
$ mysql
$ -> create database mytodo; # Create the database
$ -> show databases # Ensure it appears
$ -> exit
```

Alright, now lets dive in.

```php
// index.php

<?php

try {
  $pdo = new PDO('mysql:host=127.0.0.1;dbname=mytodos', 'root', 'Medic12!');
} catch(PDOException $e) {
  die('could not connect.');
}

require 'index.view.php';
```

<br />
<br />
