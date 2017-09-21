var jsdom = require("jsdom")
  , async = require("async")
  , fs = require('fs')
  , request = require('request')
  , stringify = require("csv-stringify")
  , countries  = require('country-data').countries;

const { JSDOM } = jsdom;

let count;

let lastPage;

function readPage(body, write, cb) {
  const { document } = (new JSDOM(body)).window;

  count = 0;

  const firstItem = document.querySelector('ol li a');
  if (firstItem) {
    const currentPage = firstItem.innerHTML;
    if (currentPage === lastPage) {
      return cb();
    }
    lastPage = currentPage;
  }

  const allItems = document.querySelectorAll('ol li a');

  for (count = 0; count < allItems.length; count++) {
    write(allItems[count].innerHTML, allItems[count].href);
  }

  cb();
}

const fileStream = fs.createWriteStream('world-universities.csv');
const output = stringify();
output.on('readable', function() {
    while(row = output.read()){
        fileStream.write(row);
    }
});

function loadList(dom, country, cb) {
  let total = 0;
  let start = 1;
  process.stdout.write("["+country+"] ");
  async.doUntil(function(cb) {
    request("http://univ.cc/search.php?dom=" + dom + "&key=&start=" + start, function (error, response, body) {
        readPage(body, function (name, url) {
            output.write([country, name, url]);
        }, cb);
    });

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

const countriesCodes = Object.keys(countries);

async.eachSeries(countriesCodes, function(country, cb) {
  if (country.length !== 2)
    return cb();

  var dom = country == "US" ? "edu" : country;
  loadList(dom.toLowerCase(), country, cb);
}, function() {
  output.end();
});
