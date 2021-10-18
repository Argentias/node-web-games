function Magic() {
    // Variable for checking libraries
    var libs = true;
    
    // Check that components.js is available
    try { testForComponents() } catch(e) { libs = false; }
    
    // Check that cardGameParts.js is available
    try { testForCardGameParts() } catch(e) { libs = false; }
    
    // Check that magicCardParts.js is available
    try { testForMagicCardParts() } catch(e) { libs = false; }
    
    // Check that animationObjects.js is available
    //try { testForAnimationObjects() } catch(e) { libs = false; }
    
    // Throw error if libraries are not available
    if (libs === false) {
        throw "Library Exception: You are not accessing all necessary libraries.";
    }
    
    // Create room variables
	Global.members = [];
	var VIP = false;
	var roomData = {};
	var roomW = 1280;
	var roomH = 860;
    
    // Track the personal board state
    var player = new MagicPlayer(true, 25);
    //player.hand.add(new SpellCard("", "", ""));
    //player.hand.add(new SpellCard("Shock", "NRR", "Deal 2 damage to any opponent", true));
    //player.hand.addUp(new SpellCard("Gods Willing", "NRBGWU", "Cantrip. Target enchantment you control gains protection until end of turn."));
    
    // Define the location of the personal board state and life inc/dec buttons
    var selfX = roomW/50;
    var selfY = roomH-(roomH/6);
    var lifeUp = player.genLifePlus(selfX, selfY);
    var lifeDown = player.genLifeMinus(selfX, selfY);
    
    // Track all players' board states
    var turnOrder = [];
    var playerTurn = -1;
    var playerStates = [player];
    
    // Create the deck
    var deck = new SpellDeck();
    deck.instantiate();
    deck.shuffle();
    
    // Create game-playing variables
    var turnNum = -1;
    var magicGameStarted = false;
    var handSize = 5;
    var handLimit = 7;
    
    //var player2 = new MagicPlayer(false, 25);
	
	// Create the canvas and setup socket callbacks
    this.setup = function() {
    //function setup() {
        createCanvas(1280, 860);
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
			    mqgicGameStarted = data.started;
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
            started: magicGameStarted,
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
        deck.clear();
        deck.instantiate();
        deck.shuffle();
        
        // Deal hands and start the game
        dealHands();
        magicGameStarted = true;
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
	    player.hand.addUp(deck.remove());
	    loopN(2, player.mana.N.add(new ManaCard()));
	    syncBoardState(false);
	}
	
	// Pass to the next player's turn
	function passTurn() {
	    ++playerTurn;
	    if (playerTurn >= turnOrder.length) {
	        playerTurn -= turnOrder.length;
	    }
	    syncBoardState(true);
	}
	
	
    // Create a RectClickArea to start the game
    var starter = new RectClickArea(roomW-300, 50, 160, 50);
    
	// Create a RectClickArea to pass the turn
	var passer = new RectClickArea(roomW-300, 50, 160, 50);
	/*
	
	// Create a RectClickArea to leave the room
	var leaver = new RectClickArea(470, 270, 160, 50);
    
	// Check if the card can be flipped, and flip if so
    var checkFlip = function(card) {
        for (var i = 0; i < called.getLength(); ++ i) {
			//console.log(called.getCard(i));
			if (card.equals(called.getCard(i))) {
				card.setUp(false);
			}
		}
    };
    
    // Call the next card
    var callCard = function() {
        if (toCall.getLength() > 0) {
            called.add(toCall.remove(0));
            if (called.getLength() > maxCallLength) {
                called.remove(0);
            }
        }
		
		var data = {
			rm: Global.room,
			rmn: Global.roomNum,
			toCallDeck: toCall,
			calledDeck: called
		};
		Global.socket.emit('callSyncReq', data);
    };
	
    // Start a new game
    var newGame = function() {
        toCall.reload();
        toCall.shuffle();
        called.clear();
		
		sdata = {
			rm: Global.room,
			rmn: Global.roomNum,
			toCallDeck: toCall,
			calledDeck: called
		};
		console.log(sdata);
		Global.socket.emit('callSyncReq', sdata);
    };
	
	// Get a new board
	var newBoard = function() {
		for (var i = 0; i < hands.length; i ++) {
            hands[i].clear();
        }
        handDeck.reload(true);
        handDeck.shuffle();
		fullSize = handDeck.getLength();
		divideDeck();
	};
	
	// Leave the room
	var leaveRoom = function() {
		var ldata = {
			rm: Global.room,
			rmn: Global.roomNum,
			user: Global.username
		};
		Global.socket.emit('leaveReq', ldata);
	};
	*/
	
    // Draw everything
    this.draw = function() {
    //function draw() {
        background(125);
        
        player.draw(roomW/50, roomH-roomH/6, true);
        //player2.draw(roomW/50, roomH/10);
        
        var s = getSelfInTurn();
        var tl = turnOrder.length;
        if (magicGameStarted === true) {
            for (var i = 1; i < tl; ++i) {
                playerStates[(s+i)%tl].draw(roomW/50, roomH/10+200*(i-1), false);
            }
        }
        /*
        fill(255);
        
		if (callerUser) {
			rect(restarter.x, restarter.y, restarter.w, restarter.h, 5);
		}
		
		rect(lifeUp.x, lifeUp.y, lifeUp.w, lifeUp.h, 5);
		rect(lifeDown.x, lifeDown.y, lifeDown.w, lifeDown.h, 5);
		rect(caller.x, caller.y, caller.w, caller.h, 5);
		rect(refresher.x, refresher.y, refresher.w, refresher.h, 5);
		//rect(leaver.x, leaver.y, leaver.w, leaver.h, 5);
		
		if (callerUser) {
			textSize(28);
			text("New Game", restarter.x+restarter.w/2-textWidth("New Game")/2, restarter.y+35);
		}
		*/
        fill(0);
		textSize(28);
		if (!magicGameStarted) {
		    starter.draw("Start Game");
		} else {
		    if (s === playerTurn) {
		        passer.draw("Pass Turn");
    		}
    		textSize(36);
    		lifeUp.draw("+");
    		lifeDown.draw("-");
		}
		//text("Leave Room", leaver.x+leaver.w/2-textWidth("Leave Room")/2, leaver.y+35);
		
		textSize(24);
		text("Room code: " + Global.room, roomW-300, 250);
		textSize(20);
		text("Users in room: ", roomW-300, 290);
		for (var m = 0; m < Global.members.length; ++ m) {
		    memText = Global.members[m][0];
			if (m === 0) {
				memText = memText + " [VIP]";
			}
			text(memText, roomW-300, 330+(25*m));
		}
		
    };
    
    
    // When a card is clicked
    this.mouseClicked = function() {
    //function mouseClicked() {
        ++Global.numM;
        console.log("Clicky clicky " + Global.numM);
        //if (Global.numM % 2 === 0) { return false; }
        /*
        // Loop through each click area
        for (var i = 0; i < clicks.length; i ++) {
            var cardClick = clicks[i].clickCheck();
            if (cardClick != -1) {
				var clickCard = hands[i].getCard(cardClick);
				//console.log(clickCard);
				checkFlip(clickCard);
            }
        }
        */
        
        if (!magicGameStarted) {
            if (starter.clickCheck()) {
                //player.mana.change("N", "W");
                startGame();
            }
        } else {
            if (passer.clickCheck()) {
                //player.mana.N.add(new ManaCard());
                passTurn();
            }
            else if (lifeUp.clickCheck()) {
                player.life.increment();
                syncBoardState();
            }
            else if (lifeDown.clickCheck()) {
                player.life.decrement();
                syncBoardState();
            }
        }
        /*
		
		if (leaver.clickCheck()) {
			leaveRoom();
			//console.log("leaveRoom");
		}
		*/
		return false;
    };
    
    
    this.keyPressed = function() {
        if (key === 'q') {
            player.life.increment();
        }
        else if (key === 'a') {
            player.life.decrement();
        }
        return false;
    };
}
