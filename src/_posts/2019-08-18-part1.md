---
title: Learning PHP - Part 1 - Lets Compile PHP!
date: "2019-08-18"
description: Compiling PHP with PHPENV is not easy, come enjoy
  my frustrations in this task.
---

# Purpose

To document my trials & tribulations with learning PHP through laracasts.
This is the article will cover the 1st step from Laracasts.

## Part 1

[Laracasts main site](https://laracasts.com)<br />
[Laracasts - PHP for beginners](https://laracasts.com/series/php-for-beginners)<br />

## Chapters

[Chapter 1 - Installing PHP](https://laracasts.com/series/php-for-beginners/episodes/1)

## Installing PHP

Originally, I installed PHP the usual way.

```shell
sudo apt install -y php
php -v
# PHP php-7.2.x ...
```

Okay sweet its installed...hmmm I wonder if anyone else uses an environment manager
like I do Ruby.

So with very little effort I found [phpenv](https://github.com/phpenv/phpenv)! Aha! Awesome good stuff. <br />
The documentation linked to an easier to use [phpenv-installer](https://github.com/phpenv/phpenv-installer).
Ok cool. I have a ton of packages from when I compiled Ruby. Piece of cake.
I have my handy dandy vps-cli gem packages I'm good to go! Okay, here we go:

```bash
curl -L https://raw.githubusercontent.com/phpenv/phpenv-installer/master/bin/phpenv-installer \
    | bash
# phpenv does its thing. Tells me to add it to my .zshrc.
# Being the compliant monkey I am, I do it.

phpenv install "7.3.8"
# configure: error reinstall BZip2
```

<br />

Yea sure, no problem whatever, I'll google, find the package easy peezy.<br />

I was dead wrong. I struggled with multiple compilation errors for about ~1hour.
About 10 compilation errors later and adding multiple packages to my VpsCli gem,
(Which I really need to fix. I plan to, but different problem for a different day),
I was finally able to compile using phpenv.

After a lot of blood sweat and tears, I finally managed to compile php.<br />
Here are all the .deb packages I used on Ubuntu 18.10

```ruby
module VpsCli
  class Packages
    # ...above code omitted for brevity
    LIBS = %w[libssl-dev libcurl4-openssl-dev libxml2-dev
              re2c libbz2-dev libjpeg-turbo8-dev libpng-dev
              libzip-dev libtidy-dev libxslt-dev automake libtool autoconf
              flex bison libkrb5-dev libonig-dev].freeze
    # ...below code omitted for brevity
  end
end
```

<br />
<strong>
  {" "}
  In ruby land heres how I would handle it with a quick pry session:{" "}
</strong>
<br />
```bash gem install vps_cli gem install pry

pry

> require 'vps_cli'
> require 'rake'
> pkgs = VpsCli::Packages::LIBS.join(' ')
> Rake.sh("sudo apt install -y #{pkgs}")
> exit

phpenv install "7.3.8" # SUCCESS!
phpenv global "7.3.8"
php -v

# PHP 7.3.8 ...

<br />

[Link to VpsCli repository - lib/vps_cli/packages.rb](https://github.com/ParamagicDev/vps_cli/blob/master/lib/vps_cli/packages.rb)<br /><br />
Yes, I know the codebase needs some TLC to get it to where I want it to be.
I wrote it ~6-8months ago. Maybe I'll rewrite it in PHP?! Who knows! But continue
on this Laracasts PHP journey with me!

## What I learned

Maybe next time I should stick to a simple `sudo apt install -y php`...<br />
BUT! On the off chance I need a different PHP version I'm all set!
Now, let's start building!

## Links

<strong><a href="https://github.com/ParamagicDev/php-for-beginners">Follow along with my repo</a></strong>

[Laracasts main site](https://laracasts.com)<br />
[PHP for beginners](https://laracasts.com/series/php-for-beginners)<br
/>
[PHPENV github](https://github.com/phpenv/phpenv) <br />
[PHPENV-INSTALLER - github](https://github.com/phpenv/phpenv-installer)
