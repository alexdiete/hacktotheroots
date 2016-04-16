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
  
  var ZAHL = 0;

  client.walkDirections(origin_lat + "," + origin_lon, destination, (err, result) => {
    console.log(++ZAHL);
    if (err) throw err

    var destPos = result.routes[0].legs[0].end_location

    var walkDuration = result.routes[0].legs[0].duration
    var walkSteps = result.routes[0].legs[0].steps

    client.tramDirections(origin_lat + "," + origin_lon, destination, (err, resultTram) => {
      console.log(++ZAHL);
      if (err) throw err

      var tramSteps = resultTram.routes[0].legs[0].steps
      var tramDuration = resultTram.routes[0].legs[0].duration
 
      for (var i = 0; i < tramSteps.length; i++) {
        var stationName = ""
        var headsign = ""
        var time = (new Date()).getTime() / 1000
        if (tramSteps[i].travel_mode == 'TRANSIT') {
          stationName = tramSteps[i].transit_details.departure_stop.name
          headsign = tramSteps[i].transit_details.headsign
          time = tramSteps[i].transit_details.departure_time.value
        }
        rnv.get_delay(stationName, headsign, time, (err, data) => {
            
            var delayTime = err ? 0 : data.differenceTime

            nextbike.get_stations({
              lat: origin_lat,
              lng: origin_lon
            }, destPos, (err, data2) => {
              console.log(++ZAHL);
              client.walkDirections(origin_lat + "," + origin_lon, data2.start.lat + "," + data2.start.lng, (err, result) => {
                var walk1Steps = result.routes[0].legs[0].steps
                var walk1Duration = result.routes[0].legs[0].duration
                client.bikeDirections(data2.start.lat + "," + data2.start.lng, data2.end.lat + "," + data2.end.lng, (err, result) => {
                  console.log(++ZAHL);
                  var bikeSteps = result.routes[0].legs[0].steps
                  var bikeDuration = result.routes[0].legs[0].duration
                  client.walkDirections(data2.end.lat + "," + data2.end.lng, destPos.lat + "," + destPos.lng, (err, result) => {
                    console.log(++ZAHL);
                    var walk2Steps = result.routes[0].legs[0].steps
                    var walk2Duration = result.routes[0].legs[0].duration

                    response = {
                      tram_duration: tramDuration.value,
                      tram_steps: tramSteps,
                      walk_duration: walkDuration.value,
                      walk_steps: walkSteps,
                      tram_delay: parseInt(delayTime, 10),
                      data: data2,
                      bike_duration: walk1Duration.value + bikeDuration.value + walk2Duration.value,
                      bike_steps: [...walk1Steps, ...bikeSteps, walk2Steps],
                    }
                    res.send(response)
                  })
                })
              })

            })


          })
      }

    })
  })

});

module.exports = router;