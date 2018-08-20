# md2html

Used to convert markdown to html.

Based on javascript (nodejs) and:

* markdown-it
* highlight.js
* katex
* markdown-it-texmath

Usage:

```shell
node md2html.js { sourceFile | sourceDir } [-o outDir]
```

Example:

Assume that I have:

``` markdown
- a.md
- b.md
+ ccc
  - chn.md
  - oeu.md
```

Then I run:

```shell
node md2html.js a.md b.md ccc -o result
```

There will be a directory named "result" containing compiled files.