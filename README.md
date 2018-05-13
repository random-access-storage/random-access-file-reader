# random-access-file-reader

A [random-access-storage](https://github.com/random-access-storage/random-access-storage) compliant module for reading files in the browser using the [FileReader API](https://developer.mozilla.org/en/docs/Web/API/FileReader) and browserify.

[![build status](http://img.shields.io/travis/random-access-storage/random-access-file-reader.svg?style=flat)](http://travis-ci.org/random-access-storage/random-access-file-reader)

```
npm install random-access-file-reader
```

## Usage

``` js
var raf = require('random-access-file-readers')
var drop = require('drag-and-drop-files')

drop(document.body, function (files) {
  var file = raf(files[0])

  file.read(0, 1000, function (err, data) {
    console.log('first 1000 bytes:', err, data)
  })
})
```

You can use this to read files into hyperdrive as well

``` js
var hyperdrive = require('hyperdrive')
var drive = hyperdrive(db)

var files = {}
var archive = drive.createArchive({
  file: function (name) {
    return raf(files[name])
  }
})

drop(document.body, function (files) {
  files[files[0].name] = files[0]
  // will index the file using hyperdrive without reading the entire file into ram
  archive.append(files[0].name)
})

```

## API

#### `var file = raf(browserFile)`

Create a new instance. Accepts a browser file object. The file object has an [random-access-storage](https://github.com/random-access-storage/random-access-storage) compliant API interface. Note that it is readonly so writes will fail.

## License

MIT
