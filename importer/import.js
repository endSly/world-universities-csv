var jsdom = require("jsdom")
  , async = require("async")
  , csv = require("csv")
  , countries  = require('country-data').countries;

var count = 0;

var lastPage;

function readPage(page, write, cb) {
  jsdom.env(page, ["http://code.jquery.com/jquery.js"], function (err, window) {
    count = 0;
    var firstItem = window.$('ol li a')[0];
    if (firstItem) {
      var currentPage = firstItem.innerHTML;
      if (currentPage == lastPage)
        return cb();

      lastPage = currentPage;
    }

    window.$('ol li a').each(function (i, el) {
      write(el.innerHTML, window.$(el).attr('href'));
      ++count;
    });
    cb();
  });
}

var output = csv().to("world-universities.csv");

function loadList(dom, country, cb) {
  var total = 0;
  var start = 1;
  process.stdout.write("["+country+"] ");
  async.doUntil(function(cb) {
    var page = "http://univ.cc/search.php?dom=" + dom + "&key=&start=" + start;
    readPage(page, function (name, url) {
      output.write([country, name, url]);
    }, cb);

  }, function() {
    start += 50;
    total += count;
    process.stdout.write('.');
    return count < 50;

  }, function () {
    process.stdout.write(total + '\n');
    cb();
  });
}

var countriesCodes = Object.keys(countries);

async.eachSeries(countriesCodes, function(country, cb) {
  if (country.length != 2)
    return cb();

  var dom = country == "US" ? "edu" : country;
  loadList(dom.toLowerCase(), country, cb);
}, function() {
  output.end();
});



