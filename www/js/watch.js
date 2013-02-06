var socket = io.connect("http://sleepy-brook-7383.herokuapp.com");
var start = moment();

socket.emit('join:display');
socket.on('location', function(location) {
  var data = '<tr><td>{{TIME}}</td><td>{{LAT}}</td><td>{{LNG}}</td></tr>'
    .replace('{{TIME}}', moment(location.time).from(start))
    .replace('{{LAT}}', location.lat)
    .replace('{{LNG}}', location.lng)
  ;
  
  $('#locations tbody').append(data);
});
