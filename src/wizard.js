function Wizard() {
    // Variable for checking libraries
    var libs = true;
    
    // Check that components.js is available
    try { testForComponents() } catch(e) { libs = false; }
    
    // Check that cardGameParts.js is available
    try { testForCardGameParts() } catch(e) { libs = false; }
    
    // Check that animationObjects.js is available
    //try { testForAnimationObjects() } catch(e) { libs = false; }
    
    // Throw error if libraries are not available
    if (libs === false) {
        throw "Library Exception: You are not accessing all necessary libraries.";
    }
    
	// Create room variables
	 // Create room variables
	Global.members = [];
	var VIP = false;
	var roomData = {};
	var roomW = 1280;
	var roomH = 860;
	
	// Track all players' board states
    var turnOrder = [];
    var playerTurn = -1;
    var playerStates = [player];
    
    // Create the deck
    var deck = new Deck(/*empty:bool*/false, /*wizard:bool*/true);
    deck.shuffle();
    
    // Create game-playing variables
    var turnNum = -1;
    var wizardGameStarted = false;
    var handSize = 1;
	
	// Create the canvas and setup socket callbacks
    this.setup = function() {
    //function setup() {
        createCanvas(roomW, roomH);
		//Global.members.push(Global.username);
		
		Global.socket.on('refreshAns',
			function(data) {
				Global.members = data.members;
				if (Global.members[0] === Global.username) {
					VIP = true;
				} else {
					VIP = false;
				}
			}
		);
		
		Global.socket.on('syncAnswer',
			function(data) {
			    wizardGameStarted = data.started;
                playerStates = data.players;
                turnOrder = data.turns;
			    var s = getSelfInTurn();
                player = data.players[s];
                deck = data.syncDeck;
                playerTurn = data.pturn;
                if (playerTurn === s && data.begin) {
                    startTurn();
                }
			}
		);
		
		Global.socket.on('leaveRoom',
			function(data) {
				Global.room = "";
				Global.roomNum = -1;
				showHome();
				Global.smgr.showScene(Home);
			}
		);
		
		roomData = {
		    rm: Global.room,
		    rmn: Global.roomNum
	    };
		
	    Global.socket.emit('refreshReq', roomData);
    };
    
    // Find the index of yourself in the list of members
    function getSelfInMem() {
        for (var i = 0; i < Global.members.length; ++i) {
            if (Global.members[i] === Global.username) {
                return i;
            }
        }
        return -1;
    }
    
    // Find the index of yourself in the turn order
    function getSelfInTurn() {
        for (var i = 0; i < turnOrder.length; ++i) {
            if (turnOrder[i] === Global.username) {
                return i;
            }
        }
        return -1;
    }
    
    // Sync the board state with the other players (do after every move)
    function syncBoardState(beginTurn) {
        var i = getSelfInTurn();
        playerStates[i] = player;
        var b;
        if (arguments.length === 0) { b = false; } else { b = beginTurn; }
        var outData = {
            rm: Global.room,
            syncDeck: deck,
            players: playerStates,
            turns: turnOrder,
            started: wizardGameStarted,
            pturn: playerTurn,
            begin: b
        };
        Global.socket.emit('syncReq', outData);
    }
    
    // Start a game
    function startGame() {
        // Create a copy of Global.members to store the turn order
        for (var m in Global.members) {
            turnOrder.push(Global.members[m][0]);
        }
        turnOrder = randomizeArray(turnOrder);
        console.log(turnOrder);
        
        // Create a MagicPlayer for each player
        playerStates = [];
        for (var t in turnOrder) {
            playerStates.push(new MagicPlayer(false, 25));
        }
        
        // Separate self
        var s = getSelfInTurn();
        //console.log(s);
        //playerStates[s].setSelf(true);
        player = playerStates[s];
        
        // Reset the deck
        deck.reload(/*up:bool*/false, /*wizard:bool*/true);
        deck.shuffle();
        
        // Deal hands and start the game
        dealHands();
        wizardGameStarted = true;
        playerTurn = 0;
        syncBoardState(true);
    }
	
	// Deal hands to each player
	function dealHands() {
	    loopN(handSize, () => {
	        for (var s in playerStates) {
	            //console.log(s)
	            playerStates[s].hand.addUp(deck.remove());
	        }
	    });
	}
	
	// Start your turn
	function startTurn() {
	    //player.hand.addUp(deck.remove());
	    //loopN(2, player.mana.N.add(new ManaCard()));
	    syncBoardState(false);
	}
	
	// Pass to the next player's turn
	function passTurn() {
	    playerTurn = ++playerTurn%turnOrder.length;
	    syncBoardState(true);
	}
	
	
    // Create a RectClickArea to start the game
    var starter = new RectClickArea(roomW-300, 50, 160, 50);
    
	// Create a RectClickArea to pass the turn
	var passer = new RectClickArea(roomW-300, 50, 160, 50);

}