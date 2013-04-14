var
  childProcess = require('child_process')
, request = require('request')

, speechAPI = "https://www.google.com/speech-api/v1/recognize?client=chromium&lang=en"
;

//This helper function from here: http://osdir.com/ml/lang-javascript-nodejs/2010-11/msg00042.html
function pumpToBuffer(readStream, callback) {
  var
    errState = null
  , chunks = []
  , length = 0
  ;

  readStream.on("error", function(err) {
    callback(errState = err);
  });

  readStream.on("data", function(chunk) {
    if (errState) return;
    chunks.push(chunk);
    length += chunk.length;
  });

  readStream.on("end", function() {
    if (errState) return;
    var buf = new Buffer(length);
    var i = 0;
    chunks.forEach(function(b) {
      b.copy(buf, i, 0, b.length);
      i += b.length;
    });
    callback(null, buf);
  });
}


function recognize(data) {

  var callback = function(err, res, body) {
    console.log(err);
    // console.log(res);
    console.log(JSON.parse(body));
  };

  var r = request({
    url: speechAPI
  , method: 'POST'
  , headers: {'Content-Type': 'audio/x-flac; rate=16000'}
  , body: data
  }, callback);
}

var bin = childProcess.spawn(
  'sox'
, [
    '-d'
  , '--norm'
  , '-t', '.flac'
  , '-'
  , 'silence', '1', '5' ,'1%', '1', '0:00:02', '2%'
  , 'rate', '16k'
  ]
);

 pumpToBuffer(bin.stdout, function(err, buffer){
  recognize(buffer);
});

// bin.on('close', function(code) {
//   console.log("Code:", code);

//   // fs.readFile('test.flac', function(err, data) {
//   //   if (err) throw err;
//   //   recognize(data);
//   // });
// });