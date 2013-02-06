var socket = io.connect(window.location.origin);

socket.emit('join:display');
socket.on('location', function(location) {
  var data = '<tr><td>{{TIME}}</td><td>{{LAT}}</td><td>{{LNG}}</td></tr>'
    .replace('{{TIME}}', location.time)
    .replace('{{LAT}}', location.lat)
    .replace('{{LNG}}', location.lng)
  ;
  
  $('#locations tbody').append(data);
});
