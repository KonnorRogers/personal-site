---
title: Getting Started with Rails 6
date: "2020-05-03T17:56:32"
description: A guide to getting setup with Rails 6 using Docker
---

## Purpose

The purpose of this is to have a reusable source for setting up a Rails
6 project.

I will be using the [Getting Started with Rails
Guide](https://guides.rubyonrails.org/getting_started.html) to setup a
new Rails projects.

Initially I used [Docker Quickstart with Compose and Rails
guide](https://docs.docker.com/compose/rails/) but quickly realized I
had other needs for Rails 6. My docker setup is the result of multiple
resources.

I will also be using Docker just to provide a consistent development
environment. Docker is not required, I used it simply to be able to
provide a reproducible environment.

Source code can be found here:

[https://github.com/ParamagicDev/getting-started-with-rails-6](https://github.com/ParamagicDev/getting-started-with-rails-6)

Deployed application can be found here:

[https://getting-started-with-rails-6.herokuapp.com/](https://getting-started-with-rails-6.herokuapp.com/)

<h2 id="table-of-contents">
  <a href="#table-of-contents">Table Of Contents</a>
</h2>

- [Prerequisites](#prerequisites)
- [Main Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Adding a Dockerfile](#adding-a-dockerfile)
  - [Adding a Gemfile](#adding-a-gemfile)
  - [Adding a package.json](#adding-a-package.json)
  - [Adding entrypoint.sh](#adding-entrypoint-sh)
  - [Adding docker-compose.yml](#adding-docker-compose-yml)
  - [Adding a .dockerignore file](#adding-a-dot-docker-ignore-file)
  - [Prebuild Directory Structure](#prebuild-directory-structure)
  - [Prebuild Reference Repository](#prebuild-reference-repository)
  - [Postbuild Directory Structure](#postbuild-directory-structure)
  - [Postbuild Reference Repository](#postbuild-reference-repository)
- [Building the Project](#building-the-project)
  - [Create the Rails app](#create-the-rails-app)
    - [Ownership Issues](#ownership-issues)
  - [Building the Docker Container](#building-the-docker-container)
  - [Connecting the Database](#connecting-the-database)
- [Using Docker](#using-docker)

  - [Stopping the Application](#stopping-the-application)
  - [Starting the Application](#starting-the-application)
  - [Extra Tips](#extra-tips)
  - [Useful Commands](#useful-commands)

- [Adding additional functionality](#adding-additional-functionality)
- [Deployment](#deployment)
- [Issues](#issues)
- [I know what I'm doing](#i-know-what-im-doing)
- [Links](#links)
  - [Github Source Code](#source-code)
  - [Deployed app on Heroku](#deployed-app)
  - [Found something wrong?](#submit-a-pull-request)

<h2 id="prerequisites">
  <a href="#prerequisites">Prerequisites</a>
</h2>

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

Make sure to install both Docker and Docker Compose prior to starting
this tutorial.

To verify run the following:

```bash
docker -v
# Docker version 19.03.8

docker-compose -v
# docker-compose version 1.25.0
```

<h2 id="technologies">
  <a href="#technologies">Main Technologies</a>
</h2>

- Ruby 2.5.8
- Rails 6.0.2
- PostgresQL 11.6

<h2 id="getting-started">
  <a href="#getting-started">Getting Started</a>
</h2>

If you don't want any explanations, skip to the [I know what I'm doing](#i-know-what-im-doing)
section of this post.

Alright first lets create our directory where we want the Rails app. I
named mine `getting-started-with-rails-6`

```bash
mkdir getting-started-with-rails-6
cd getting-started-with-rails-6
```

<h3 id="adding-a-dockerfile">
  <a href="#adding-a-dockerfile">Adding a Dockerfile</a>
</h3>

The next step is to create our `Dockerfile`.
The below `Dockerfile` is modified from the [Docker Quickstart
Rails](https://docs.docker.com/compose/rails/)

```yaml
# Dockerfile

# Pre setup stuff
FROM ruby:2.5.8 as builder

# Add Yarn to the repository
RUN curl https://deb.nodesource.com/setup_12.x | bash     && curl https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -     && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# Install system dependencies & clean them up
RUN apt-get update -qq && apt-get install -y \
    postgresql-client build-essential yarn nodejs \
    libnotify-dev && \
    rm -rf /var/lib/apt/lists/*

# This is where we build the rails app
FROM builder as rails-app

# Allow access to port 3000
EXPOSE 3000
EXPOSE 3035

# This is to fix an issue on Linux with permissions issues
ARG USER_ID=1000
ARG GROUP_ID=1000
ARG APP_DIR=/home/user/myapp

# Create a non-root user
RUN groupadd --gid $GROUP_ID user
RUN useradd --no-log-init --uid $USER_ID --gid $GROUP_ID user --create-home

# Remove existing running server
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh

# Permissions crap
RUN mkdir -p $APP_DIR
RUN chown -R $USER_ID:$GROUP_ID $APP_DIR


# Define the user running the container
USER $USER_ID:$GROUP_ID

WORKDIR $APP_DIR

# Install rails related dependencies
COPY --chown=$USER_ID:$GROUP_ID Gemfile* $APP_DIR/

# For webpacker / node_modules
COPY --chown=$USER_ID:$GROUP_ID package.json $APP_DIR
COPY --chown=$USER_ID:$GROUP_ID yarn.lock $APP_DIR

RUN bundle install

# Copy over all files
COPY --chown=$USER_ID:$GROUP_ID . .

RUN yarn install --check-files


ENTRYPOINT ["/usr/bin/entrypoint.sh"]

# Start the main process.
CMD ["rails", "server", "-b", "0.0.0.0"]
```

[Reference File on
Github](https://github.com/ParamagicDev/getting-started-with-rails-6/blob/prior-to-rails-new/Dockerfile)

<h3 id="adding-a-gemfile">
  <a href="#adding-a-gemfile">Adding a Gemfile</a>
</h3>

Next we will deviate slightly from the above Docker quickstart. Instead
of using Rails 5 we'll use Rails 6.

Create a `Gemfile` with the following contents:

```ruby
# Gemfile
source 'https://rubygems.org'
gem 'rails', '~> 6'
```

[Reference File on Github](https://github.com/ParamagicDev/getting-started-with-rails-6/blob/prior-to-rails-new/Gemfile)

Then add an empty `Gemfile.lock`

```bash
touch Gemfile.lock
```

<h3 id="adding-a-package-json">
  <a href="#adding-a-package-json">Adding a package.json</a>
</h3>

There are a few options to generate your `package.json` so lets keep it
simple, create a file with the following settings:

```json
{
  "_filename": "package.json",
  "name": "myapp",
  "private": true,
  "version": "0.1.0"
}
```

[Reference File on
Github](https://github.com/ParamagicDev/getting-started-with-rails-6/blob/prior-to-rails-new/package.json)

Also, add an empty `yarn.lock` because Rails uses yarn by default.

```bash
touch yarn.lock
```

<h3 id="adding-entrypoint-sh">
  <a href="#adding-entrypoint-sh">Adding entrypoint.sh</a>
</h3>

Now lets create an `entrypoint.sh` script to fix a server issue with
Rails.

```bash
#!/bin/bash
# entrypoint.sh

set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /myapp/tmp/pids/server.pid

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"
```

[Reference File on
Github](https://github.com/ParamagicDev/getting-started-with-rails-6/blob/prior-to-rails-new/entrypoint.sh)

<h3 id="adding-docker-compose-yml">
  <a href="#adding-docker-compose-yml">Adding docker-compose.yml</a>
</h3>

Finally, lets add a `docker-compose.yml` with the following content:

```yaml
# docker-compose.yml

version: "3"

services:
  web:
    environment:
      NODE_ENV: development
      RAILS_ENV: development
      WEBPACKER_DEV_SERVER_HOST: 0.0.0.0
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: example

    build:
      context: .
      args:
        USER_ID: 1000
        GROUP_ID: 1000
        APP_DIR: /home/user/myapp

    command: bash -c "rm -f tmp/pids/server.pid &&
      ./bin/webpack-dev-server &
      bundle exec rails server -p 3000 -b '0.0.0.0'"

    volumes:
      # make sure this lines up with APP_DIR above
      - .:/home/user/myapp

    ports:
      - "3000:3000"
      - "3035:3035"

    depends_on:
      - db

  db:
    image: postgres:12.2
    environment:
      POSTGRES_PASSWORD: example
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

[Reference File on
Github](https://github.com/ParamagicDev/getting-started-with-rails-6/blob/prior-to-rails-new/docker-compose.yml)

<h3 id="adding-a-dot-docker-ignore-file">
  <a href="#adding-a-dot-docker-ignore-file">Adding a .dockerignore file</a>
</h3>

Finally, its good practice to add a `.dockerignore` file. The
`.dockerignore` is very similar to `.gitignore` and this one will very
closely resemble your `.gitignore` that Rails will generate.

Create a `.dockerignore` file with the following contents:

```bash
# .dockerignore

# Ignore bundler config.
/.bundle

# Ignore all logfiles and tempfiles.
/log/*
/tmp/*
!/log/.keep
!/tmp/.keep

# Ignore pidfiles, but keep the directory.
/tmp/pids/*
!/tmp/pids/
!/tmp/pids/.keep

# Ignore uploaded files in development.
/storage/*
!/storage/.keep

/public/assets
.byebug_history

# Ignore master key for decrypting credentials and more.
/config/master.key

/public/packs
/public/packs-test
/node_modules
/yarn-error.log
yarn-debug.log*
```

[Reference File on
Github](https://github.com/ParamagicDev/getting-started-with-rails-6/blob/prior-to-rails-new/.dockerignore)

<h3 id="prebuild-directory-structure">
  <a href="#prebuild-directory-structure">Prebuild Directory Structure</a>
</h3>

Your directory should look as follows:

```bash
.
├── docker-compose.yml
├── .dockerignore
├── Dockerfile
├── entrypoint.sh
├── Gemfile
├── Gemfile.lock
├── package.json
└── yarn.lock
```

For reference, I have created a Github branch to represent the file
structure.

<h3 style="margin-top: 0" id="prebuild-reference-repository">
  <a href="https://github.com/ParamagicDev/getting-started-with-rails-6/tree/prior-to-rails-new">
    Prebuild Reference Repository Branch
  </a>
</h3>

<br />

<h2 id="building-the-project">
  <a href="#building-the-project">Building the Project</a>
</h2>

<h3 id="create-the-rails-app">
  <a href="create-the-rails-app">Create the Rails app</a>
</h3>

Prior to building the docker container, you have to create the Rails app
structure. To do so, run the command below inside of your Rails project
directory.

```bash
docker-compose run --rm --no-deps web rails new . --force --no-deps --database=postgresql
```

This will build a fresh Rails project for you using `PostgresQL` as the
database adapter.

<h3 id="postbuild-directory-structure">
  <a href="#postbuild-directory-structure">Postbuild Directory Structure</a>
</h3>

Your Rails directory should look as follows:

```bash
.
├── app
├── babel.config.js
├── bin
├── .browserslistrc
├── config
├── config.ru
├── docker-compose.yml
├── .dockerignore
├── Dockerfile
├── entrypoint.sh
├── Gemfile
├── Gemfile.lock
├── .git
├── .gitignore
├── lib
├── log
├── package.json
├── postcss.config.js
├── public
├── Rakefile
├── README.md
├── .ruby-version
├── storage
├── test
├── tmp
├── vendor
└── yarn.lock
```

<h3 style="margin-top: 0" id="postbuild-reference-repository">
  <a href="https://github.com/ParamagicDev/getting-started-with-rails-6/tree/before-making-blog">
    Directory Structure after Rails new
  </a>
</h3>

<h4 id="ownership-issues">
  <a href="#ownership-issues">Ownership Issues</a>
</h4>

You may run into ownership issues on Linux. I did my best to fix this.
In case anything still lingers, run the following:

```bash
sudo chown -R "$USER":"$USER" .
```

And if you're feeling real crazy, you can setup an `alias` for this
command. I have mine called `ownthis`

```bash
alias ownthis="sudo chown -R $USER:$USER ."
```

<h3 id="connecting-the-database">
  <a href="#connecting-the-database">Connecting the Database</a>
</h3>

In order to connect the Database to Rails, you have to tell Rails where
to find the database. To do so, navigate to your `config/database.yml`
file.

Delete the contents of your `config/database.yml` and add the following:

```yaml
# config/database.yml

default: &default
  adapter: postgresql
  encoding: unicode
  host: db
  username: <%= ENV['POSTGRES_USER'] %>
  password: <%= ENV['POSTGRES_PASSWORD'] %>
  pool: 5

development:
  <<: *default
  database: myapp_development

test:
  <<: *default
  database: myapp_test
```

Now you can boot the app using the following command:

```bash
docker-compose up --build
```

In another terminal, run the following commands:

```bash
docker-compose run --rm web rails db:create
docker-compose run --rm web rails db:migrate
```

Congratulations! You have finished the setup portion of the application!

Now you should be able to view your app by navigating to:

`localhost:3000` in your browser's address bar.

You should see a message congratulating you for using Rails.

![You're on Rails 6](../../assets/youre-on-rails.png)

<h3 style={{ marginTop: 0 }} id="prior-to-adding-functionality-branch">
  <a href="https://github.com/ParamagicDev/getting-started-with-rails-6/tree/prior-to-adding-stuff">
    Github Branch Prior to adding additional functionality
  </a>
</h3>

<h2 id="using-docker">
  <a href="#using-docker">Using Docker</a>
</h2>

<h3 id="stopping-the-application">
  <a href="#stopping-the-application">Stopping the application</a>
</h3>

To stop the application, in another terminal simply run:

```bash
docker-compose down
```

<h3 id="starting-the-application">
  <a href="#starting-the-application">Starting the application</a>
</h3>

To start the application there are two methods.

If you have added anything to the `Gemfile`, in order to sync the
changes, you must run the following:

```bash
docker-compose run web bundle install
docker-compose up --build
```

If you have not changed anything `Gemfile` related but you may have
changed the `docker-compose.yml` file, you can simply run:

```bash
docker-compose up --build
```

However, if you do not need to rebuild, you can simply run:

```bash
docker-compose up
```

<h2 id="extra-tips">
  <a href="#extra-tips">Extra Tips</a>
</h2>

As a simple way to get you going, anytime you see

```bash
rails [command]
```

simply prepend the following:

```bash
docker-compose run --rm web rails [command]
```

`docker-compose exec` is to be run if you have a container already
running.

`docker-compose run` is to be run if you do not have a container
running.

`docker-compose run --rm` will automatically remove the docker instance
once the command finished

<h2 id="useful-commands">
  <a href="#useful-commands">Useful Commands</a>
</h2>

```bash
# builds a container
docker-compose build

# starts a container thats been built (equivalent to `rails server`)
docker-compose up

# starts and builds a container
docker-compose up --build

# runs a one-off instance
docker-compose run --rm web [command]

# runs a command inside of a running container
# `docker-compose up` needs to be running in another terminal
docker-compose exec web [command]

# stops the application
docker-compose down

# Remove orphaned containers as well
docker-compose down --remove-orphans

# run a bash instance inside of the docker-compose container
# now you can simply run commands like `rails db:migrate` without
# adding `docker-compose run web` before every command
docker-compose run --rm web /bin/bash

# Things are totally jacked up? Remove all images and containers.
# https://stackoverflow.com/a/52179797

docker rm $(docker ps -q -a) -f && docker rmi $(docker images -q) -f
```

<h2 id="adding-additional-functionality">
  <a href="#adding-additional-functionality">Adding additional functionality</a>
</h2>

In an effort to keep this blog post semi-short in length, I will refer
you to the Rails guide for this part as nothing will be different. Once
you're finished going through the Rails guide, come back here and we
will deploy to Heroku!

[Ruby on Rails Guide to Getting
Started](https://guides.rubyonrails.org/getting_started.html#say-hello-rails)

You can skip to section 4.2 because everything prior to that we have
just done above.

<h2 id="deployment">
  <a href="#deployment">Deployment to Heroku</a>
</h2>

First, lets create a Heroku account. To do so, head on over to their
signup page.

[https://signup.heroku.com/](https://signup.heroku.com/)

After creating an account, install the Heroku CLI.

[Installation instructions can be found
here.](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)

Now that you have Heroku CLI installed you can login via terminal.

```bash
heroku login
# heroku: Enter your Heroku credentials
# Email: schneems@example.com
# Password:
# Could not find an existing public key.
# Would you like to generate one? [Yn]
# Generating new SSH public key.
# Uploading ssh public key /Users/adam/.ssh/id_rsa.pub
```

After you have logged in, you can now create a Heroku `dyno`. Basically
what this means is they will provision a server for you to host your
site. To do this, simply run the following:

```bash
heroku apps:create <Your-app-name>
# Creating ⬢ <Your-app-name>... done
# https://<Your-app-name>.herokuapp.com/ |
https://git.heroku.com/<Your-app-name>.git
```

Now deployment is as simple as:

```bash
git push heroku master
```

After waiting a little bit you should see something like the following:

```bash
remote: -----> Launching...
remote:        Released v6
remote:        https://<Your-app-name>.herokuapp.com/ deployed to Heroku
```

To visit your site, simply run:

```bash
heroku open
```

However, youre not done yet! If you got to your site and go visit the
`/articles` section, you will run into an error. This is because you
have not migrated the database on Heroku. To do so, run the following:

```bash
heroku run rails db:migrate
```

Now you're done! Good luck with everything and I hope this was helpful!

[Helpful Links below](#links)

<h2 id="issues">
  <a href="#issues">Issues</a>
</h2>

Problems with ownership?

```bash
sudo chown -R "$USER":"$USER" .
```

Things not working as expected?

```bash
docker-compose down --remove-orphans
docker-compose up --build
```

Tired of the `yarn install --check-files` issues?
Disable it!

```yaml
# config/webpacker.yml

# ...
check_yarn_integrity: false
# ...
```

Alternatively, run the following to fix this issue:

```bash
docker-compose run --rm web yarn install --check-files
```

No space left on device??

[https://success.docker.com/article/error-message-no-space-left-on-device-in-default-machine](https://success.docker.com/article/error-message-no-space-left-on-device-in-default-machine)

<br />

Postgres not updating a new name / passsword? You must first delete its
volume to tell postgres to rebuild it.

```bash
docker volume ls # lists the volumes
docker volume rm <volume-name> # removes the volume
docker volume prune [--force] # remove all unused volumes
```

<h2 id="i-know-what-im-doing">
  <a href="#i-know-what-im-doing">I know what I'm doing.</a>
</h2>

This section is meant to be the TLDR version of the above.
This will move quickly and is meant more as a reference.
To skip this section, click on the below link:

[Links sections](#links)

```bash
mkdir -p new-rails-app
cd new-rails-app
touch Dockerfile docker-compose.yml entrypoint.sh \
      Gemfile Gemfile.lock yarn.lock package.json \
      .dockerignore
```

```yaml
# Dockerfile

# Pre setup stuff
FROM ruby:2.5.8 as builder

# Add Yarn to the repository
RUN curl https://deb.nodesource.com/setup_12.x | bash     && curl https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -     && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# Install system dependencies & clean them up
RUN apt-get update -qq && apt-get install -y \
    postgresql-client build-essential yarn nodejs \
    libnotify-dev && \
    rm -rf /var/lib/apt/lists/*

# This is where we build the rails app
FROM builder as rails-app

# Allow access to port 3000
EXPOSE 3000
EXPOSE 3035

# This is to fix an issue on Linux with permissions issues
ARG USER_ID=1000
ARG GROUP_ID=1000
ARG APP_DIR=/home/user/myapp

# Create a non-root user
RUN groupadd --gid $GROUP_ID user
RUN useradd --no-log-init --uid $USER_ID --gid $GROUP_ID user --create-home

# Remove existing running server
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh

# Permissions crap
RUN mkdir -p $APP_DIR
RUN chown -R $USER_ID:$GROUP_ID $APP_DIR


# Define the user running the container
USER $USER_ID:$GROUP_ID

WORKDIR $APP_DIR

# Install rails related dependencies
COPY --chown=$USER_ID:$GROUP_ID Gemfile* $APP_DIR/

# For webpacker / node_modules
COPY --chown=$USER_ID:$GROUP_ID package.json $APP_DIR
COPY --chown=$USER_ID:$GROUP_ID yarn.lock $APP_DIR

RUN bundle install

# Copy over all files
COPY --chown=$USER_ID:$GROUP_ID . .

RUN yarn install --check-files


ENTRYPOINT ["/usr/bin/entrypoint.sh"]

# Start the main process.
CMD ["rails", "server", "-b", "0.0.0.0"]
```

```yaml
# docker-compose.yml

version: "3"

services:
  web:
    environment:
      NODE_ENV: development
      RAILS_ENV: development
      WEBPACKER_DEV_SERVER_HOST: 0.0.0.0
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: example

    build:
      context: .
      args:
        USER_ID: 1000
        GROUP_ID: 1000
        APP_DIR: /home/user/myapp

    command: bash -c "rm -f tmp/pids/server.pid &&
      ./bin/webpack-dev-server &
      bundle exec rails server -p 3000 -b '0.0.0.0'"

    volumes:
      # make sure this lines up with APP_DIR above
      - .:/home/user/myapp

    ports:
      - "3000:3000"
      - "3035:3035"

    depends_on:
      - db

  db:
    image: postgres:12.2
    environment:
      POSTGRES_PASSWORD: example
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

```bash
#!/bin/bash
# entrypoint.sh

set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /myapp/tmp/pids/server.pid

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"
```

```ruby
# Gemfile

source 'https://rubygems.org'
gem 'rails', '~> 6'
```

```json
{
  "_filename": "package.json",
  "name": "myapp",
  "private": true,
  "version": "1.0.0"
}
```

```bash
# .dockerignore

# .dockerignore

# Ignore bundler config.
/.bundle

# Ignore all logfiles and tempfiles.
/log/*
/tmp/*
!/log/.keep
!/tmp/.keep

# Ignore pidfiles, but keep the directory.
/tmp/pids/*
!/tmp/pids/
!/tmp/pids/.keep

# Ignore uploaded files in development.
/storage/*
!/storage/.keep

/public/assets
.byebug_history

# Ignore master key for decrypting credentials and more.
/config/master.key

/public/packs
/public/packs-test
/node_modules
/yarn-error.log
yarn-debug.log*
```

After setting up the above files, then run:

```bash
docker-compose run --rm --no-deps web rails new . --force --no-deps --database=postgresql
```

Now run:

```bash
docker-compose build
```

After building the image, then install webpacker:

```bash
docker-compose run --rm web rails webpacker:install
```

This will provide you with a base for webpacker.

Now setup the database in the `config/database.yml`

```yaml
# config/database.yml

default: &default
  adapter: postgresql
  encoding: unicode
  host: db
  username: <%= ENV['POSTGRES_USER'] %>
  password: <%= ENV['POSTGRES_PASSWORD'] %>
  pool: 5

development:
  <<: *default
  database: myapp_development

test:
  <<: *default
  database: myapp_test
```

Next create the database.

```bash
docker-compose run --rm web bash -c "rails db:create && rails db:migrate"
```

Finally, start the app:

```bash
docker-compose up
```

Now you can view it on `localhost:3000`

Now, to deploy the app, simply do the following:

```bash
heroku login
heroku apps:create <App-name>
git push heroku master
heroku run rails db:migrate
```

And thats it ! Were all set and deployed.

<h2 id="links">
  <a href="#links">Links</a>
</h2>

<p>
  <a
    style="font-size: 1.1rem;"
    href="https://github.com/ParamagicDev/getting-started-with-rails-6/tree/master"
    id="source-code"
  >
    Source Code on Github
  </a>
</p>

<p>
  <a style="font-size: 1.1rem;" href="#todo" id="deployed-app">
    Deployed Application
  </a>
</p>

<h3 id="rails">
  <a href="#rails">Rails</a>
</h3>

[Ruby on Rails Homepage](https://rubyonrails.org/)

[Ruby on Rails Getting Started Guide](https://guides.rubyonrails.org/getting_started.html)

[Webpacker Gem](https://github.com/rails/webpacker)

<h3 id="docker">
  <a href="#docker">Docker</a>
</h3>

[Docker Compose with Rails](https://docs.docker.com/compose/rails/)

<h3 id="databases">
  <a href="#databases">PostgresQL</a>
</h3>

[PostgresQL Homepage](https://www.postgresql.org/)

<h3 id="heroku">
  <a href="#heroku">Heroku</a>
</h3>

[Heroku Homepage](https://heroku.com)

[Heroku with Rails
Deployment](https://devcenter.heroku.com/articles/getting-started-with-rails6)

<h3 id="submit-a-pull-request">
  <a href="#submit-a-pull-request">
    Found something wrong? Submit a pull request!
  </a>
</h3>

[Blog Source](https://github.com/ParamagicDev/my-blog/blob/master/content/blog/rails/getting-started-with-rails-6.md)

[Rails App Source](https://github.com/ParamagicDev/getting-started-with-rails-6)
