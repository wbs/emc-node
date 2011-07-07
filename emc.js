// npm install socket.io
// npm install redis
var http = require('http'), 
io = require('socket.io'),
redis = require('redis'),
rc = redis.createClient();

io.configure('production', function(){
	io.enable('browser client etag');
	io.set('log level', 1);
	
	io.set('transports', [
	  'websocket'
	, 'flashsocket'
	, 'htmlfile'
	, 'xhr-polling'
	, 'jsonp-polling'
	]);
});

// if redis blows up on us, catch the error
// and reconnect automagically, which fires 'connect', which subscribes
// to our channels. meaning: no failures. ever.
rc.on("error", function (err) {
    console.log("Error " + err);
});

// if the redis server emits a connect event, it means we're ready to work
// which in turn means we should subscribe to our channels. Which we will.
rc.on("connect", function() {
	rc.subscribe("chat");
	rc.subscribe("announcements");
	rc.subscribe("questions");
});

// regular server
server = http.createServer(function(req, res){ 
	// we may want to redirect a client that hits this page
	// to the chat URL instead
	res.writeHead(200, {'Content-Type': 'text/html'}); 
	res.end('<h1>Hello world</h1>'); 
});

// setup our server to listen on 8000 and serve socket.io
server.listen(8000);
var socket = io.listen(server); 

// when we get a message in one of the channels we're subscribed to
// we send it over to all connected clients
rc.on("message", function (channel, message) {
	//console.log("Sending: " + message);
	socket.sockets.emit('message', message);
})

// so now, for every client that connects to node
// though whatever transport (flash, websockets, polling)
socket.sockets.on('connection', function(client) { 
 	client.on('message', function() { 
 		// nothin'
 	}), 
 
 	client.on('disconnect', function() {
 		// nothin'
 	})
});