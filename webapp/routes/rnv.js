var request = require('request');
var stations = require('./map_stations');

module.exports = function(api_token) {
	return {
		// time := 'YYYY-MM-DD HH:MM'
		get_delay: function(station, tram, time, cb) {
			if (!station) {
				return cb(new Error("Yolomode"), null)
			}
			var d = new Date()
			d.setTime(time * 1000)

			var month = (d.getMonth() + 1);
			var timeString = d.getFullYear() + "-" + (month < 10 ? '0' + month.toString() : month)
			timeString += "-" + (d.getDate() < 10 ? '0' + d.getDate().toString() : d.getDate())
			timeString += "+" + (d.getHours() < 10 ? '0' + d.getHours().toString() : d.getHours())
			timeString += ":" + (d.getMinutes() < 10 ? '0' + d.getMinutes().toString() : d.getMinutes())

			var id = stations[station];
			if (!id) {
				return cb(new Error('Could not match station'));
			}
			var options = {
				url: 'http://rnv.the-agent-factory.de:8080/easygo2/api/regions/rnv/modules/stationmonitor/element?hafasID=' + id + '&time=' + timeString,
				headers: {
					'RNV_API_TOKEN': api_token,
					'Accept': 'application/json'
				}
			}
			request(options, function(err, res, body) {

				var data = JSON.parse(body)
				if (err) {
					return cb(err);
				}

				var foundStuff = null
				data.listOfDepartures.forEach(function(e) {
					if (e.direction == tram) {
						foundStuff = e
					}
				});
				if (foundStuff) {
					return cb(null, foundStuff)
				}
				return cb(new Error('Could not find tram ' + tram + ' in response'));
			});
		}
	}
}