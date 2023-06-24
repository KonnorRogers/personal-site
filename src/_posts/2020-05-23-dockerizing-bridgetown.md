---
title: Dockerizing Bridgetown
date: '2020-05-23T15:55:36'
description: Getting started building with Bridgetown by dockerizing it. I'll walk through a Docker setup for Bridgetown using Alpine Linux.
---

<h2 align="center"> What is Bridgetownrb? </h2>

<p
  align="center"
  style="background: #F0FFF0; border-radius: 16px; padding: 1rem;"
>
  <a href="https://bridgetownrb.com">Bridgetownrb</a>
  &nbsp;is a "Webpack-aware,
  <br />
  Ruby-powered static site generator
  <br />
  for the modern Jamstack era."
</p>

<br />

So what does this mean? To me it means it is a
static site generator that uses Webpack under the hood and can source
data from other places like a CMS or markdown files just like other static site generators such as
[Gatsby](https://gatsbyjs.org) or [Gridsome](https://gridsome.org/)

<h2 id="table-of-contents">
  <a href="#table-of-contents">Table Of Contents</a>
</h2>

- [Prerequisites](#prerequisites)
- [Create a new directory](#create-directory)
- [Docker Files](#docker-files)
  - [Adding a Dockerfile](#adding-dockerfile)
  - [Adding a docker-compose.yml](#adding-docker-compose)
  - [Adding a docker.env](#adding-docker-env)
  - [Adding a .dockerignore](#adding-docker-ignore)
- [Dependency Files](#dep-files)
  - [Adding a Gemfile](#adding-gemfile)
  - [Adding a package.json](#adding-package-json)
  - [Adding lockfiles](#adding-lockfiles)
- [Generating a project](#generating-a-project)
  - [File structure prior to generation](#prior-to-new)
  - [Running the Generation Command](#generation-command)
  - [File structure post generation](#post-new)
- [Useful Commands](#commands)
  - [Starting the server](#starting-the-server)
  - [Stopping the server](#stopping-the-server)
  - [Other commands](#other-commands)
- [I know what I'm doing](#i-know)
- [Links](#links)
- [Going forward](#going-forward)

## Note:

If you would like to skip straight to building without explanations feel
free to go to the [I know what I'm doing](#i-know) section.

<h2 id="prerequisites">
  <a href="#prerequisites">Prerequisites</a>
</h2>

There are only 2 prerequisites for this project.

Docker & Docker Compose. To check you have them, run the following:

```bash
docker -v
# Docker version 19.03.6, build 369ce74a3c

docker-compose -v
# docker-compose version 1.25.0, build unknown
```

<h2 id="create-directory">
  <a href="#create-directory">Create a new directory</a>
</h2>

Now that we've confirmed Docker and Docker Compose are installed, lets
setup the initial structure for Docker to pull down Bridgetownrb so we
do not have to install it locally.

```bash
mkdir -p bridgetown-project
cd bridgetown-project
```

<h2 id="docker-files">
  <a href="#docker-files">Docker Files</a>
</h2>

<h3 id="adding-dockerfile">
  <a href="#adding-dockerfile">Adding a Dockerfile</a>
</h3>

I'm not goin to go too in depth into this Dockerfile, but the point of
it is to be able to run a Docker container as a non-root user and still
do everything you need to do. We'll be using Alpine Linux to keep the
image small.

Create a `Dockerfile` and add the following contents into it.

```dockerfile title=Dockerfile
FROM ruby:2.6-alpine3.11 as builder

RUN apk add --no-cache --virtual \\
    #
    # required
    nodejs-dev yarn bash \\
    tzdata build-base libffi-dev \\
    #
    # nice to haves
    curl git \\
    #
    # Fixes watch file isses with things like HMR
    libnotify-dev

FROM builder as bridgetownrb-app

# This is to fix an issue on Linux with permissions issues
ARG USER_ID=${USER_ID:-1000}
ARG GROUP_ID=${GROUP_ID:-1000}
ARG DOCKER_USER=${DOCKER_USER:-user}
ARG APP_DIR=${APP_DIR:-/home/user/bridgetown-app}

# Create a non-root user
RUN addgroup -g $GROUP_ID -S $GROUP_ID
RUN adduser --disabled-password -G $GROUP_ID --uid $USER_ID -S $DOCKER_USER

# Create and then own the directory to fix permissions issues
RUN mkdir -p $APP_DIR
RUN chown -R $USER_ID:$GROUP_ID $APP_DIR

# Define the user running the container
USER $USER_ID:$GROUP_ID

# . now == $APP_DIR
WORKDIR $APP_DIR

# COPY is run as a root user, not as the USER defined above, so we must chown it
COPY --chown=$USER_ID:$GROUP_ID Gemfile* $APP_DIR/
RUN gem install bundler
RUN bundle install

# For webpacker / node_modules
COPY --chown=$USER_ID:$GROUP_ID package.json $APP_DIR
COPY --chown=$USER_ID:$GROUP_ID yarn.lock $APP_DIR

RUN yarn install

CMD ["yarn", "start"]
```

[Reference File on
Github](https://github.com/ParamagicDev/getting-started-with-bridgetown/blob/prior-bridgetown-new/Dockerfile)

<h3 id="adding-docker-compose">
  <a href="#adding-docker-compose">Adding a docker-compose.yml</a>
</h3>

Now that we have a Dockerfile as our base, lets make it easy to call the
Dockerfile without having to specify a bunch of build arguments.

Create a `docker-compose.yml` and add the following content:

```yaml
# docker-compose.yml

version: '3'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        USER_ID: ${USER_ID:-1000}
        GROUP_ID: ${GROUP_ID:-1000}
        DOCKER_USER: ${DOCKER_USER:-user}
        APP_DIR: ${APP_DIR:-/home/user/bridgetown-app}

    command: bash -c "yarn start --host '0.0.0.0'"

    ports:
      - '4000:4000'
      # Not totally necessary to open 4001, but it is used, so lets make it discoverable
      - '4001:4001'
      - '4002:4002'

    volumes:
      - .:${APP_DIR:-/home/user/bridgetown-app}
      # this seperates node_modules from the host
      - node_modules:${APP_DIR:-/home/user/bridgetown-app}/node_modules

volumes:
  node_modules:
```

[Reference File on
Github](https://github.com/ParamagicDev/getting-started-with-bridgetown/blob/master/docker-compose.yml)

<h3 id="adding-docker-env">
  <a href="#adding-docker-env">Adding docker.env</a>
</h3>

You'll notice above that theres a bunch of ENV variables being used to
substitute values. Now there's a few ways to provide the ENV variables
to Docker. I've found the easiest way to pass ENV variables is by
sourcing a file with ENV variables.

To show you what this looks like lets create a 'docker.env' file.

```bash title=docker.env

# Assign and export seperately to avoid masking return values.
USER_ID=$(id -u "$USER")
GROUP_ID=$(id -g "$USER")
export USER_ID
export GROUP_ID

export DOCKER_USER="user"
export APP_DIR="/home/$DOCKER_USER/bridgetown"
```

Now in order to pull these values into your shell environment run the
following command:

```bash
source ./docker.env
```

This will now pull in your ENV variables for docker to use.

#### Note:

This is really only necessary for Linux users. Mac and Windows users
_should_ be fine to run without this script. It has not been tested
however.

<h3 id="adding-docker-ignore">
  <a href="#adding-docker-ignore">Adding .dockerignore</a>
</h3>

The final piece to this Docker puzzle is to create a `.dockerignore`. I stole the `.gitignore` provided by Bridgetownrb for this. It looks as follows:

```bash title=.dockerignore

# Bridgetown
output
.bridgetown-cache
.bridgetown-metadata
.bridgetown-webpack

# Dependency folders
node_modules
bower_components
vendor

# Caches
.sass-cache
.npm
.node_repl_history

# Ignore bundler config.
/.bundle

# Ignore Byebug command history file.
.byebug_history

# dotenv environment variables file
.env

# Mac files
.DS_Store

# Yarn
yarn-error.log
yarn-debug.log*
.pnp/
.pnp.js
# Yarn Integrity file
.yarn-integrity

.git
```

[Reference File on
Github](https://github.com/ParamagicDev/getting-started-with-bridgetown/blob/prior-bridgetown-new/.dockerignore)

<h2 id="dep-files">
  <a href="#dep-files">Dependency Files</a>
</h2>

<h3 id="adding-gemfile">
  <a href="#adding-gemfile">Adding a Gemfile</a>
</h3>

Alright, with the Docker setup above, we can now specify our
dependency files.

The first step is to create a `Gemfile`. Create a Gemfile as follows:

```ruby title=Gemfile


source "https://rubygems.org"
gem "bridgetown", "~> 0.15.0"
```

This will tell `bundler` to install `bridgetown` from Rubygems.org

<h3 id="adding-package-json">
  <a href="#adding-package-json">Adding a package.json</a>
</h3>

Create a `package.json` structured similarly to the one below:

```json title=package.json
{
  "name": "bridgetown-site",
  "version": "1.0.0",
  "private": true
}
```

<h3 id="adding-lockfiles">
  <a href="#adding-lockfiles">Adding lockfiles</a>
</h3>

Almost done with the setup I promise!

Finally, lets create 2 empty lockfiles.

The 2 lockfiles are `yarn.lock` and `Gemfile.lock`

```bash
touch yarn.lock Gemfile.lock
```

<h2 id="generating-a-project">
  <a href="#generating-a-project">Generating a project</a>
</h2>

<h3 id="prior-to-new">
  <a href="#prior-to-new">File structure prior to generation</a>
</h3>

Your file structure should look as follows if you followed the above
steps.

```bash
tree -L 1 -a .

.
├── docker-compose.yml
├── docker.env
├── Dockerfile
├── .dockerignore
├── Gemfile
├── Gemfile.lock
├── package.json
└── yarn.lock
```

[Reference Branch on
Github](https://github.com/ParamagicDev/getting-started-with-bridgetown/tree/prior-bridgetown-new)

<h3 id="generation-command">
  <a href="#generation-command">Running the Generation Command</a>
</h3>

```bash
source ./docker.env && docker-compose run --rm bridgetown new . --force
```

This will generate a new project for `bridgetown`

<h3 id="post-new">
  <a href="#post-new">File Structure After Generation</a>
</h3>

```bash
tree -L 1 -a .

.
├── bridgetown.config.yml
├── docker-compose.yml
├── docker.env
├── Dockerfile
├── .dockerignore
├── frontend
├── Gemfile
├── Gemfile.lock
├── .git
├── .gitignore
├── package.json
├── plugins
├── README.md
├── src
├── start.js
├── sync.js
├── webpack.config.js
└── yarn.lock
```

[Reference Branch on
Github](https://github.com/ParamagicDev/getting-started-with-bridgetown/tree/post-bridgetown-new)

Now, to start your server you can simply run:

```bash
source ./docker.env && docker-compose up --build
```

This will allow you to view Bridgetown welcome screen on `localhost:4000`

<h2 id="commands">
  <a href="#commands">Useful Commands</a>
</h2>

<h3 id="starting-the-server">
  <a href="#starting-the-server">Starting the server</a>
</h3>

If it's your first time since generating the project, run

```bash
source ./docker.env && docker-compose up --build
```

If you have already built the container, you can simply do:

```bash
source ./docker.env && docker-compose up
```

<h3 id="stopping-the-server">
  <a href="#stopping-the-server">Stopping the server</a>
</h3>

In another terminal to stop the server you can simply run:

```bash
docker-compose down --remove-orphans
```

<h3 id="other-commands">
  <a href="#other-commands">Other commands</a>
</h3>

Sourcing ENV variables

<br />
This is only technically required once in a running terminal.
<br />
`source ./docker.env`

Run a command in an already running container:

<br />
`docker-compose exec web [command]`

Run a one-off command:

<br />
`docker-compose run --rm web [command]`

Upgrading `package.json`:

```bash
docker-compose run --rm web yarn upgrade
docker-compose down --remove-orphans
docker-compose up --build
```

Adding an `npm` package:

```bash
docker-compose run --rm web yarn add [package]
docker-compose down --remove-orphans
docker-compose up --build
```

Adding a gem

```bash
docker-compose run --rm web bundle add [gem]
docker-compose down --remove-orphans
docker-compose up --build
```

The below is a TLDR / reference version of the above.
To skip to the links sections click the link below.

<br />

[Links section](#links)

<h2 id="i-know">
  <a href="#i-know">I know what I'm doing</a>
</h2>

```bash
mkdir -p bridgetown-project && cd bridgetown-project
touch Gemfile Gemfile.lock package.json yarn.lock \\
      .dockerignore docker-compose.yml Dockerfile docker.env
```

```dockerfile title=Dockerfile

FROM ruby:2.6-alpine3.11 as builder

RUN apk add --no-cache --virtual \\
    #
    # required
    nodejs-dev yarn bash \\
    tzdata build-base libffi-dev \\
    #
    # nice to haves
    curl git \\
    #
    # Fixes watch file isses with things like HMR
    libnotify-dev

FROM builder as bridgetownrb-app

# This is to fix an issue on Linux with permissions issues
ARG USER_ID=${USER_ID:-1000}
ARG GROUP_ID=${GROUP_ID:-1000}
ARG DOCKER_USER=${DOCKER_USER:-user}
ARG APP_DIR=${APP_DIR:-/home/user/bridgetown-app}

# Create a non-root user
RUN addgroup -g $GROUP_ID -S $GROUP_ID
RUN adduser --disabled-password -G $GROUP_ID --uid $USER_ID -S $DOCKER_USER

# Create and then own the directory to fix permissions issues
RUN mkdir -p $APP_DIR
RUN chown -R $USER_ID:$GROUP_ID $APP_DIR

# Define the user running the container
USER $USER_ID:$GROUP_ID

# . now == $APP_DIR
WORKDIR $APP_DIR

# COPY is run as a root user, not as the USER defined above, so we must chown it
COPY --chown=$USER_ID:$GROUP_ID Gemfile* $APP_DIR/
RUN gem install bundler
RUN bundle install

# For webpacker / node_modules
COPY --chown=$USER_ID:$GROUP_ID package.json $APP_DIR
COPY --chown=$USER_ID:$GROUP_ID yarn.lock $APP_DIR

RUN yarn install

CMD ["yarn", "start"]
```

```yaml title=docker-compose.yml
version: '3'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        USER_ID: ${USER_ID:-1000}
        GROUP_ID: ${GROUP_ID:-1000}
        DOCKER_USER: ${DOCKER_USER:-user}
        APP_DIR: ${APP_DIR:-/home/user/bridgetown-app}

    command: bash -c "yarn start --host '0.0.0.0'"

    ports:
      - '4000:4000'
      # Not totally necessary to open 4001, but it is used, so lets make it discoverable
      - '4001:4001'
      - '4002:4002'

    volumes:
      - .:${APP_DIR:-/home/user/bridgetown-app}
      # this seperates node_modules from the host
      - node_modules:${APP_DIR:-/home/user/bridgetown-app}/node_modules

volumes:
  node_modules:
```

```bash title=docker.env


# Assign and export seperately to avoid masking return values.
USER_ID=$(id -u "$USER")
GROUP_ID=$(id -g "$USER")
export USER_ID
export GROUP_ID

export DOCKER_USER="user"
export APP_DIR="/home/$DOCKER_USER/bridgetown"
```

```bash title=.dockerignore


# Bridgetown
output
.bridgetown-cache
.bridgetown-metadata
.bridgetown-webpack

# Dependency folders
node_modules
bower_components
vendor

# Caches
.sass-cache
.npm
.node_repl_history

# Ignore bundler config.
/.bundle

# Ignore Byebug command history file.
.byebug_history

# dotenv environment variables file
.env

# Mac files
.DS_Store

# Yarn
yarn-error.log
yarn-debug.log*
.pnp/
.pnp.js
# Yarn Integrity file
.yarn-integrity

.git
```

```ruby title=Gemfile
# Gemfile

source "https://rubygems.org"
gem "bridgetown", "~> 0.15.0"
```

```json title=package.json
{
  "name": "bridgetown-site",
  "version": "1.0.0",
  "private": true
}
```

```bash
source ./docker.env
docker-compose run --rm web bridgetown new . --force
docker-compose up --build
```

Navigate to `localhost:4000` and bam! up and running!

<h2 id="links">
  <a href="#links">Links</a>
</h2>

### Bridgetown

[Bridgetownrb](https://www.bridgetownrb.com/)

[Bridgetown Getting Started](https://www.bridgetownrb.com/docs/)

### Github

[Github Reference
Repo](https://github.com/ParamagicDev/getting-started-with-bridgetown)

<h2 id="going-forward">
  <a href="#going-forward">Going Forward</a>
</h2>

This blog post was merely a setup blog post. My next blog post will
detail creating a portfolio with TailwindCSS & Bridgetownrb.

This is a reference post to point people back to.
So stay tuned for the next part of building with bridgetown.

And if you dont feel like waiting, go check out their documentation.

<br />
[Bridgetown Documentation](https://www.bridgetownrb.com/docs/)

Good luck building with [Bridgetown](https://bridgetownrb.com) and I hope this was useful!
