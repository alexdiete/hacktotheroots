angular.module('starter.services', [])

.factory('Route', function($state, $http) {
  var route = {
    tram_steps: [],
    walk_steps: [],
    bike_steps: [],
  };

  return {
    loadData: function(query, successCallback){
      navigator.geolocation.getCurrentPosition(function(pos) {
        $http({
          method: 'GET',
          url: 'https://hacktotheroots.jwwk.de/options',
          params: {
            origin_lat: pos.coords.latitude,
            origin_lon: pos.coords.longitude,
            destination: query,
          }
        }).then(successCallback, function errorCallback(response) {
          alert("Anfrage fehlgeschlagen :-(")
        });
      });
    },
  };
});
