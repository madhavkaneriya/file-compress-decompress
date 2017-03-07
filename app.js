var fs = require('fs'),
    async = require('async'),
    _ = require('lodash'),
    fileData = '',
    dictionary = [];

fs.readFile('input.txt', 'utf8', function (err, data) {
  if (err) console.log(err);
  else {
    fileData = data;
    var actualFileData = data.split(' ');
    var uniqFileData = _.uniq(actualFileData);

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
      else{
        dictionary.sort(function(a,b){
          return b.counter-a.counter;
        });
        compress();
      }
    })
  }
});

function compress(){
  async.forEachOf(dictionary,function(item,index,callback){
    item.code = " "+index+" ";
    fileData = fileData.replace(new RegExp('\\s'+item.key+'\\s','g'),item.code)
    callback();
  },function(){
    fs.writeFile('compressed.txt',fileData,function(err,data){
      if(err) console.log(err);
      else{
        console.log('File compressed successfully!!',fileData.length);
        decompress();
      }
    });
  })
};

function decompress(){
  fs.readFile('compressed.txt','utf8',function(err,data){
    if(err) console.log(err);
    else {
      fileData = data
      async.forEach(dictionary,function(item,callback){
        fileData = fileData.replace(new RegExp(item.code,'g')," " + item.key + " ");
        callback();
      },function(){
        fs.writeFile('decompressed.txt',fileData,function(err,data){
          if(err) console.log(err);
          else console.log('File decompressed successfully!!',fileData.length);
        });
      })
    }
  })
}