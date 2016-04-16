/**
 * @author Johannes
 */
var GoogleMapsAPI = require('googlemaps');

module.exports = (apiKey) => {
    var publicConfig = {
        key: apiKey,
        stagger_time: 1000, // for elevationPath
        encode_polylines: false,
        secure: true, // use https
    };
    var gmAPI = new GoogleMapsAPI(publicConfig);

    var directions = (origin, destination, mode, callback) => {
        var options = {
            "origin": origin,
            "destination": destination,
            "language": "de",
            "transit_mode": "tram",
            "mode": mode,
            "units": "metric",
        }

        if (mode === 'transit') {
            options["departure_time"] = new Date();
        }

        gmAPI.directions(options, callback)
    }

    return {
        tramDirections: (origin, destination, callback) => directions(origin, destination, 'transit', callback),
        walkDirections: (origin, destination, callback) => directions(origin, destination, 'walking', callback),
        bikeDirections: (origin, destination, callback) => directions(origin, destination, 'bicycling', callback),
    }
}