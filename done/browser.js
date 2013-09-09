
var Engine = require('engine.io-stream');
var multilevel = require('multilevel');
var manifest = require('./manifest.json');
var List = require('level-list');
var container = require('container-el');
var EnterInput = require('enter-input');
var reactive = require('reactive-component');
var domify = require('domify');

// db
var db = multilevel.client(manifest);
window.db = db;

// multilevel
var con = Engine('/engine');
con.pipe(db.createRpcStream()).pipe(con);

// message input
var author = prompt('whoami?');
var input = EnterInput(function(ev) {
  db.sublevel('messages').put(Date.now(), {
    author: author,
    text: this.value,
    date: (new Date()).toString()
  });
  this.value = '';
});
input.style.float = 'left';
input.style.width = '100%';
container.appendChild(input);

// message list
(function() {
  var tmpl = '<p>{date} <{author}> {text}</div>';
  var list = List(db.sublevel('messages'), function(row) {
    var view = reactive(domify(tmpl), row);
    return view.el;
  });
  list.el.style.float = 'left';
  container.appendChild(list.el);
})();

// cool messages list
(function() {
  var tmpl = '<p><strong>{date} <{author}>: {text}</strong></div>';
  var list = List(db.sublevel('cool-messages'), function(row) {
    var view = reactive(domify(tmpl), row);
    return view.el;
  });
  list.el.style.float = 'right';
  container.appendChild(list.el);
})();

