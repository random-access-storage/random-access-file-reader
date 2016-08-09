var AbstractRandomAccess = require('abstract-random-access')
var unordered = require('unordered-set')
var inherits = require('inherits')

module.exports = RAF

function RAF (file) {
  if (!(this instanceof RAF)) return new RAF(file)
  AbstractRandomAccess.call(this)

  this.length = file.size
  this.file = file

  this._free = []
  this._used = []
}

inherits(RAF, AbstractRandomAccess)

RAF.prototype._alloc = function () {
  var self = this
  var reader = new Reader(this.file)

  reader.onfree = onfree
  unordered.add(this._free, reader)

  function onfree () {
    unordered.remove(self._used, reader)
    unordered.add(self._free, reader)
  }
}

RAF.prototype._next = function () {
  if (!this._free.length) this._alloc()
  var free = this._free[0]
  unordered.remove(this._free, free)
  unordered.add(this._used, free)
  return free
}

RAF.prototype._write = function (offset, buffer, cb) {
  cb(new Error('Readonly'))
}

RAF.prototype._read = function (offset, length, cb) {
  this._next().read(offset, length, cb)
}

RAF.prototype._close = function (cb) {
  for (var i = 0; i < this._used.length; i++) {
    this._used[i].destroy()
  }
}

function Reader (file) {
  var self = this

  this.onfree = null
  this.file = file

  this._index = 0
  this._callback = null
  this._reader = new window.FileReader()
  this._reader.onload = onload
  this._reader.onerror = onerror

  function onerror () {
    call(new Error('Read failed'), null)
  }

  function onload (e) {
    call(null, Buffer(e.target.result))
  }

  function call (err, val) {
    var cb = self._callback
    if (!cb) return
    self._callback = null
    self.onfree()
    cb(err, val)
  }
}

Reader.prototype.read = function (offset, length, cb) {
  var slice = this.file.slice(offset, offset + length)
  this._callback = cb
  this._reader.readAsArrayBuffer(slice)
}

Reader.prototype.destroy = function () {
  this._reader.abort()
}
