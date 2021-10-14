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
server.listen(process.env.PORT || 8080);

console.log('Server started on port 8080');

var Room = function(code, type) {
    this.code = code;
    this.type = type;
    this.members = [];
};

Room.prototype.addMember = function(user, client) {
    for (var m in this.members) {
        if (this.members[m][0] === user) {
            return;
        }
    }
    this.members.push([user, client]);
};

Room.prototype.removeMember = function(user) {
    for (var m in this.members) {
        if (this.members[m][0] === user) {
            this.members.splice(m, 1);
			break;
        }
    }
	if (this.members.length === 0) {
		var rmn = getRoom(this.code);
		rooms.splice(rmn, 1);
		return false;
	}
	return true;
};

Room.prototype.removeClient = function(client) {
    for (var m in this.members) {
        if (this.members[m][1] === client) {
            this.members.splice(m, 1);
			break;
        }
    }
	if (this.members.length === 0) {
		var rmn = getRoom(this.code);
		rooms.splice(rmn, 1);
		return false;
	}
	return true;
};

Room.prototype.getMember = function(user) {
	for (var m in this.members) {
		if (this.members[m][0] === user) {
			return m;
		}
	}
	return -1;
};

Room.prototype.numMem = function() {
    return this.members.length;
};

var maxMembers = {
    Bingo: 10,
    Magic: 5,
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
  
  //console.log(pathname);
  
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
				// If so, check if a member of the same name is in the room
				var memberNum = rooms[roomNum].getMember(data.user);
				if (memberNum === -1) {
					// If not, check if there are fewer than the max number of members
				    //if (rooms[roomNum].numMem < maxMembers[rooms[roomNum].type]) {
				        //If not, join the room
    					socket.join(data.code);
    					rooms[roomNum].addMember(data.user);
    					console.log(rooms[roomNum]);
    					var outData = rooms[roomNum];
    					outData.num = roomNum;
    					outData.user = data.user;
    					socket.emit('joinSuccess', outData);
    					console.log("Client " + socket.id + " (username " + data.user + ") successfully joined room " + data.code);
    					console.log(rooms);
    					io.in(data.rm).emit('memberRefresh', rooms[roomNum]);
				    //} else {
				    //    //If so, return an error
				    //    socket.emit('joinFailMax', data);
				    //    console.log("Client " + socket.id + " failed to join room " + data.code + ": Max Members Reached");
				    //}
				} else {
					// If so, return an error
					socket.emit('joinFailName', data);
					console.log("Client " + socket.id + " failed to join room " + data.code + ": Same Username as Member");
				}
			} else {
				// If not, return an error
				socket.emit('joinFailCode', data);
				console.log("Client " + socket.id + " failed to join room " + data.code + ": Bad Room Code");
			}
			
			// This is a way to send to everyone including sender
			// io.sockets.emit('message', "this goes to everyone");
	
		}
    );
	
	// Catch a 'createRoom' event
	socket.on('createRoom',
		function(data) {
			// Log attempt
			console.log("Received: client " + socket.id + " -- 'createRoom' " + data.type + " " + data.code);
			
			// Check if a room with the code exists
			var roomNum = getRoom(data.code);
			if (roomNum === -1) {
				// If not, create one
				socket.join(data.code);
				rooms.push(new Room(data.code, data.type));
				rooms[rooms.length-1].addMember(data.user, socket.id);
				var outData = rooms[rooms.length-1];
				outData.num = rooms.length-1;
				outData.user = data.user;
				socket.emit('createSuccess', outData);
				io.in(data.rm).emit('memberRefresh', rooms[rooms.length-1]);
				console.log("Client " + socket.id + " (username " + data.user + ") successfully created room " + data.code);
				console.log(rooms);
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
			
			console.log(rooms[data.rmn].members);
			
			
			// Emit response
			io.in(data.rm).emit('memberRefresh', rooms[data.rmn]);
		}
	);
	
	// Catch a 'syncReq' event
	socket.on('syncReq',
		function(data) {
			// Log request
			console.log("Received: client " + socket.id + " -- 'syncReq' " + data.rm);
			
			//console.log(data);
			
			// Emit response
			socket.in(data.rm).emit('syncAnswer', data);
		}
	);
	
	// Catch a 'leaveReq' event
	socket.on('leaveReq',
		function(data) {
			// Log request
			console.log("Received: client " + socket.id + " -- 'leaveReq' " + data.rm);
			
			// Remove the member from the room and send a 'memberRefresh' event to everyone else
			rooms[data.rmn].removeMember(data.user);
			socket.leave(data.rm);
			io.in(data.rm).emit('memberRefresh', rooms[data.rmn]);
			
			// Emit response
			socket.emit('leaveRoom', data);
		}
	);
    
	// Catch a 'diconnect' event
    socket.on('disconnect', function() {
        console.log("Client " + socket.id + " has disconnected");
        var ri = 0;
        while (ri < rooms.length) {
            var stillExists = rooms[ri].removeClient(socket.id);
            if (stillExists) {
                ++ri;
            }
        }
    });
  }
);
