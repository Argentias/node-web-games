// declare global variables here
var username;
var nameEntered = false;
var smgr;
var room = "";
var roomNum = -1;
var homeerrmsg = "";
var homeerrmsgcount = 0;
var members = [];

let socket;

function setup() {
    createCanvas(680, 680);
    
    // SceneManager
    smgr = new SceneManager();
    smgr.wire();
    
    // Username setting
    nameIn = createInput();
    nameIn.position(20, 20);
    nameIn.style("width", "200px");
    
    nameSet = createButton("Set Username");
    nameSet.position(70, 50);
    nameSet.mousePressed(setUsername);
    
    // Room join/creation
    roomIn = createInput();
    roomIn.position(250, 20);
    roomIn.style("width", "200px");
    roomIn.hide();
    
    roomType = createSelect();
    roomType.position(500, 20);
    roomType.size(90);
    roomType.option("Bingo");
    roomType.hide();
    
    roomJoin = createButton("Join Room");
    roomJoin.position(310, 50);
    roomJoin.mousePressed(joinRoom);
    roomJoin.hide();
    
    roomCreate = createButton("Create Room");
    roomCreate.position(500, 50);
    roomCreate.mousePressed(createRoom);
    roomCreate.hide();
    
    // socket and callbacks
    socket = io.connect();
    
    socket.on('joinFailCode',
        function(data) {
            homeerrmsg = "No room named " + data.code + " exists.";
            homeerrmsgcount = 300;
        }
    );
	
	socket.on('joinFailName',
        function(data) {
            homeerrmsg = "Room " + data.code + " already has a user with \nusername " + data.user + ". \nPlase change your username.";
            homeerrmsgcount = 300;
        }
    );
	
	socket.on('joinSuccess', 
		function(data) {
			hideHome();
			roomNum = data.num;
			room = data.code;
			if (data.type === "Bingo") {
				smgr.showScene(Bingo);
			}
		}
	);
	
	socket.on('createFail',
		function(data) {
			homeerrmsg = "Room named " + data.code + " already exists.";
			homeerrmsgcount = 300;
		}
	);
	
	socket.on('createSuccess', 
		function(data) {
			hideHome();
			roomNum = data.num;
			room = data.code;
			if (data.type === "Bingo") {
				smgr.showScene(Bingo);
			}
		}
	);
	
	socket.on('memberRefresh', 
		function(data) {
			members = data.members;
		}
	);
}

function hideHome() {
	nameIn.hide();
	nameSet.hide();
	roomIn.hide();
	roomType.hide();
	roomJoin.hide();
	roomCreate.hide();
}

function showHome() {
	nameIn.show();
	nameSet.show();
	roomIn.show();
	roomType.show();
	roomJoin.show();
	roomCreate.show();
}

function setUsername() {
    username = nameIn.value();
    nameEntered = true;
    smgr.showScene(Home);
}

function joinRoom() {
	var rcode = roomIn.value();
	if (rcode !== "") {
		data = {
			code: rcode,
			user: username
		};
		socket.emit('joinRoom', data);
	} else {
		homeerrmsg = "Please enter a room code.";
		homeerrmsgcount = 300;
	}
}

function createRoom() {
	var rcode = roomIn.value();
	if (rcode !== "") {
		data = {
			code: rcode,
			type: roomType.value(),
			user: username
		};
		socket.emit('createRoom', data);
	} else {
		homeerrmsg = "Please enter a room code.";
		homeerrmsgcount = 300;
	}
}

function draw() {
    smgr.draw();
}

function mousePressed() {
    smgr.handleEvent("mousePressed");
}

/*
function keyPressed() {
    smgr.handleEvent("keyPressed");
}
//*/

var sdata;

function Home() {
    this.setup = function() {
        roomIn.show();
        roomType.show();
        roomJoin.show();
        roomCreate.show();
    };
    
    this.draw = function() {
        background(255);
        
        textSize(20);
        text("Your username is: " + username, 20, 120);
        
        if (homeerrmsgcount !== 0) {
            text(homeerrmsg, 300, 120);
            -- homeerrmsgcount;
        }
    };
}