var express = require('express');
var router = express.Router();
var google_directions = require('../google_directions')
var rnv = require('./rnv')(process.env.RNV_API_KEY)
var nextbike = require('./nextbike')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.get('/options', function(req, res, next) {
  var origin_lat = req.query.origin_lat
  var origin_lon = req.query.origin_lon
  var destination = req.query.destination

  var client = google_directions(process.env.GOOGLE_API_KEY)

  client.walkDirections(origin_lat + "," + origin_lon, destination, (err, result) => {
    if (err) throw err

    var destPos = result.routes[0].legs[0].end_location

    var walkDuration = result.routes[0].legs[0].duration

    client.tramDirections(origin_lat + "," + origin_lon, destination, (err, resultTram) => {
      if (err) throw err

      var tramSteps = resultTram.routes[0].legs[0].steps
      var tramDuration = resultTram.routes[0].legs[0].duration

      for (var i = 0; i < tramSteps.length; i++) {
        if (tramSteps[i].travel_mode == 'TRANSIT') {
          var stationName = tramSteps[i].transit_details.departure_stop.name
          var headsign = tramSteps[i].transit_details.headsign
          var time = tramSteps[i].transit_details.departure_time.value
          rnv.get_delay(stationName, headsign, time, (err, data) => {
            if (err) throw err
            var delayTime = data.differenceTime

            nextbike.get_stations({
              lat: origin_lat,
              lng: origin_lon
            }, destPos, (err, data2) => {
              response = {
                tram_duration: tramDuration,
                walk_duration: walkDuration,
                tram_delay: delayTime,
                data: data2
              }
              res.send(response)
            })


          })
        }
      }






    })
  })

});

module.exports = router;