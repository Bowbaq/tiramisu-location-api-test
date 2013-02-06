var express = require('express'),
  app = express(),
  server = require('http').createServer(app), 
  io = require('socket.io').listen(server),
  path = require('path'),
  
  display
;

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
  socket.on('join:display', function(){
    display = socket;
    display.on('disconnect', function(){
      display = null;
    });
  });
  
  socket.on('location', function (location) {
    if(display) {
      display.emit('location', location);
    }
  });
});

//======================================
//      start server
//======================================

server.listen(app.get('port'), function() {
    console.log(
        "Express server listening on port %d in %s mode", 
        app.get('port'), 
        app.get('env')
    );
});
