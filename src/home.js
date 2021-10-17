function Home() {
    
    // declare global variables here
    var nameEntered = false;
    var homeerrmsg = "";
    var homeerrmsgcount = 0;
    
    this.setup = function() {
        createCanvas(680, 680);
        
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
        //roomType.option("Bingo");
        roomType.option("Magic");
        roomType.hide();
        
        roomJoin = createButton("Join Room");
        roomJoin.position(310, 50);
        roomJoin.mousePressed(joinRoom);
        roomJoin.hide();
        
        roomCreate = createButton("Create Room");
        roomCreate.position(500, 50);
        roomCreate.mousePressed(createRoom);
        roomCreate.hide();
        
        Global.socket.on('joinFailCode',
            function(data) {
                homeerrmsg = "No room named " + data.code + " exists.";
                homeerrmsgcount = 300;
            }
        );
    	
    	Global.socket.on('joinFailName',
            function(data) {
                homeerrmsg = "Room " + data.code + " already has a user with \nusername " + data.user + ". \nPlease change your username.";
                homeerrmsgcount = 300;
            }
        );
        
        Global.socket.on('joinFailMax',
            function(data) {
                homeerrmsg = "Room " + data.code + " already has the maximum number of members in it. \nPlease join a different room.";
                homeerrmsgcount = 300;
            }
        );
    	
    	Global.socket.on('joinSuccess',
    		function(data) {
    			hideHome();
    			Global.roomNum = data.num;
    			Global.room = data.code;
    			//Global.username = data.user;
    			console.log("Joined room " + data.code + " (number " + data.num + ") as username " + Global.username);
    			if (data.type === "Bingo") {
    				//Global.smgr.showScene(Bingo);
    			} else if (data.type === "Magic") {
    			    Global.smgr.showScene(Magic);
    			}
    		}
    	);
    	
    	Global.socket.on('createFail',
    		function(data) {
    			homeerrmsg = "Room named " + data.code + " already exists.";
    			homeerrmsgcount = 300;
    		}
    	);
    	
    	Global.socket.on('createSuccess',
    		function(data) {
    			hideHome();
    			Global.roomNum = data.num;
    			Global.room = data.code;
    			//Global.username = data.user;
    			//console.log("Created room " + data.code + " (number " + data.num + ") under username " + data.user);
    			console.log("Created room " + Global.room + " (number " + Global.roomNum + ") under username " + Global.username);
    			if (data.type === "Bingo") {
    				//Global.smgr.showScene(Bingo);
    			} else if (data.type === "Magic") {
    			    Global.smgr.showScene(Magic);
    			}
    		}
    	);
    	
    	Global.socket.on('memberRefresh',
    		function(data) {
    			Global.members = data.members;
    		}
    	);
    };
    
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
        Global.username = nameIn.value();
        nameEntered = true;
        showHome();
    }
    
    function joinRoom() {
    	var rcode = roomIn.value();
    	if (rcode !== "") {
    		data = {
    			code: rcode,
    			user: Global.username
    		};
    		console.log("sent join under name " + data.user);
    		Global.socket.emit('joinRoom', data);
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
    			user: Global.username
    		};
    		console.log("set create under name " + data.user);
    		Global.socket.emit('createRoom', data);
    	} else {
    		homeerrmsg = "Please enter a room code.";
    		homeerrmsgcount = 300;
    	}
    }
    
    this.draw = function() {
        background(255);
        
        textSize(20);
        var userText;
        if (Global.username === "") {
            userText = "Please set a username.";
        } else {
            userText = "Your username is: " + Global.username;
        }
        text(userText, 20, 120);
        
        if (homeerrmsgcount !== 0) {
            text(homeerrmsg, 300, 120);
            -- homeerrmsgcount;
        }
    };

}