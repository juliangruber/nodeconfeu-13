
var level = require('level');
var http = require('http');
var ecstatic = require('ecstatic');
var browserify = require('browserify');
var Engine = require('engine.io-stream');
var multilevel = require('multilevel');
var liveStream = require('level-live-stream');
var sub = require('level-sublevel');

// http server

var serve = ecstatic(__dirname + '/static');

var server = http.createServer(function(req, res) {
  if (req.url == '/bundle.js') {

    browserify(__dirname + '/browser.js')
    .bundle({ debug: true })
    .pipe(res);

  } else {

    serve(req, res);
  
  }
});

server.listen(8000);

// db
var db = sub(level(__dirname + '/db', {
  valueEncoding: 'json'
}));
liveStream.install(db.sublevel('messages'));
liveStream.install(db.sublevel('cool-messages'));
multilevel.writeManifest(db, __dirname + '/manifest.json');

// cool messages
db
.sublevel('messages')
.createLiveStream().on('data', function(chg) {
  if (chg.type && chg.type != 'put') return;
  if (/node|npm/i.test(chg.value.text)) {
    db.sublevel('cool-messages').put(chg.key, chg.value);
  }
});

// multilevel
var engine = Engine(function(con) {
  con.pipe(multilevel.server(db)).pipe(con);
});
engine.attach(server, '/engine');

