var fs = require('fs'),
  async = require('async'),
  _ = require('lodash'),
  storage = require('node-persist'),
  inputFile = process.argv[3],
  fileData = '',
  dictionary = [];

if (process.argv[2] === 'encode') {
  fs.readFile(inputFile, 'utf8', function (err, data) {
    if (err) console.log(err);
    else {
      fileData = data;
      var actualFileData = data.split(' ');
      var uniqFileData = _.uniq(actualFileData);

      //Count occurrence for each word to create dictionary
      async.forEach(uniqFileData, function (item, callback) {
        var temp = {key: item, counter: 0};
        async.forEach(actualFileData, function (item2, cb) {
          if (item2 === item) temp.counter++;
          cb();
        }, function (err) {
          if (err) console.log(err);
          else dictionary.push(temp);
          callback();
        })
      }, function (err) {
        if (err) console.log(err);
        else {
          dictionary.sort(function (a, b) {
            return b.counter - a.counter;
          });
          compress();
        }
      })
    }
  });
}

if (process.argv[2] === 'decode') {
  decompress();
}

function compress() {
  async.forEachOf(dictionary, function (item, index, callback) {
    item.code = " " + index + " ";
    fileData = fileData.replace(new RegExp('\\s' + item.key + '\\s', 'g'), item.code);
    callback();
  }, function () {
    fs.writeFile('compressed.txt', fileData, function (err, data) {
      if (err) console.log(err);
      else {
        console.log('File compressed successfully to compressed.txt');
        storage.init({continuous: true}).then(function () {
          storage.setItem('dictionary', dictionary); //save dictionary for decompression
        });
      }
    });
  })
};

function decompress() {
  storage.init({continuous: true}).then(function () {
    storage.getItem('dictionary').then(function (value) { //Get dictionary for decompress
      if (_.isUndefined(value) || _.isEmpty(value)) {
        console.log('Dictionary not defined, compress first and try again!!');
      } else {
        dictionary = value;
        fs.readFile(inputFile, 'utf8', function (err, data) {
          if (err) console.log(err);
          else {
            fileData = data;
            async.forEach(dictionary, function (item, callback) {
              fileData = fileData.replace(new RegExp(item.code, 'g'), " " + item.key + " ");
              callback();
            }, function () {
              fs.writeFile('decompressed.txt', fileData, function (err, data) {
                if (err) console.log(err);
                else{
                  storage.setItem('dictionary', []);
                  console.log('File decompressed successfully to decompressed.txt');
                }
              });
            })
          }
        })
      }
    })
  });
}
