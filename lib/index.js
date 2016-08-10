const UtilError = require('./error')

exports.modifyNodes = function modifyNodes (tree, criteria, transform) {
  return tree.reduce((m, node) => {
    // bottom-up recurse
    if (node.type === 'tag' && node.content) {
      node.content = modifyNodes(node.content, criteria, transform)
    }

    // if it doesn't match the criteria, move on
    if (!criteria(node)) { m.push(node); return m }

    // if it does, run the user transform
    const output = transform(node)

    // push the output into the tree if it's a valid type
    if (Array.isArray(output)) {
      m = m.concat(output)
    } else if (typeof output === 'object') {
      m.push(output)
    } else if (!output) {
      // no node added
    } else {
      throw new UtilError('invalid replacement node', output)
    }

    return m
  }, [])
}

function validateNode (node) {
  if (typeof node !== 'object' || Array.isArray(node)) {
    throw new UtilError('node must be an object', node)
  }

  if (!node.type) {
    throw new UtilError('node must have a "type" property', node)
  }

  if (node.type === 'tag') {
    if (!Array.isArray(node.content)) {
      throw new UtilError("tag node's content must be an array", node)
    }

    if (node.attrs) {
      if (typeof node.attrs !== 'object' || Array.isArray(node.attrs)) {
        throw new UtilError('attributes must be an object', node)
      }

      for (let k in node.attrs) {
        if (!Array.isArray(node.attrs[k])) {
          throw new UtilError(`attribute value for ${k} must be an array`, node)
        }
      }
    }
  }

  if (node.type === 'text' || node.type === 'comment' || node.type === 'code') {
    if (typeof node.content !== 'string') {
      throw new UtilError(`${node.type} node contents should be a string`, node)
    }
  }

  if (node.type === 'code') {
    if (node.content.match(/__nodes/) && !node.nodes) {
      throw new UtilError('You must have a "nodes" property in order to use the "__nodes" code helper', node)
    }

    if (node.nodes && !Array.isArray(node.nodes)) {
      throw new UtilError('"nodes" property must be an array')
    }
  }
}

exports.validateNode = validateNode

function validateTree (tree) {
  tree.map((node) => {
    if (node.type === 'tag' && node.content) validateTree(node.content)
    validateNode(node)
  })
}

exports.validateTree = validateTree
