var DataCollector = (function(DataCollector){
  var socket, current_type;
  
  var geo_id, geo_options = {
    enableHighAccuracy: true, 
    maximumAge: 30000, 
    timeout: 27000
  };
  
  function collectGPS(location) {
    socket.emit('gps', {
      time: new Date(location.timestamp),
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      speed: location.coords.speed || 0,
      type: current_type
    });
    
    console.log({
      time: new Date(location.timestamp),
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      speed: location.coords.speed || 0,
      type: current_type
    });
  }
  
  function collectAcc(acc) {
    console.log("Emitting acc data");
    socket.emit('acc', {
      time: new Date(),
      x: acc.x,
      y: acc.y,
      z: acc.z,
      type: current_type
    });
  }
  
  DataCollector.collect = function collect(type) {
    console.log("Starting emission");
    current_type = type;
    if (Modernizr.geolocation) {
      geo_id = navigator.geolocation.watchPosition(collectGPS, null /* Do nothing on error */, geo_options);
    }
    
    gyro.startTracking(collectAcc);
    
    socket.emit('start', {});
  };
  
  DataCollector.stop = function stop() {
    console.log("Stopping emission");
    navigator.geolocation.clearWatch(geo_id);
    gyro.stopTracking();
  };
  
  DataCollector.init = function init() {
    socket = io.connect("http://gentle-falls-1532.herokuapp.com");
  };
  
  return DataCollector;
})(DataCollector || {});

DataCollector.init();

$('#start').on('click', function() {
  $('#start').attr('disabled', 'disabled');
  $('#stop').removeAttr('disabled');
  
  DataCollector.collect($('#type').val());
});

$('#stop').on('click', function() {
  $('#start').removeAttr('disabled');
  $('#stop').attr('disabled', 'disabled');
  
  DataCollector.stop();
});
