# Reshape Plugin Util

[![npm](https://img.shields.io/npm/v/reshape-plugin-util.svg?style=flat-square)](https://npmjs.com/package/reshape-plugin-util)
[![tests](https://img.shields.io/travis/reshape/plugin-util.svg?style=flat-square)](https://travis-ci.org/reshape/plugin-util?branch=master)
[![dependencies](https://img.shields.io/david/reshape/plugin-util.svg?style=flat-square)](https://david-dm.org/reshape/plugin-util)
[![coverage](https://img.shields.io/coveralls/reshape/plugin-util.svg?style=flat-square)](https://coveralls.io/r/reshape/plugin-util?branch=master)

A little set of utilities for reshape plugins

> **Note:** This project is in early development, and versioning is a little different. [Read this](http://markup.im/#q4_cRZ1Q) for more details.

### Installation

`npm i reshape-plugin-util --save`

> **Note:** This project is compatible with node v6+ only

### Usage

This is just a small utility that contains a couple a useful functions when developing reshape plugins.

#### `modifyNodes(tree, match, transform)`

Given a reshape AST, a function that will return any node that matches given criteria, and a function that receives matched nodes and returns one or more modified nodes, returns a modified AST.

Example: Using `modifyNodes` to modify a node's content

```js
const util = require('reshape-plugin-util')

module.exports = function yellPlugin (tree) {
  return util.modifyNodes(tree, (node) => node.name === 'p', (node) => {
    node.content = node.content.map((n) => n.content.toUpperCase())
    return node
  })
}
```

Input:

```html
<p>hello world!</p>
```

Output:

```html
<p>HELLO WORLD!</p>
```

Example: Using `modifyNodes` to remove a node

```js
const util = require('reshape-plugin-util')

module.exports = function removeNodePlugin (tree) {
  return util.modifyNodes(tree, (node) => node.name === 'remove', (node) => {
    return null
  })
}
```

Input:

```html
<p>before</p>
<remove>hello world!</remove>
<p>after</p>
```

Output:

```html
<p>before</p>
<p>after</p>
```

Example: Using `modifyNodes` to add extra nodes

```js
const util = require('reshape-plugin-util')

module.exports = function echoPlugin (tree) {
  return util.modifyNodes(tree, (node) => node.name === 'echo', (node) => {
    if (!node.attrs) node.attrs = {}
    if (!node.attrs.class) node.attrs.class = []
    node.attrs.class.push('echo')
    node.name = 'div'
    return [node, node]
  })
}
```

Input:

```html
<p>before</p>
<echo>echo</echo>
<p>after</p>
```

Output:

```html
<p>before</p>
<div class='echo'>echo</div>
<div class='echo'>echo</div>
<p>after</p>
```

You can also return a promise from either function and it will work fine.

#### `validateNode(node)`

Given a single reshape AST node, checks it for formatting errors. Example:

```js
const util = require('reshape-plugin-util')

util.validateNode({
  type: 'text',
  content: ['foo', 'bar'],
  location: { line: 1, col: 1 }
})

// => Error: text node content must be a string
//    From: plugin-util
//    Node: {
//      type: 'text',
//      content: ['foo', 'bar'],
//      location: { line: 1, col: 1 }
//    }
```

#### `validateTree(tree)`

Recursively validates each node in a given reshape AST tree.

```js
const util = require('reshape-plugin-util')

util.validateNode({
  type: 'tag',
  name: 'div'
  content: [
    {
      content: 'foo',
      location: { line: 1, col: 4 }
    }
  ],
  location: { line: 1, col: 1 }
})

// => Error: node missing "type" attribute
//    From: plugin-util
//    Node: {
//      content: 'foo',
//      location: { line: 1, col: 4}
//    }
```

### License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](contributing.md)
