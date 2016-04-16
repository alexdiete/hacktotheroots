angular.module('starter.controllers', [])

.controller('StartCtrl', function($scope, $state) {
    var initialize = function() {
      var myLatlng = new google.maps.LatLng(49.4869084, 8.4658363);

      var mapOptions = {
        center: myLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
      };
      var map = new google.maps.Map(document.getElementById("map"), mapOptions);

      $scope.map = map;

      $scope.centerOnMe();
    }

    $scope.centerOnMe = function() {
      if (!$scope.map) {
        return;
      }

      navigator.geolocation.getCurrentPosition(function(pos) {
        $state.position = pos;
        window.pos = pos;
        var currentLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

        $scope.map.setCenter(currentLocation);

        var marker = new google.maps.Marker({
          position: currentLocation,
          map: $scope.map,
          title: "current location"
        });
      }, function(error) {
        //alert('Unable to get location: ' + error.message);
      });
    };

    $scope.clickTest = function() {
      alert('Example of infowindow with ng-click')
    };

    initialize();
  })
  .controller('ResultCtrl', function($scope, $injector, $state, $stateParams) {
    $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
      viewData.enableBack = true;
    });

    var removeStuff = function(e) {
      e.html_instructions = String(e.html_instructions).replace(/<br\s*\/?>/gm, '\n').replace(/<[^>]+>/gm, '');
      return e;
    }
    $scope.tram_steps = []
    $scope.walk_steps = []
    $scope.bike_steps = []

    var routeService = $injector.get('Route');
    routeService.loadData($stateParams.destination, window.pos, function(result) {
      $scope.tram_steps = result.data.tram_steps.map(removeStuff)
      $scope.walk_steps = result.data.walk_steps.map(removeStuff)
      $scope.bike_steps = result.data.bike_steps.map(removeStuff)
    })
  });
