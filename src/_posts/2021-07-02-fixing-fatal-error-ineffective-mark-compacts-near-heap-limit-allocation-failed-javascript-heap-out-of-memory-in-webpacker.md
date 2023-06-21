---
title: "FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory in Webpacker"
categories: webpacker, webpack, rails, javascript
date: 2021-07-02 19:08:53 UTC
description: |
  The purpose of this is to remind myself what to do next time I encounter this...
---

## Purpose

The purpose of this is to remind myself what to do next time I encounter this error with Webpacker.

## The error

Heres the full error I was receiving when running `./bin/webpack-dev-server`, no I have no idea how it got into this state. It also persisted in this state through multiple machine resets and I wrangled with this for over an hour.

```console
➜  veue git:(VEUE-950) ./bin/webpack-dev-server
ℹ ｢wds｣: Project is running at http://localhost:3035/
ℹ ｢wds｣: webpack output is served from /packs/
ℹ ｢wds｣: Content not from webpack is served from /Users/konnorrogers/projects/veue-live/veue/public/packs
ℹ ｢wds｣: 404s will fallback to /index.html<--- Last few GCs --->[28586:0x118008000]    30682 ms: Scavenge 2033.1 (2042.8) -> 2030.5 (2043.8) MB, 3.8 / 0.0 ms  (average mu = 0.348, current mu = 0.382) allocation failure
[28586:0x118008000]    30696 ms: Scavenge 2034.2 (2043.8) -> 2031.7 (2045.0) MB, 4.0 / 0.0 ms  (average mu = 0.348, current mu = 0.382) allocation failure
[28586:0x118008000]    30707 ms: Scavenge 2035.3 (2053.0) -> 2032.8 (2054.5) MB, 3.6 / 0.0 ms  (average mu = 0.348, current mu = 0.382) allocation failure<--- JS stacktrace --->FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
 1: 0x10130c5e5 node::Abort() (.cold.1) [/Users/konnorrogers/.asdf/installs/nodejs/14.17.2/bin/node]
 2: 0x1000b2289 node::Abort() [/Users/konnorrogers/.asdf/installs/nodejs/14.17.2/bin/node]
 3: 0x1000b23ef node::OnFatalError(char const*, char const*) [/Users/konnorrogers/.asdf/installs/nodejs/14.17.2/bin/node]
 4: 0x1001f68c7 v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, bool) [/Users/konnorrogers/.asdf/installs/nodejs/14.17.2/bin/node]
 5: 0x1001f6863 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, bool) [/Users/konnorrogers/.asdf/installs/nodejs/14.17.2/bin/node]
 6: 0x1003a47e5 v8::internal::Heap::FatalProcessOutOfMemory(char const*) [/Users/konnorrogers/.asdf/installs/nodejs/14.17.2/bin/node]
 7: 0x1003a628a v8::internal::Heap::RecomputeLimits(v8::internal::GarbageCollector) [/Users/konnorrogers/.asdf/installs/nodejs/14.17.2/bin/node]
 8: 0x1003a19b5 v8::internal::Heap::PerformGarbageCollection(v8::internal::GarbageCollector, v8::GCCallbackFlags) [/Users/konnorrogers/.asdf/installs/nodejs/14.17.2/bin/node]
 9: 0x10039f2e0 v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags) [/Users/konnorrogers/.asdf/installs/nodejs/14.17.2/bin/node]
10: 0x10039e248 v8::internal::Heap::HandleGCRequest() [/Users/konnorrogers/.asdf/installs/nodejs/14.17.2/bin/node]
11: 0x10035a6e1 v8::internal::StackGuard::HandleInterrupts() [/Users/konnorrogers/.asdf/installs/nodejs/14.17.2/bin/node]
12: 0x1006fb197 v8::internal::Runtime_StackGuardWithGap(int, unsigned long*, v8::internal::Isolate*) [/Users/konnorrogers/.asdf/installs/nodejs/14.17.2/bin/node]
13: 0x100a81a79 Builtins_CEntry_Return1_DontSaveFPRegs_ArgvOnStack_NoBuiltinExit [/Users/konnorrogers/.asdf/installs/nodejs/14.17.2/bin/node]
14: 0xb84c93c8ef3
[1]    28586 abort      ./bin/webpack-dev-server
```

## Possible fixes

https://stackoverflow.com/questions/38855004/webpack-sass-maximum-call-stack-size-exceeded

This stack overflow posts recommends a couple fixes including settings the max stack size. No dice. Still didnt work. I tried a number of other node specific fixes. Nothing.

## Is it a caching issue? Yes. Its probably a caching issue.

So what was the fix then? Remove the cache. Webpacker internally stores a cache in `tmp/cache/webpacker` for faster reading / writing operations so it doesnt have to fully bundle all your assets and uses the cache to speed things up.

Because I was quite annoyed by this point, I just nuked the whole thing.

```bash
rm -rf tmp/cache
```

Bam. Call it a day. I fired up `./bin/webpack-dev-server` and all was hunky dory in the land of Rails.
