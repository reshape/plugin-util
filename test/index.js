const test = require('ava')
const path = require('path')
const {readFileSync} = require('fs')
const reshape = require('reshape')
const util = require('..')
const fixtures = path.join(__dirname, 'fixtures')

test('modifyNodes changes node content', (t) => {
  function plugin (tree) {
    return util.modifyNodes(tree, (n) => n.name === 'p', (node) => {
      node.content[0].content = 'replaced!'
      return node
    })
  }

  return reshape({ plugins: plugin })
    .process(readFileSync(path.join(fixtures, 'basic.html'), 'utf8'))
    .then((res) => t.truthy(res.output() === '<div class="wow">\n  <p>replaced!</p>\n</div>\n'))
})

test('modifyNodes replaces node with multiple nodes', (t) => {
  function plugin (tree) {
    return util.modifyNodes(tree, (n) => n.name === 'p', (node) => {
      return [node, node]
    })
  }

  return reshape({ plugins: plugin })
    .process(readFileSync(path.join(fixtures, 'basic.html'), 'utf8'))
    .then((res) => t.truthy(res.output() === '<div class="wow">\n  <p>hello world</p><p>hello world</p>\n</div>\n'))
})

test('modifyNodes errors when invalid return node provided', (t) => {
  function plugin (tree) {
    return util.modifyNodes(tree, (n) => n.name === 'p', (node) => {
      return 'foo'
    })
  }

  return reshape({ plugins: plugin })
    .process(readFileSync(path.join(fixtures, 'basic.html'), 'utf8'))
    .catch((err) => t.truthy(err.toString() === 'Error: invalid replacement node\nFrom: plugin-util\n\nNode: "foo"'))
})

test('validateNode', (t) => {
  util.validateNode({
    type: 'tag',
    name: 'p',
    attrs: { class: [
      { type: 'text', content: 'wow', location: { line: 1, col: 4 } }
    ] },
    content: [{ type: 'text', content: 'foo', location: { line: 1, col: 14 } }],
    location: { line: 1, col: 1 }
  })

  util.validateNode({
    type: 'tag',
    name: 'p',
    content: [{ type: 'text', content: 'foo', location: { line: 1, col: 14 } }],
    location: { line: 1, col: 1 }
  })

  t.throws(() => {
    util.validateNode([
      { type: 'text', content: 'bar' },
      { type: 'text', content: 'wow' }
    ])
  })

  t.throws(() => {
    util.validateNode({
      name: 'p',
      content: [{ type: 'text', content: 'foo', location: { line: 1, col: 3 } }],
      location: { line: 1, col: 1 }
    })
  })

  t.throws(() => {
    util.validateNode({
      type: 'tag',
      name: 'p',
      content: { type: 'text', content: 'foo', location: { line: 1, col: 3 } },
      location: { line: 1, col: 1 }
    })
  })

  t.throws(() => {
    util.validateNode({
      type: 'tag',
      name: 'p',
      attrs: { class: { type: 'text', content: 'wow' } },
      content: [{ type: 'text', content: 'foo', location: { line: 1, col: 3 } }],
      location: { line: 1, col: 1 }
    })
  })

  t.throws(() => {
    util.validateNode({
      type: 'tag',
      name: 'p',
      attrs: { class: 'foo' },
      content: [{ type: 'text', content: 'foo', location: { line: 1, col: 3 } }],
      location: { line: 1, col: 1 }
    })
  })

  t.throws(() => {
    util.validateNode({
      type: 'tag',
      name: 'p',
      attrs: 'foo=bar',
      content: [{ type: 'text', content: 'foo', location: { line: 1, col: 3 } }],
      location: { line: 1, col: 1 }
    })
  })

  t.throws(() => {
    util.validateNode({
      type: 'tag',
      name: 'p',
      attrs: [{ type: 'text', content: 'class' }],
      content: [{ type: 'text', content: 'foo', location: { line: 1, col: 3 } }],
      location: { line: 1, col: 1 }
    })
  })

  util.validateNode({
    type: 'text',
    content: 'foo',
    location: { line: 1, col: 1 }
  })

  t.throws(() => {
    util.validateNode({
      type: 'text',
      content: [{ type: 'text', content: 'foo' }],
      location: { line: 1, col: 1 }
    })
  })

  t.throws(() => {
    util.validateNode({
      type: 'code',
      content: [{ type: 'text', content: 'foo' }],
      location: { line: 1, col: 1 }
    })
  })

  t.throws(() => {
    util.validateNode({
      type: 'comment',
      content: [{ type: 'text', content: 'foo' }],
      location: { line: 1, col: 1 }
    })
  })

  util.validateNode({
    type: 'code',
    content: 'locals.foo',
    nodes: [{ type: 'text', content: 'bar' }],
    location: { line: 1, col: 1 }
  })

  t.throws(() => {
    util.validateNode({
      type: 'code',
      content: '__nodes[0]',
      nodes: { type: 'text', content: 'bar' },
      location: { line: 1, col: 1 }
    })
  })

  t.throws(() => {
    util.validateNode({
      type: 'code',
      content: '__nodes[0]',
      location: { line: 1, col: 1 }
    })
  })
})

test('validateTree', (t) => {
  util.validateTree([{
    type: 'tag',
    attrs: { class: [{ type: 'text', content: 'wow' }] },
    content: [
      {
        type: 'text',
        content: 'foo',
        location: { line: 1, col: 4 }
      }
    ],
    location: { line: 1, col: 1 }
  }])

  t.throws(() => {
    util.validateTree([{
      type: 'tag',
      attrs: { class: [{ type: 'text', content: 'wow' }] },
      content: [
        {
          type: 'text',
          content: ['foo'],
          location: { line: 1, col: 4 }
        }
      ],
      location: { line: 1, col: 1 }
    }])
  })
})
