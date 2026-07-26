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

I know the basics of parsing, I'm definitely no expert, and reading the papers on parsing made my head spin. Its obvious I don't know how to read while trying to parse through mathematic proofs of how Pratt Parsing works.

So far, the most approachable blog post I've found is by matklad. But, I still don't fully understand it despite reading it 3 or 4 times. So, you get to go on this journey with me of building a minimal parser similar to the one in the blog post below.

<https://matklad.github.io/2023/05/21/resilient-ll-parsing-tutorial.html>

The point is to make a minimum proof of concept I can then carry over to Nunjucks and create an error-tolerant parser to be used by the LSP (and 11ty itself) to provide better errors and warnings for users.

So let's begin. As far as I can tell there is 3 major parts to making a parser.

1. Make a "grammar". This is you language's "definition".
2. Make a lexer + tokenizer. This is what will be your "conversion of text to structure". (is this 1 part or 2 parts? I can't read, clearly can't do math either...but many times this step is combined)
3. Make the parser that consumes the tokens created by the lexer + tokenizer and create your "language".

To the best I can tell Nunjucks doesn't have a formal grammar. Instead it largely tokenizes fairly simple strings <https://github.com/11ty/nunjucks/blob/main/nunjucks/src/lexer.js#L9-L41> .

Lets have some fun here and be faithful to the source, so lets build a minimal grammar parser. Thats right. We're going to build a parser for our parser! This is very strong "who tests the tests" type of energy.

Regardless, this is one of those things that building this smaller tool can help pay dividends for larger tools.

If you've ever worked with tools like Prism or looked at other parsers, building regex based grammars is not fun, they don't read very well, and they're not portable.

Come back to me when you can explain the regex in Prism for TypeScript functions.

<https://github.com/PrismJS/prism/blob/d805f30275e279907cbad8a339a3d899fc0ea8d8/src/languages/typescript.js#L58-L67>

Anyways, I'm not going to read if there's a spec for ungrammar. (If there even is one.)

We already established I can't read. So instead, lets look at the definition for `L` that is an ungrammar file and see if we can figure out what we need.

```plaintext
File = Fn*

Fn = 'fn' 'name' ParamList ('->' TypeExpr)? Block

ParamList = '(' Param* ')'
Param = 'name' ':' TypeExpr ','?

TypeExpr = 'name'

Block = '{' Stmt* '}'

Stmt =
  StmtExpr
| StmtLet
| StmtReturn

StmtExpr = Expr ';'
StmtLet = 'let' <identifier> '=' Expr ';'
StmtReturn = 'return' Expr ';'

Expr =
  ExprLiteral
| ExprName
| ExprParen
| ExprBinary
| ExprCall

ExprLiteral = 'int' | 'true' | 'false'
ExprName = 'name'
ExprParen = '(' Expr ')'
ExprBinary = Expr ('+' | '-' | '*' | '/') Expr
ExprCall = Expr ArgList

ArgList = '(' Arg* ')'
Arg = Expr ','?
```

> Single quotes signify terminals: 'fn' and 'return' are keywords, 'name' stands for any identifier token, like foo, and '(' is punctuation. Unquoted names are non-terminals. For example, x: i32, would be an example of Param. Unquoted punctuation are meta symbols of ungrammar itself, semantics identical to regular expressions. Zero or more repetition is *, zero or one is ?, | is alternation and () are used for grouping.

I don't love that `'name'` is ambiguous as either a string, or a special predefined thing. So I'm going to go off the rails here and make the syntax: `<identifier>` which stands for a sequence of letters, numbers, and underscores, and cannot start with a number.

So with that out of the way, lets make the parser before the parser.

I don't know what I'm _really_ doing so I'm going to consult a book that does.

<https://craftinginterpreters.com>

Particularly this part about "lexemes and tokens"

<https://craftinginterpreters.com/scanning.html#lexemes-and-tokens>

With that out of the way, I think the best way forward is to _just build it_ now that I have a decent understanding.
