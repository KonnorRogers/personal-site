---
title: Pulling down somebody's fork with Git.
categories: [git, bash, aliases, functions]
date: 2021-07-03 17:54:40 UTC
description: |
  Purpose   To provide an easy to use way to pull down somebodys fork on your project.       ...
---

## Purpose

To provide an easy to use way to pull down somebodys fork on your project.

## The long way

To pull down somebody's fork on your github project is kind of annoying. Its one of those things you dont do often, and when you do, you usually consult StackOverflow which is what I did here.

https://stackoverflow.com/questions/9153598/how-do-i-fetch-a-branch-on-someone-elses-fork-on-github

Accepted answer:

```bash
git remote add theirusername git@github.com:theirusername/reponame.git
git fetch theirusername
git checkout -b mynamefortheirbranch theirusername/theirbranch
```

Wow....thats annoying. The fact I have to specify their name 3 times is a hassle. So what I like to do for obscure annoying commands is turn them into a Bash function.


## Writing the function

I called it `git-fork-pull` im sure there are 1000 other things I  could've called it, but naming is hard.

The next step is to write how I want the function to work. I imagine I want to do something like the following:

```bash
git-fork-pull reponame theirname theirbranch mybranch
```

Seems pretty straightforward to me. 4 positional arguments. I usually like keyword arguments, but theyre a little more tedious in Bash since they require an option parser like this https://unix.stackexchange.com/questions/129391/passing-named-arguments-to-shell-scripts .

Besides, this is only going to be used by me so im fine with it.

To make use of these 4 positional arguments, our function would look like this:

```bash
git-fork-pull() {
  reponame="$1"
  theirname="$2"
  theirbranch="$3"
  mybranch="$4"
}
```

## Creating functionality

With the arguments in place, its not important to look at functionality. The functionality is fairly straightforward. We add the remote, fetch it, and then create a new branch based on their branch. To do this in our function, we'd continue on like this:


```bash
git-fork-pull() {
  reponame="$1"
  theirname="$2"
  theirbranch="$3"
  mybranch="$4"

  git remote add "$theirname" "git@github.com:$theirname/$reponame.git"
git fetch "$theirname"
git checkout -b "$mybranch" "$theirname/$theirbranch"
}
```

Now obviously this implementation is github specific, so you may have to look into supporting other sites like Gitlab or Bitbucket, but I'll leave this as an exercise for the reader.

## Additional notes

If youre curious on how to autoload bash functions, heres what I do in my `.zshrc` to load all bash functions.

I have a `.zsh/functions` directory full of files like `git-fork-pull` . So heres what a minimal source script looks like in your `.bashrc` or `.zshrc` to source all your custom functions.

```bash
# .zshrc

CUSTOM_FUNCTIONS="$HOME/.zsh/functions"

for function in "$CUSTOM_FUNCTIONS"/*; do
  source $function
done
```

this will interate over all files in your `~/.zsh/functions` directory and source them for use by zsh. This could look identical in a `.bashrc` as well and using `~/.bash/functions`.
