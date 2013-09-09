var level = require('level');
var sub = require('level-sublevel');
var liveStream = require('level-live-stream');

var db = sub(level(__dirname + '/db'));
liveStream.install(db);

db.sublevel('foo').createLiveStream().on('data', console.log);

db.sublevel('foo').put('a', 'datum');
