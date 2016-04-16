var request = require('request');
var xml = require('libxmljs');

module.exports = {
    get_stations:  function(cb) {
        var stations = [];
        request('https://nextbike.net/maps/nextbike-live.xml', function(err, res, body) {
            if (err) {
                return cb(err);
            }
            var doc = xml.parseXml(body);
            var ma = doc.get("//city[@name='Mannheim']");
            ma.childNodes().forEach(function(e) {
                var data = {
                    lat: e.attr('lat').value(),
                    lng: e.attr('lng').value(),
                    bikes: e.attr('bikes').value(),
                }
                stations.push(data);
            });
            return cb(null, stations);
        });
    }
}


