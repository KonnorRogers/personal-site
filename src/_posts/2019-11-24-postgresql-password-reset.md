---
title: PostgresQL - Setting up postgres on a local environment
date: "2019-11-24T20:59:03"
description: I will detail a short and easy way to get PostgresQL running on a Ubuntu based machine for local development.
---

## Purpose

Setting up a database for the first time is never any fun. In this short post I will detail how I have come to setup PostgresQL for local development environments.

### Quick Start

#### WARNING:

This will change all instances of /etc/postgresql/\*/main/pg_hba.conf auth options to 'trust' <br />

Proceed with caution:

```bash
git clone https://github.com/ParamagicDev/config-files.git ~/paramagic-config-files
cd ~/paramagic-config-files
./scripts/postgres-setup.sh
./scripts/postgres-pass-reset.sh

psql -U postgres

# This will drop you into a postgres instance as the admin
$ alter user postgres with password 'YOUR SNAZZY PASSWORD';
$ \q

# This will make postgres require a password in order
# to be instantiated
./scripts/postgres-md5-require.sh
```

### Explanation

Okay, I'm assuming you read the quick start, saw the warnings, and decided
to read a little more about whats happening in these scripts.

#### Installation scripts

##### [My PostgresQL scripts](https://github.com/ParamagicDev/config-files/tree/master/scripts)

The contents of these scripts was partially stolen from the [Official PostgresQL Dockerfile](https://github.com/docker-library/postgres/blob/4a82eb932030788572b637c8e138abb94401640c/12/Dockerfile)

So what does this script do?

Well first let me show you the contents.

```
#!/bin/bash

# postgres-setup.sh
pg_user="postgres"
pg_dir="/var/lib/postgresql"
pg_data="/var/lib/postgresql/data"

# Installs postgresql
sudo apt update && sudo apt install \
  postgresql postgresql-contrib postgresql-common libpq-dev -y

# Creates the postgres user and postgres group
sudo groupadd "$pg_user"
sudo useradd -r -g "$pg_user" --home-dir="$pg_dir" --shell=/bin/bash "$pg_user"

sudo mkdir -p "$pg_dir"
sudo chown -R "$pg_user":"$pg_user" "$pg_dir"

sudo mkdir -p "$pg_dir" && sudo chown -R "$pg_user":"$pg_user" "$pg_dir" && \
  sudo chmod 2777 /var/run/postgresql


# this 777 will be replaced by 700 at runtime (allows semi-arbitrary "--user" values)
sudo mkdir -p "$pg_data" \
  && sudo chown -R "$pg_user":"$pg_user" "$pg_data" \
  && sudo chmod 777 "$pg_data"bash
```

Basically, this script says:<br />

1. Download postgres from the apt repository (default debian based package manager)

   <br />

2. Then after downloading postgres, create a user for the postgres database named "postgres"

   <br />

3. Create the appropriate directories and change the read / write / execute properties of each directory based on the offical PostgresQL Dockerfile.
   <br />

In a nutshell, thats all that the script does.

Now, you can try logging into the database from the command line.

```bash
psql -U postgres
```

This probably will not work due to permissions set in a file called `pg_hba.conf`

For me, this file was located on my Ubuntu 18.10 & 19.04 machines in the location:

`/etc/postgresql/<version-number>/main/pg_hba.conf`

So heres where things get tricky. You may have previously setup a password youve forgotten, maybe theres something weird going on and you cant get into the database, anythings possible.

If you checked out the `pg_hba.conf file` you'll see a setup similar to this:

```conf
# ... above code omitted for brevity
# Database administrative login by Unix domain socket
local   all             postgres                                peer

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     peer
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
# IPv6 local connections:
host    all             all             ::1/128                 md5
# Allow replication connections from localhost, by a user with the
# replication privilege.
#local   replication     postgres                                peer
#host    replication     postgres        127.0.0.1/32            peer
#host    replication     postgres        ::1/128                 peer
```

Without getting too technical, the very last column of each row decides the
authentication option you would like to use. If for some reason you cannot
get access to your database, there may be a password set for the user that
you don't know.

The easiest way to fix this is to change all options in the last column to `trust`

I made a script specifically for changing the options in the last column to `trust`

#### [Change to trust script](https://github.com/ParamagicDev/config-files/blob/master/scripts/postgres-pass-reset.sh)

Now you can go in and change the password for the user to whatever you would like it to be.

```bash
psql -U postgres

# drops you into a postgres instance
-> alter user postgres with password 'NEW_PASSWORD'"
-> \q
```

This will change password of the user 'postgres' to the value of 'NEW_PASSWORD'

Now if you would like to lock your database back down I created a script for that as well!

#### [Reset auth options to md5 script](https://github.com/ParamagicDev/config-files/blob/master/scripts/postgres-md5-require.sh)

This will now require a password everytime you attempt to login.

### Additional notes

If you don't want to use my scripts you can manually edit your
`/etc/postgresql/<version_number>/main/pg_hba.conf` to reflect the options you would like.

Be careful with this, as for me I'm using postgresql version 11.5, however, when editing
`/etc/postgresql/11/main/pg_hba.conf` It did not properly reflect my settings.

I had to edit `/etc/postgresql/9.5/pg_hba.conf` which is the reason my scripts will change
the value of the auth method in all `/etc/postgresql/<version-number>/pg_hba.conf` files

### Closing thoughts

Setting up a database is never fun which is why I now always try to script the process.
This one had me stumped for a whole day before I came across the relevant articles. I hope
this article can help you as much as it helped me! Have a fantastic day.

Any questions feel free to email me: Konnor7414@gmail.com

I don't claim to know all, and I don't even work as a software developer fulltime....(yet)
I'm sure I made some errors and some mistakes. Feel free to correct me and I will update the article

Setting up a database is never fun which is why I now always try to script the process.
This one had me stumped for a whole day before I came across the relevant articles. I hope
this article can help you as much as it helped me! Have a fantastic day.

Any questions feel free to email me: Konnor7414@gmail.com

I don't claim to know all, and I don't even work as a software developer fulltime....(yet)
I'm sure I made some errors and some mistakes. Feel free to correct me and I will update the article.

### Links

#### [My config-files repo with postgres scripts](https://github.com/ParamagicDev/config-files/tree/master/scripts)

[PostgresQL Homepage](https://www.postgresql.org/)
[PostgresQL Dockerfile](https://github.com/docker-library/postgres/blob/4a82eb932030788572b637c8e138abb94401640c/12/Dockerfile)

[Where I found the sed scripts](https://enterprise.arcgis.com/en/server/10.3/cloud/amazon/change-default-database-passwords-on-linux.htm)

[How I figured out how to put multiple directories into a bash array](https://stackoverflow.com/questions/4494336/how-do-you-store-a-list-of-directories-into-an-array-in-bash-and-then-print-the)
