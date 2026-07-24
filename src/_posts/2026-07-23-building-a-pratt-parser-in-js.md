---
title: Building A Pratt Parser In JavaScript
categories: []
date: 2026-07-23
description: |
  Building A Pratt Parser In JavaScript
published: false
---

I've been hankering to build an LSP for 11ty (now Build Awesome).

I started one, I don't love it. And I'm realizing, "I should probably patch my pain points with the parser first before building this LSP."

There are some "core" tenants to building an LSP grade parser I'm finding.

1. Your lexer should never error. Nunjucks...does. In a few spots actually.

<https://github.com/11ty/nunjucks/blob/1e51728eb4cd6f225a39dd36e69466de8847f53e/nunjucks/src/lexer.js#L245>

<https://github.com/11ty/nunjucks/blob/1e51728eb4cd6f225a39dd36e69466de8847f53e/nunjucks/src/lexer.js#L309>

<https://github.com/11ty/nunjucks/blob/1e51728eb4cd6f225a39dd36e69466de8847f53e/nunjucks/src/lexer.js#L322>

2. Your lexer should produce error _tokens_ not throw actual errors.
3. Store offsets on tokens. LSPs work on offsets. `lineno` / `colno`, but offsets are equally useful.
4. Store the `start` and `end` of tokens. This is important for highlighting errors, and when to start parsing new tokens.
5. Be "resilient" to errors. When you encounter an error, produce an ErrorNode, and attach "expected" tokens to it.

I know the basics of parsing, I'm definitely no expert, and reading the papers on parsing made my head spin.

<https://matklad.github.io/2023/05/21/resilient-ll-parsing-tutorial.html>

Is probably the most approachable I've found. But, I still don't fully understand it. So, you get to go on this journey with me of building a bare minimum parser similar to the one in the blog post above.

The point is to make a minimum proof of concept I can then carry over to Nunjucks and create an error-tolerant parser to be used by the LSP (and 11ty itself) to provide better errors and warnings for users.

So let's begin. There's 3 major parts to making a parser.

1. Make a "grammar". This is you language's "definition".
2. Make a lexer + tokenizer. This is what will be your "conversion of text to structure".
3. Make the parser that consumes the tokens created by the lexer + tokenizer.

To the best I can tell Nunjucks doesn't have a formal grammar. Instead it largely "tokenizes on the fly" <https://github.com/11ty/nunjucks/blob/main/nunjucks/src/lexer.js#L9-L41> .

We could have some fun here and write a grammar parser to be faithful to the article.
