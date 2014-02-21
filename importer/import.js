var jsdom = require("jsdom")
  , async = require("async")
  , csv = require("csv");

var count = 0;

function readPage(page, output, cb) {
  jsdom.env(page, ["http://code.jquery.com/jquery.js"], function (err, window) {
    count = 0;
    window.$('ol li a').each(function (i, el) {
      output.write([el.innerHTML, window.$(el).attr('href')]);
      ++count;
    });
    cb();
  });
}

function loadList(dom) {
  return function (cb) {
    var start = 1;
    var output = csv().to(dom + ".csv");
    process.stdout.write("["+dom+"] ");
    async.doUntil(function(cb) {
      var page = "http://univ.cc/search.php?dom=" + dom + "&key=&start=" + start;
      readPage(page, output, cb);

    }, function() {
      start += 50;
      process.stdout.write('.');
      return count == 0;

    }, function () {
      output.end();
      process.stdout.write('\n');
      cb();
    });
  };
}

async.series([
  loadList("edu"),
  loadList("world")
]);



