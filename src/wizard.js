function Wizard() {
    // Check that components.js is available
    try { testForComponents() } catch(e) { throw "Library Exception: Module \"wizard\" requires library \"components\"."; }
    
    // Check that cardGameParts.js is available
    try { testForCardGameParts() } catch(e) { throw "Library Exception: Module \"wizard\" requires library \"cardGameParts\"."; }
    
    // Check that animationObjects.js is available
    //try { testForAnimationObjects() } catch(e) { throw "Library Exception: Module \"wizard\" requires library \"animationObjects\"."; }
    
    /*
    // Define Globals
    var Global = {};
    
    Global.members = [];
    Global.username = "ME";
    Global.room = "";
    Global.roomNum = -1;
    Global.socket;
    Global.smgr;
    var n = 0;
    Global.numM = 0;
    //*/
    
    // Create room variables
	Global.members = [];
	var VIP = false;
	var roomData = {};
	var roomW = 1280;
	var roomH = 860;
	
	// Track all players' board states
    var turnOrder = [];
    var playerTurn = -1;
    var dealer = -1;
    
    var player = new CardPlayer();
    var playerStates = [player];
    var better = new IncDec(0, 0, 0, 1);
    var betPlus = new RectClickArea(roomW-275, roomH-200, 40, 40);
    var betMins = new RectClickArea(roomW-275, roomH-150, 40, 40);
    
    // Create the deck
    var db = new DeckBuilder();
    db.config("Wizard");
    var deck = db.build();
    deck.shuffle();
    
    // Create game-playing variables
    var turnNum = -1;
    var wizardGameState = "before";
    var handSize = 20;
    var trick = new Trick();
    var trump = -1;
    
    // Create a Deck from which trump suit is chosen
    var tdeck = new Deck(true);
    tdeck.add(new Card(1, 0, true));
    tdeck.add(new Card(1, 1, true));
    tdeck.add(new Card(1, 2, true));
    tdeck.add(new Card(1, 3, true));
    var tpicker = new CardHandClickArea(300, 200, "H", tdeck.getLength(), "S", 75);
	
	// Create the canvas and setup socket callbacks
    this.setup = function() {
    //function setup() {
        createCanvas(roomW, roomH);
		Global.members.push(Global.username);
		
		//*
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
			    wizardGameState = data.state;
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
	    //*/
        startGame();
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
            syncTrick: trick,
            players: playerStates,
            turns: turnOrder,
            state: wizardGameState,
            pturn: playerTurn,
            begin: b
        };
        Global.socket.emit('syncReq', outData);
    }
    
    // Start a game
    function startGame() {
        // Create a copy of Global.members to store the turn order
        for (var m in Global.members) {
            turnOrder.push(Global.members[m]);//[0]);
        }
        turnOrder = randomizeArray(turnOrder);
        console.log(turnOrder);
        
        // Create a CardPlayer for each player
        playerStates = [];
        for (var t in turnOrder) {
            playerStates.push(new CardPlayer());
        }
        
        // Create the trick pile
        trick = new Trick();
        
        // Separate self
        var s = getSelfInTurn();
        //console.log(s);
        player = playerStates[s];
        
        // Reset the deck
        deck = db.build();
        deck.shuffle();
        
        // Deal hands
        dealHands();
        
        // Set the turn and state
        playerTurn = 0;
        wizardGameState = "betting";
        
        // Set trump suit
        setTrump();
        syncBoardState(true);
    }
	
	// Deal hands to each player
	function dealHands() {
	    loopN(handSize, () => {
	        for (var s in playerStates) {
	            //console.log(s)
	            playerStates[s].add(deck.remove());
	        }
	    });
	    for (var s in playerStates) {
	        playerStates[s].sort();
	    }
	}
	
	// Set the trump suit
	function setTrump() {
	    var trumpCard = deck.remove();
        if (trumpCard === null || trumpCard.getRank() === 0) {
            trump = 4;
        } else if (trumpCard.getRank() === 14) {
            dealerTrump = true;
            wizardGameState = "trump";
        } else {
            trump = trumpCard.getSuit();
        }
	}
	
	// Start your turn
	function startTurn() {
	    if (wizardGameState === "playing" && hand.getLength() === 0) {
	        // Score and set up the next round
	    } else if (wizardGameState === "betting" && player.bet != -1) {
	        // Betting has ended, move on to playing
	    }
	    syncBoardState(false);
	}
	
	// Pass to the next player's turn
	function passTurn() {
	    if (wizardGameState === "betting") {
	        better = new IncDec(0, 0, handSize, 1);
	    }
	    
	    playerTurn = ++playerTurn%turnOrder.length;
	    syncBoardState(true);
	}
	
	
    // Create a RectClickArea to start the game
    var starter = new RectClickArea(roomW-300, 50, 160, 50);
    
	// Create a RectClickArea to pass the turn
	var passer = new RectClickArea(roomW-250, roomH-100, 100, 50);

    this.draw = function() {
    //function draw() {
        background(125);
        
        // Draw self state
        var s = getSelfInTurn();
        player.draw(roomW/50, roomH-roomH/4, true, (s === playerTurn));
        
        // Draw other players' states
        var tl = turnOrder.length;
        if (wizardGameState != "begin") {
            for (var i = 1; i < tl; ++i) {
                playerStates[(s+i)%tl].draw(roomW/50, roomH/10+200*(i-1), false, (i === playerTurn));
            }
        }
        
        // Draw the picking of the trump suit
        if (wizardGameState === "trump") {
            var trumptext = "Dealer is picking a trump suit...";
            if (s === playerTurn) {
                trumptext = "Pick a trump suit:";
                tdeck.drawGen(tpicker.x, tpicker.y, "Hand Up Small");
            }
            text(trumptext, tpicker.x, tpicker.y-40)
        }
        
        // Draw the betting
        if (wizardGameState === "betting") {
            text("Betting in progress...\nUse controls in the lower-right", 350, 200);
            text("Bet: "+better.getVal(), roomW-200, roomH-150);
            betPlus.draw("+");
            betMins.draw("-");
            passer.draw("Set Bet");
        }
        
        // Draw the trump suit
        text("Trump Suit:", 320, 50);
        drawSuit(trump, 320 + textWidth("Trump Suit:")+10, 25, 50);
        
        // Draw the trick pile
        trick.drawGen(500, 350, "Hand Up");
        
    };
    
    this.mouseClicked = function() {
    //function mouseClicked() {
        var s = getSelfInTurn();
        
        // Check for trump picking
        if (s === playerTurn && wizardGameState === "trump") {
            var t = tpicker.clickCheck();
            if (t != -1) {
                trump = t;
                wizardGameState = "betting"
                passTurn();
            }
        }
        
        // Check for betting
        else if (wizardGameState === "betting") {
            if (betPlus.clickCheck()) {
                better.increment();
            } else if (betMins.clickCheck()) {
                better.decrement();
            }
            if (s === playerTurn && passer.clickCheck()) {
                passTurn();
            }
        }
        
        // Check for plays
        else if (s === playerTurn && wizardGameState === "playing") {
            var played = player.play(trick);
            if (played) {
                passTurn();
            }
        }
    };
}