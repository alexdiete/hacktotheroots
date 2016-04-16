var st = require('./stations.json');
var d = {}

var fs = require('fs');

Object.keys(st).forEach(function(e) {
    d[st[e].name] = e;
});

fs.writeFileSync('map_stations.json', JSON.stringify(d));
