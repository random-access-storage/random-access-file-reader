var drop = require('drag-and-drop-files')
var raf = require('./')

document.body.style.width = document.body.style.height = '1000px'

drop(document.body, function (files) {
  var file = raf(files[0])
  var offset = 0

  file.stat(function (err, st) {
    if (err) throw err
    console.log('stat:', st)
    loop()

    function loop () {
      if (offset === st.size) {
        console.log('(done)')
        return
      }

      file.read(offset, Math.min(st.size - offset, 16 * 1024), function (err, buf) {
        if (err) throw err
        offset += buf.length
        console.log('read:', buf)
        loop()
      })
    }
  })
})
