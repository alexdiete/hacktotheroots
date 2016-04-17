var request = require('request');
var xml = require('libxmljs');

function distance(s, e) {
    var a = s.lat - e.lat;
    var b = s.lng - e.lng;
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

module.exports = {
    // {lat:xxx, lng: xxx}
    get_stations: function(start, end, cb) {
        var stations = [];
        console.log("start nb")
        request('http://nextbike.net/maps/nextbike-live.xml', function(err, res, body) {
            console.log("end nb")
            if (err) {
                return cb(err);
            }
            var doc = xml.parseXml(body);
            var min_start = 9999;
            var min_end = 9999;
            var result = {
                start: {},
                end: {}
            }
            var ma = doc.get("//city[@name='Mannheim']");
            ma.childNodes().forEach(function(e) {
                if (e.attr('bikes').value() != '0') {
                    var data = {
                        lat: Number.parseFloat(e.attr('lat').value()),
                        lng: Number.parseFloat(e.attr('lng').value()),
                        bikes: e.attr('bikes').value(),
                        name: e.attr('name').value(),
                    }
                    data['distance_start'] = distance(start, data);
                    data['distance_end'] = distance(end, data);
                    if (data['distance_start'] < min_start) {
                        result.start = data;
                        min_start = data['distance_start']
                    }
                    if (data['distance_end'] < min_end) {
                        result.end = data;
                        min_end = data['distance_end']
                    }
                }
            });
            return cb(null, result);
        });
    }
}