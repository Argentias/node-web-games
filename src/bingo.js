function Bingo() {
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
	var members = [];
	var callerUser = false;
	var roomData = {
		rm: room,
		rmn: roomNum
	}
	
	// Create other variables
	var maxCallLength = 8;
	
    // Create the hand Deck and the caller Decks
    var handDeck = new Deck();
    handDeck.reload(true);
    var toCall = new Deck();
    var called = new Deck();
    called.clear();
	
    // Create the canvas and setup socket callbacks
    this.setup = function() {
        createCanvas(780, 620);
		
		socket.on('memberRefresh', 
			function(data) {
				members = data.members;
				if (members[0] === username) {
					callerUser = true;
				}
			}
		);
		
		socket.on('callDeckSync', 
			function(data) {
				toCall.cloneGen(data.toCallDeck);
				called.cloneGen(data.calledDeck);
				//console.log(data);
			}
		);
		
		socket.on('leaveRoom', 
			function(data) {
				room = "";
				roomNum = -1;
				showHome();
				smgr.showScene(Home);
			}
		);
    };
    
	socket.emit('refreshReq', roomData);
	
    // Create hands to deal the cards into
    var hands = [];
    for (var i = 0; i < 5; i ++) {
        hands.push(new Deck(0));
    }
    
    // Get the size of the full deck
    var fullSize = -1;
    
    // Shuffle the hand Deck and the toCall Deck
    handDeck.shuffle();
    toCall.shuffle();
    
    // Deal 5 cards each into the hands
    var divideDeck = function() {
        fullSize = handDeck.getLength();
        for (var i = 0; i < 5 * hands.length; i ++) {
            hands[i%hands.length].add(handDeck.remove(0));
        }
    };
    
    divideDeck();
    
    // Create six CardHandClickAreas for each of the three hands
    var clicks = [new CardHandClickArea(30, 200, "H", hands[0].deck.length, "S", 75),  
                  new CardHandClickArea(30, 275, "H", hands[1].deck.length, "S", 75),
                  new CardHandClickArea(30, 350, "H", hands[2].deck.length, "S", 75),
                  new CardHandClickArea(30, 425, "H", hands[3].deck.length, "S", 75),
                  new CardHandClickArea(30, 500, "H", hands[4].deck.length, "S", 75)];
    
    // Create a RectClickArea to call the next card
    var caller = new RectClickArea(290, 200, 160, 50);
    
    // Create a RectClickArea to start a new game
    var restarter = new RectClickArea(470, 200, 160, 50);
	
	// Create a RectClickArea to refresh a board
	var refresher = new RectClickArea(290, 270, 160, 50);
	
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
    
    // Cycle each pile
    var pileCycle = function() {
        for (var i = 0; i < piles.length; i ++) {
            if (hands[i].getLength() > 0) {
                hands[i].add(piles[i].remove(0));
                hands[i].deck[0].up = true;
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
			rm: room,
			rmn: roomNum,
			toCallDeck: toCall,
			calledDeck: called
		}
		socket.emit('callSyncReq', data);
    };
	
    // Start a new game
    var newGame = function() {
        toCall.reload();
        toCall.shuffle();
        called.clear();
		
		sdata = {
			rm: room,
			rmn: roomNum,
			toCallDeck: toCall,
			calledDeck: called
		}
		console.log(sdata);
		socket.emit('callSyncReq', sdata);
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
	}
	
	// Leave the room
	var leaveRoom = function() {
		var ldata = {
			rm: room,
			rmn: roomNum,
			user: username
		}
		socket.emit('leaveReq', ldata);
	}
	
    // Draw everything
    this.draw = function() {
        background(125);
        
        for (var i = 0; i < hands.length; ++ i) {
            hands[i].drawHandUpDownSmall(clicks[i].x, clicks[i].y, false);
        }
        toCall.drawDown(30, 30, false);
        called.drawHand(175, 30);
        
        fill(255);
		if (callerUser) {
			rect(caller.x, caller.y, caller.w, caller.h, 5);
			rect(restarter.x, restarter.y, restarter.w, restarter.h, 5);
		}
		rect(refresher.x, refresher.y, refresher.w, refresher.h, 5);
		rect(leaver.x, leaver.y, leaver.w, leaver.h, 5);
		
        fill(0);
		if (callerUser) {
			textSize(36);
			text("Call Next", caller.x+caller.w/2-textWidth("Call Next")/2, caller.y+37);
			textSize(28);
			text("New Game", restarter.x+restarter.w/2-textWidth("New Game")/2, restarter.y+35);
		}
		textSize(28);
		text("New Board", refresher.x+refresher.w/2-textWidth("New Board")/2, refresher.y+35);
		text("Leave Room", leaver.x+leaver.w/2-textWidth("Leave Room")/2, leaver.y+35);
		
		textSize(24);
		text("Room name: " + room, 300, 350);
		textSize(20);
		text("Users in room: ", 300, 385);
		for (var m = 0; m < members.length; ++ m) {
			if (m === 0) {
				text(members[m] + " [caller]", 300, 410)
			} else {
				text(members[m], 300, 410 + (25 * m));
			}
		}
    };
    
    // When a card is clicked
    this.mouseClicked = function() {
        // Loop through each click area
        for (var i = 0; i < clicks.length; i ++) {
            var cardClick = clicks[i].clickCheck();
            if (cardClick != -1) {
				var clickCard = hands[i].getCard(cardClick);
				//console.log(clickCard);
				checkFlip(clickCard);
            }
        }
        
        if (caller.clickCheck() && callerUser) {
            callCard();
        }
        
        if (restarter.clickCheck() && callerUser) {
            newGame();
        }
		
		if (refresher.clickCheck()) {
			newBoard();
		}
		
		if (leaver.clickCheck()) {
			leaveRoom();
			//console.log("leaveRoom");
		}
    }
}