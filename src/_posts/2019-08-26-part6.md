---
title: Learning PHP - Part 6 - MySQL? Or Your SQL?
date: "2019-08-26T02:24:59"
description: "Lets learn some basics of SQL based databases, in this case, MySQL"
---

# Part 6

[Laracasts main site](https://laracasts.com)<br />
[Laracasts - PHP for beginners](https://laracasts.com/series/php-for-beginners)

## Chapters covered

[Chapter 11 - Databases 101](https://laracasts.com/series/php-for-beginners/episodes/11)

### Chapter 11 - MySQL 101

Now its time to switch gears. Lets learn about MySQL. Its a relational database,
or SQL-based database, which essentially means everythings related, as implied
by the name via various 'id' columns. SQL stands for 'Structured Query Language'.
It's simply a standardized way of accessing data in a database.

This is in contrast to a NoSQL-based database. The most obvious NoSQL-based database
is MongoDB. NoSQL essentially follows a way of storing data nonrelationally. I won't
get into the advantages and disadvantages of both, just know that both exist.

#### Installing MySQL - Ubuntu 18.04

Feel free to check out [MySQL downloads page](https://www.mysql.com/downloads/) for
your specific needs.

For me I used the following:

```bash
sudo apt update
sudo apt install -y mysql-server # installs mysql
sudo mysql_secure_installation # will provide various prompts
```

<br />

Ensure its working:

```bash
mysql # enters a prompt
  -> exit
sudo service mysql status
sudo service mysql stop
sudo service mysql start
sudo service mysql status
```

<br />

<em>
  If you are having permission issues: <a href="#issues">Check this out</a>
</em>

There are additional configs to add users, but thats a little
too advanced for what were doing here.

#### Using MySQL

Creating your first database:

```bash
mysql
 -> show databases;
# Lists databases
 -> create database todo;
# Query OK, 1 row affected
 -> show databases; # should show mytodo
 -> use mytodo; # This tells mysql what database to switch into and use
 -> show tables; # should be empty
 -> CREATE TABLE todos (description TEXT, completed BOOLEAN);
# Query OK, 0 rows affected
 -> show tables; # Should show your new todos table
 -> describe todos; # Shows your fields and types
 -> drop tables; # Removes your todos tables
 -> CREATE TABLE todos (id INTEGER PRIMARY KEY AUTO_INCREMENT, description TEXT NOT NULL, completed BOOLEAN NOT NULL);
 -> show tables;
 -> describe todos;
```

<br />

I'm not going to get too in depth with the above commands, but I will touch on the
following query.

Here's the command:<br /><br />
`CREATE TABLE todos (id integer PRIMARY KEY AUTO_INCREMENT, description text NOT NULL, completed boolean NOT NULL);`<br />

Here's what it's doing:

`CREATE TABLE todos();` Create the table called 'todos'<br />
`id integer PRIMARY KEY AUTO_INCREMENT`: The first field will be the `id` field,
this field will accept an `INTEGER`. This field will also be the `PRIMARY KEY`.
This means that the `id` will be the unique identifier for whatever data is stored.
`AUTO_INCREMENT` means the user does not have to supply the id integer. Instead, the
database will automatically set the id starting from 1.<br />

#### Manipulating a tables data

```bash
mysql
-> INSERT INTO todos (description, completed) VALUES('Go to the store', false);
# Will auto-add the id, will add the description 'Go to store', and the boolean false

-> SELECT * FROM todos;
# Will show all columns in the todos table
```

#### Summarizing

#### Installing a MySQL GUI - [MySQL-Workbench](https://dev.mysql.com/doc/workbench/en/)

`mysql` Start mysql

`-> create database \<database\>;` Create the database with \<database\>.

`-> use database <\database\>;` Set the current database to query to \<database\>.

`-> CREATE TABLE \<table\>(<\fields\>);` Create a table within the database with a name of \<table\>
and has the following \<fields\>.

`-> show tables;` List the tables in your database.

`-> describe <\table\>;` Shows the fields of the given \<table\>.

Simple manipulation:

`-> INSERT INTO <\table\>(<\field1\>, \<field2\>) VALUES(<\value1\>, <\value2\>);`
Insert the following
values into the specified \<field\> for the given table name. Order is important.

`-> SELECT * FROM \<table\>;`

Allows you to view all columns and their data from the given
\<table\>.

`-> SELECT * FROM \<table\>WHERE id = 1;`

Select all columns from \<table\> but only where the id is equal to 1.

Now using the command line for everything is not very fun. You can simply google:

'mysql database GUI tools'

I decided to use the officially supported mysql-workbench.

```bash
sudo apt install mysql-workbench
mysql-workbench
```

Easy, simple, I like it.

<h3 id="issues">Issues</h3>

#### Running mysql without sudo

<strong>Note: </strong> I ran into the issue of having to run mysql without sudo.
I found this guide: [DigitalOcean Guide to MySQL](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-18-04).

```bash
sudo mysql -> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password
BY 'password'; -> FLUSH PRIVILEGES;
```

Yes, you can create a new user and then provide privileges that way. Again, beyond
the scope of this, and this wont be used in production either.

#### Running mysql-workbench without sudo

I also had an issue running mysql-workbench without sudo. I solved this by
chowning ~/.mysql

```bash
sudo chown $USER:$USER ~/.mysql
mysql-workbench
```

<br />

I'll let you figure out other configurations with mysql-workbench. Play around with
it. Don't rush, find other commands. Have fun! Ill see you in the next part about
classes.

## Links

<strong>
  <a href="https://github.com/ParamagicDev/php-for-beginners">My repo
  </a>
  <br />
</strong>
[Laracasts main site](https://laracasts.com)
<br />
[PHP for beginners](https://laracasts.com/series/php-for-beginners)
<br />
[MySQL downloads page](https://www.mysql.com/downloads/)
<br />
[DigitalOcean Guide to MySQL](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-18-04).
<br />
[MySQL-Workbench](https://dev.mysql.com/doc/workbench/en/)
<br />
