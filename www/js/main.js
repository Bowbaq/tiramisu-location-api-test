var socket = io.connect("http://sleepy-brook-7383.herokuapp.com");

function geolocate() {
  if (Modernizr.geolocation) {
    navigator.geolocation.watchPosition(geo_success, geo_error, {enableHighAccuracy: true, maximumAge: 30000, timeout: 27000});
  } else {
    $('body').append("Your device doesn't appear to support geolocation");
  }
}

function geo_success(location) {
  socket.emit('location', {
    time: location.timestamp,
    lat: location.coords.latitude,
    lng: location.coords.longitude
  });
}

function geo_error() {
  alert("Sorry, an error occured while geolocating");
}

$(geolocate);