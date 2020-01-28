// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html


// HTTP Portion
var http = require('http');
// URL module
var url = require('url');
var path = require('path');

// Using the filesystem module
var fs = require('fs');

var server = http.createServer(handleRequest);
server.listen(8080);

console.log('Server started on port 8080');

var Room = function(code, type) {
    this.code = code;
    this.type = type;
    this.members = [];
};

Room.prototype.addMember = function(user) {
    for (var m in this.members) {
        if (this.members[m] === user) {
            return;
        }
    }
    this.members.push(user);
};

Room.prototype.removeMember = function(user) {
    for (var m in this.members) {
        if (this.members[m] === user) {
            members.splice(m, 1);
        }
    }
};

var rooms = [];

function getRoom(rcode) {
    for (var r in rooms) {
        if (rooms[r].code === rcode) {
            return r;
        }
    }
    return -1;
}

function handleRequest(req, res) {
  // What did we request?
  var pathname = req.url;
  
  // If blank let's ask for home.html
  if (pathname == '/') {
    pathname = '/home.html';
  }
  
  // Ok what's our file extension
  var ext = path.extname(pathname);

  // Map extension to file type
  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
  };

  // What is it?  Default to plain text
  var contentType = typeExt[ext] || 'text/plain';

  // User file system module
  fs.readFile(__dirname + pathname,
    // Callback function for reading
    function (err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200,{ 'Content-Type': contentType });
      res.end(data);
    }
  );
}


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
  
    console.log("We have a new client: " + socket.id);
  
    // When this user emits, client side: socket.emit('otherevent',some data);
	
	// Catch a 'joinRoom' event
    socket.on('joinRoom',
		function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: client " + socket.id + " -- 'joinRoom' " + data.code);
		
			// Check if a room with the code exists
			var roomNum = getRoom(data.code);
			if (roomNum !== -1) {
				// If so, join it
				socket.join(data.code);
				rooms[roomNum].addMember(data.user);
				var outData = rooms[roomNum];
				outData.num = roomNum;
				socket.emit('joinSuccess', outData);
				console.log("Client " + socket.id + " successfully joined room " + data.code);
			} else {
				// If not, return an error
				socket.emit('joinFail', data);
				console.log("Client " + socket.id + " failed to join room " + data.code);
			}
			
			// This is a way to send to everyone including sender
			// io.sockets.emit('message', "this goes to everyone");
	
		}
    );
	
	// Catch a 'createRoom' event
	socket.on('createRoom', 
		function(data) {
			// Log attempt
			console.log("Received: client " + socket.id + " -- 'createRoom' " + data.code);
			
			// Check if a room with the code exists
			var roomNum = getRoom(data.code);
			if (roomNum === -1) {
				// If not, create one
				socket.join(data.code);
				rooms.push(new Room(data.code, data.type));
				rooms[rooms.length-1].addMember(data.user);
				var outData = rooms[rooms.length-1];
				outData.num = rooms.length-1;
				socket.emit('createSuccess', outData);
				console.log("Client " + socket.id + " successfully created room " + data.code);
			} else {
				// If so, return an error
				socket.emit('createFail', data);
				console.log("Client " + socket.id + " failed to create room " + data.code);
			}
		}
	);
	
	// Catch a 'refreshReq' event
	socket.on('refreshReq', 
		function(data) {
			// Log request
			console.log("Received: client " + socket.id + " -- 'refreshReq' " + data.rm);
			
			//console.log(rooms[data.rmn].members);
			
			// Emit response
			io.in(data.rm).emit('memberRefresh', rooms[data.rmn]);
		}
	);
	
	// Catch a 'callSyncReq' event
	socket.on('callSyncReq', 
		function(data) {
			// Log request
			console.log("Received: client " + socket.id + " -- 'callSyncReq' " + data.rm);
			
			console.log(data);
			
			// Emit response
			socket.in(data.rm).emit('callDeckSync', data);
		}
	);
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);