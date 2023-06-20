---
title: Exploring Trix
categories: javascript, rails, webdev, trix
date: 2022-01-29 06:33:14 UTC
description: |
  Why?   Well, the reason is simple. Trix is notoriously hard to extend. It has little...
---

## Why?

Well, the reason is simple. Trix is notoriously hard to extend. It has little documentation and is written in Coffee-Script which is not very well known these days. ([There is a rewrite in progress to change to JavaScript](https://github.com/basecamp/trix/tree/v2/src/trix))

[Trix](https://github.com/basecamp/trix) is the underlying JavaScript library for the overarching [ActionText module](https://guides.rubyonrails.org/action_text_overview.html) in Ruby on Rails.

I'm going to be exploring how to extend and manipulate Trix.

In this series I will be attempting to recreate an ~~the Github markdown editor~~ editor to be determined, but perhaps in the future this can be a grab-bag of various tips + tricks. The final product may not have all the gadgets and gizmos, but I will attempt to make it close.

## What is Trix?

Trix is ["A Rich Text Editor for Everyday Writing"](https://github.com/basecamp/trix#a-rich-text-editor-for-everyday-writing)

Trix is also considered a WYSIWYG editor (what you see is what you get)

Without getting too far into the nitty-gritty, Trix is a web component designed for the modern era of JavaScript and was released during a not-so-modern era.

## Where to start?

I'll be using a barebones JavaScript repo using [Vite](https://vitejs.dev/) for local development.

The repo can be found here:

https://github.com/ParamagicDev/exploring-trix

In the official start to the series, we will explore how to change the default toolbar's HTML.