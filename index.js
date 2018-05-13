var RandomAccess = require('random-access-storage')
var unordered = require('unordered-set')
var inherits = require('inherits')

module.exports = RAF

function RAF (file) {
  if (!(this instanceof RAF)) return new RAF(file)
  RandomAccess.call(this)

  this.file = file

  this._free = []
  this._used = []
}

inherits(RAF, RandomAccess)

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

RAF.prototype._stat = function (req) {
  req.callback(null, {
    size: this.file.size,
    mtime: this.file.lastModifiedDate,
    type: this.file.type
  })
}

RAF.prototype._write = function (req) {
  req.callback(new Error('Readonly'))
}

RAF.prototype._read = function (req) {
  this._next().read(req)
}

RAF.prototype._close = function (req) {
  for (var i = 0; i < this._used.length; i++) {
    this._used[i].destroy()
  }
  req.callback()
}

function Reader (file) {
  var self = this

  this.onfree = null
  this.file = file

  this._index = 0
  this._req = null
  this._reader = new window.FileReader()
  this._reader.onload = onload
  this._reader.onerror = onerror

  function onerror () {
    call(new Error('Read failed'), null)
  }

  function onload (e) {
    call(null, Buffer.from(e.target.result))
  }

  function call (err, val) {
    var req = self._req
    if (!req) return
    self._req = null
    self.onfree()
    req.callback(err, val)
  }
}

Reader.prototype.read = function (req) {
  var slice = this.file.slice(req.offset, req.offset + req.size)
  this._req = req
  this._reader.readAsArrayBuffer(slice)
}

Reader.prototype.destroy = function () {
  this._reader.abort()
}
