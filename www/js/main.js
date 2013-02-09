var DataCollector = (function(DataCollector){
  var socket, current_type;
  
  var geo_id, geo_options = {
    enableHighAccuracy: true, 
    maximumAge: 30000, 
    timeout: 27000
  };
  
  function collectGPS(location) {
    socket.emit('gps', {
      time: location.timestamp,
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      type: current_type
    });
  }
  
  function collectAcc(acc) {
    socket.emit('acc', {
      time: Date.now(),
      x: acc.x,
      y: acc.y,
      z: acc.z,
      type: current_type
    });
  }
  
  DataCollector.collect = function collect(type) {
    current_type = type;
    if (Modernizr.geolocation) {
      geo_id = navigator.geolocation.watchPosition(collectGPS, null /* Do nothing on error */, geo_options);
    }
    
    gyro.startTracking(collectAcc);
  };
  
  DataCollector.stop = function stop() {
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
  
  current_type = $('#type').val();
  DataCollector.collect();
});

$('#stop').on('click', function() {
  $('#start').removeAttr('disabled');
  $('#stop').attr('disabled', 'disabled');
  
  DataCollector.stop();
});
