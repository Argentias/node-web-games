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
	var members = [];
	var VIP = false;
	var room="NULL"; var roomNum=-1;
	var roomData = {
		rm: room,
		rmn: roomNum
	};
	var roomW = 1280;
	var roomH = 860;
	
	// Create the canvas and setup socket callbacks
    this.setup = function() {
    //function setup() {
        createCanvas(1280, 860);
		
		socket.on('memberRefresh',
			function(data) {
				members = data.members;
				if (members[0] === username) {
					VIP = true;
				} else {
					VIP = false;
				}
			}
		);
		
		socket.on('syncAnswer',
			function(data) {
			    /*
				toCall.cloneGen(data.toCallDeck);
				called.cloneGen(data.calledDeck);
				//console.log(data);
				*/
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
	
    // Create the hand Deck and the caller Decks
    var player = new MagicPlayer(true, 25);
    player.hand.add(new SpellCard("", "", ""));
    player.hand.add(new SpellCard("Shock", "NRR", "Deal 2 damage to any opponent", true));
    player.hand.addUp(new SpellCard("Gods Willing", "NRBGWU", "Cantrip. Target enchantment you control gains protection until end of turn."));
    var selfX = roomW/50;
    var selfY = roomH-(roomH/6);
    var lifeUp = player.genLifePlus(selfX, selfY);
    var lifeDown = player.genLifeMinus(selfX, selfY);
    console.log(player);
    console.log(lifeUp);
    console.log(lifeDown);
    
    var player2 = new MagicPlayer(false, 25);
    
    function syncBoardState() {
        var selfInMem = -1;
        for (var i = 0; i < members.length; ++i) {
            
        }
    }
	
	
	
    // Create a RectClickArea to call the next card
    var caller = new RectClickArea(290, 200, 160, 50);
    
	// Create a RectClickArea to refresh a board
	var refresher = new RectClickArea(290, 270, 160, 50);
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
			rm: room,
			rmn: roomNum,
			toCallDeck: toCall,
			calledDeck: called
		};
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
		};
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
	};
	
	// Leave the room
	var leaveRoom = function() {
		var ldata = {
			rm: room,
			rmn: roomNum,
			user: username
		};
		socket.emit('leaveReq', ldata);
	};
	*/
	
    // Draw everything
    this.draw = function() {
    //function draw() {
        background(125);
        
        player.draw(roomW/50, roomH-roomH/6);
        player2.draw(roomW/50, roomH/10);
        /*
        for (var i = 0; i < hands.length; ++ i) {
            //hands[i].drawHandUpDownSmall(clicks[i].x, clicks[i].y, false);
			hands[i].drawGen(clicks[i].x, clicks[i].y, "Hand UpDown Small");
        }
        toCall.drawDown(30, 30, false);
        called.drawHand(175, 30);
        */
        
        fill(255);
		/*
		if (callerUser) {
			rect(restarter.x, restarter.y, restarter.w, restarter.h, 5);
		}
		*/
		rect(lifeUp.x, lifeUp.y, lifeUp.w, lifeUp.h, 5);
		rect(lifeDown.x, lifeDown.y, lifeDown.w, lifeDown.h, 5);
		rect(caller.x, caller.y, caller.w, caller.h, 5);
		rect(refresher.x, refresher.y, refresher.w, refresher.h, 5);
		//rect(leaver.x, leaver.y, leaver.w, leaver.h, 5);
		
        fill(0);
		/*
		if (callerUser) {
			textSize(28);
			text("New Game", restarter.x+restarter.w/2-textWidth("New Game")/2, restarter.y+35);
		}
		*/
		textSize(36);
		lifeUp.draw("+");
		lifeDown.draw("-");
		textSize(28);
		//text("Turn Void", caller.x+caller.w/2-textWidth("Turn Void`")/2, caller.y+37);
		//text("Add Mana", refresher.x+refresher.w/2-textWidth("Add Mana")/2, refresher.y+35);
		caller.draw("Null to Void");
		refresher.draw("Add Mana");
		
		//text("Leave Room", leaver.x+leaver.w/2-textWidth("Leave Room")/2, leaver.y+35);
		
		textSize(24);
		text("Room code: " + room, roomW-300, 50);
		textSize(20);
		text("Users in room: ", roomW-300, 90);
		for (var m = 0; m < members.length; ++ m) {
			if (m === 0) {
				text(members[m] + " [VIP]", roomW-300, 130);
			} else {
				text(members[m], roomW-300, 130 + (25 * m));
			}
		}
		
    };
    
    var alreadyClicked = false;
    function resetClick() {
        alreadyClicked = true;
    }
    // When a card is clicked
    this.mouseClicked = function() {
    //function mouseClicked() {
        if (alreadyClicked === false) {
            alreadyClicked = true;
            
            console.log("Clicky clicky");
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
            
            if (caller.clickCheck()) {
                console.log("Clicked Change");
                player.mana.change("N", "W");
            }
            
            if (refresher.clickCheck()) {
                console.log("Clicked Mana");
                player.mana.N.add(new ManaCard());
            }
            if (lifeUp.clickCheck()) {
                player.life.increment();
            }
            if (lifeDown.clickCheck()) {
                player.life.decrement();
            }
            /*
    		
    		if (leaver.clickCheck()) {
    			leaveRoom();
    			//console.log("leaveRoom");
    		}
    		*/
    		window.setTimeout(resetClick, 100);
        }
		return false;
    };
    
    
    this.keyPressed = function() {
        if (key === 'q') {
            player.life.increment();
        }
        if (key === 'a') {
            player.life.decrement();
        }
    };
}
