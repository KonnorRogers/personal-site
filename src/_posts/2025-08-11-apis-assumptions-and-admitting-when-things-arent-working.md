---
title: APIs, Assumptions, and Admitting When Things Aren't Working
categories: []
date: 2025-08-11
description: |
  A brief post about challenges faced in the Web Awesome form controls API.
published: true
---

This post will be brief. I largely steered the ship for the Web Awesome form controls API design. The API design was meant to mimic the native platform.

The native platform for dirty checking form controls is really cumbersome and error prone.

The belief was that if we followed the platform, we would be able to integrate better with existing backends and frontend form libraries. The assumption was wrong. But it sounded good in theory.

After numerous reports of bugs, value attributes vs value properties and how things felt "wrong", I decided to pull the plug on the current API design. Sometimes the platform gets it wrong, or the platform is really hard to recreate. Either way, sometimes you need to admit you were wrong and made a misguided judgement and its time to pivot.

To read more, checkout the RFC I created for Web Awesome here:

<https://github.com/shoelace-style/webawesome/discussions/1297>

Which is a much more in depth account of how it all transpired, and what the path forward looks like. Sometimes its better to admit you were wrong, than continue down a path that clearly is creating issues both for users, and for maintainers, with no obvious upside other than "API purity", that is, mimicking an existing API.

This post is purely cathartic, and publicly admitting I made some misguided choices and owning up to that. Sometimes it happens. Its unfortunate we had to go down the wrong path, but given Web Awesome is still in beta, I hope we can carve out enough time to smooth out the rough edges around form controls before we officially launch.
