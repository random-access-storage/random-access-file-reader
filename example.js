var drop = require('drag-and-drop-files')
var raf = require('./')

document.body.style.width = document.body.style.height = '1000px'

drop(document.body, function (files) {
  var file = raf(files[0])
  var offset = 0

  loop()

  function loop () {
    if (offset === file.length) {
      console.log('(done)')
      return
    }

    file.read(offset, Math.min(file.length - offset, 16 * 1024), function (err, buf) {
      if (err) throw err
      offset += buf.length
      console.log('read:', buf)
      loop()
    })
  }
})
