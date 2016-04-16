var request = require('request');
var stations = require('./map_stations');

module.exports = function(api_token) {
	return { 
		get_delay: function(station, tram, time, cb) {
			var id = stations[station];
			if (!id) {
				return cb(new Error('Could not match station'));
			}
			var options = {
				url: 'http://rnv.the-agent-factory.de:8080/easygo2/api/regions/rnv/modules/stationmonitor/element?hafasID='+id+'&time='+time,
				headers: {
					'RNV_API_TOKEN': api_token,
					'Accept': 'application/json'
				}
			}
			request(options, function(err, res, body) {
				if (err) {
					return cb(err);
				}
				body.listOfDepartures.forEach(function(e) {
					if (e.direction == tram) {
						return cb(null, e)
					}
				});
				return cb(new Error('Could not find tram in response'));
			});
		}
	}
}