module.exports = class UtilError extends Error {
  constructor (message, node) {
    super(message)

    this.message = `${message}\nFrom: plugin-util\n\nNode: ${JSON.stringify(node, null, 2)}`

    Error.captureStackTrace(this, this.constructor)
  }
}
