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

// Create the canvas
function setup() {
    // put setup code here
    createCanvas(480, 620);
}

// Create the hand Deck and the caller Decks
var handDeck = new Deck();
handDeck.reload(true);
var toCall = new Deck();
var called = new Deck();
called.clear();

// Create hands to deal the cards into
var hands = [];
for (var i = 0; i < 5; i ++) {
    hands.push(new Deck(0));
}

// Create two placeholder variables to hold the piles
//    we need to compare later in the game
var first = null;
var second = null;

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

//var cardAni = new AniObj()

// Create six CardHandClickAreas for each of the three hands
var clicks = [new CardHandClickArea(30, 200, "H", hands[0].deck.length, "S", 75),  
              new CardHandClickArea(30, 275, "H", hands[1].deck.length, "S", 75),
              new CardHandClickArea(30, 350, "H", hands[2].deck.length, "S", 75),
              new CardHandClickArea(30, 425, "H", hands[3].deck.length, "S", 75),
              new CardHandClickArea(30, 500, "H", hands[4].deck.length, "S", 75)];

// Create a RectClickArea to call the next card
var caller = new RectClickArea(290, 350, 160, 50);

// Create a RectClickArea to start a new game
var restarter = new RectClickArea(290, 420, 160, 50);

// Compare the two selected cards
var checkPair = function() {
    var card1 = piles[firstPile].getTop();
    var card2 = piles[secondPile].getTop();
    var dist = card1.rank - card2.rank;
    if ( !(card1.equals(card2)) &&
         ((card1.rank       === card2.rank       && card1.getColor() !== card2.getColor()) || 
          (card1.getColor() === card2.getColor() && (dist === -1 ||  dist === 1)         ) )) {
        piles[firstPile].remove(0);
        piles[secondPile].remove(0);
    }
    first = null;
    second = null;
};

var checkDown = function() {
    
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
        if (called.getLength() > 5) {
            called.remove(0);
        }
    }
};

// Start a new game
var newGame = function() {
    for (var i = 0; i < hands.length; i ++) {
        hands[i].clear();
    }
    handDeck.reload(true);
    handDeck.shuffle();
    toCall.reload();
    toCall.shuffle();
    called.clear();
    fullSize = handDeck.getLength();
    divideDeck();
};

// Draw everything
function draw() {
    background(125);
    
    /*/
    pile1.draw(click1.x, click1.y);
    pile2.draw(click2.x, click2.y);
    pile3.draw(click3.x, click3.y);
    pile4.draw(click4.x, click4.y);
    pile5.draw(click5.x, click5.y);
    pile6.draw(click6.x, click6.y);
    //*/
    for (var i = 0; i < hands.length; i ++) {
        hands[i].drawHandUpDownSmall(clicks[i].x, clicks[i].y, false);
    }
    toCall.drawDown(30, 30, false);
    called.drawHand(175, 30);
    
    fill(255);
    rect(caller.x, caller.y, caller.w, caller.h, 5);
    rect(restarter.x, restarter.y, restarter.w, restarter.h, 5);
    fill(0);
    textSize(36);
    text("Call Next", caller.x+caller.w/2-textWidth("Call Next")/2, caller.y+37);
    textSize(28);
    text("New Game", restarter.x+restarter.w/2-textWidth("New Game")/2, restarter.y+35);
}

// When a card is clicked
function mouseClicked() {
    // Loop through each click area
    for (var i = 0; i < clicks.length; i ++) {
        var cardClick = clicks[i].clickCheck();
        if (cardClick != -1) {
            hands[i].setDown(cardClick);
        }
    }
    
    if (caller.clickCheck()) {
        callCard();
    }
    
    if (restarter.clickCheck()) {
        newGame();
    }
}