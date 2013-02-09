var express = require('express'),
  app = express(),
  server = require('http').createServer(app), 
  io = require('socket.io').listen(server),
  path = require('path'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  
  db = mongoose.connect(process.env.MONGOLAB_URI),
  
  seqid
;

//======================================
//      mongoose config
//======================================
var GPSDataSchema =  mongoose.Schema({
  time: Number,
  lat:  Number,
  lng:  Number,
  seqid: Number,
  type: String
});
var GPSData = mongoose.model('GPSData', GPSDataSchema);

GPSData.helper = _.extend(GPSData.helper || {}, {
  record: function(data) {
    console.log('Got gps data :', data);
  }
});

var AccDataSchema =  mongoose.Schema({
  time: Number,
  x:  Number,
  y:  Number,
  z:  Number,
  seqid: Number,
  type: String
});
var AccData = mongoose.model('AccData', AccDataSchema);

AccData.helper = _.extend(AccData.helper || {}, {
  record: function(data) {
    console.log('Got accelerometer data :', data);
  }
});


//======================================
//      express config
//======================================
app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'www')));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

app.get('/', function (req, res) {
  res.sendfile(path.join(__dirname, 'www/index.html'));
});

app.get('/watch', function (req, res) {
  res.sendfile(path.join(__dirname, 'www/watch.html'));
});


//======================================
//      socket.io config
//======================================

// Heroku won't actually allow us to use WebSockets
// so we have to setup polling instead.
// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
io.configure(function() {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
    io.set("log level", 0);
});

//======================================
//      socket.io handling
//======================================

io.sockets.on('connection', function (socket) {
  socket.on('start', function() {
    seqid++;
  });
  
  socket.on('gps', function(data) {
    GPSData.helper.record(data);
  });
  socket.on('acc', function(data) {
    AccData.helper.record(data);
  });
});

//======================================
//      start server
//======================================

// Figure out the last sequence id
GPSData.findOne().sort('-seqid').exec(function(err, data) {
  if(err || !data) {
    seqid = 0;
  } else {
    seqid = data.seqid;
  }
  
  server.listen(app.get('port'), function() {
      console.log(
          "Express server listening on port %d in %s mode", 
          app.get('port'), 
          app.get('env')
      );
  });
});