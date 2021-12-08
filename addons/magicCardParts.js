var testForMagicCardParts = function() { return true; };

try { testForComponents() } catch(e) { throw "Library Exception: Module 'magicCardParts' requires module 'components'" }

//new p5();

var mCardWidth = 100;
var mCardHeight = 150;
var mCardWidthS = 40;
var mCardHeightS = 70;
var mcHorzSpace = 45;
var mcVertSpace = 75;
var rand = function() { return random() };

function setup() {
    rand = function() { return random() };
}

function drawMagicCardBack(x, y, size) {
    var w = mCardWidth*size;
    var h = mCardHeight*size;
    
    fill(200, 150, 0);
    stroke(0);
    rect(x, y, w, h, 10);
    fill(0);
    stroke(255);
    for (var i = w/4; i < w; i += w/4) {
        line(x+i, y, x, y+i);
        line(x+w-i, y, x+w, y+i);
        line(x+i, y+h, x, y+h-i);
        line(x+w-i, y+h, x+w, y+h-i);
    }
    stroke(0);
    strokeWeight(2);
    noFill();
    rect(x, y, w, h, 10);
}


// Alternate Mana Names:        ["Null", "Chaos",      "Void",   "Structure", "Disruption", "Time"]
var ManaType = createNestedEnum(["Null", "Aggression", "Apathy", "Stability", "Disruption", "Continuity"],
                          ["Color", "Alias", "RGB"],
                          [["None", "Red", "Black", "Green", "White", "Blue"],
                           ["N", "R", "B", "G", "W", "U"],
                           [[105, 105, 105], [255, 0, 0], [0, 0, 0], [0, 255, 0], [255, 255, 255], [0, 0, 255]]]);

//console.log(ManaType);

var ManaCard = function(attribute) {
    if (arguments.length === 0) {
        this.attribute = ManaType.Null;
    } else {
        var variant = enumHas(ManaType, attribute);
        if (variant === null) {
            throw ("Invalid Value Exception: " + attribute + " is not associated with a ManaType");
        }
        this.attribute = variant;
    }
};

ManaCard.prototype.clone = function(that) {
    this.attribute = that.attribute;
};



var ManaDeck = function(attribute) {
    this.attribute = enumHas(ManaType, attribute);
    if (attribute === null) {
        throw ("Invalid Value Exception: " + attribute + " is not associated with a ManaType");
    }
    this.deck = [];
};

ManaDeck.prototype.length = function() {
    return this.deck.length;
};

ManaDeck.prototype.add = function(/*ManaCard*/card) {
    if (this.attribute.val != card.attribute.val) {
        throw ("Type Mismatch Exception: Found " + card.attribute.val + "; Expected " + this.attribute.val);
    }
    this.deck.push(card);
};

ManaDeck.prototype.remove = function() {
    return this.deck.pop();
};

ManaDeck.prototype.draw = function(x, y, size) {
    var c = this.attribute.RGB;
    //console.log(c);
    fill(c[0], c[1], c[2]);
    stroke(0);
    strokeWeight(1);
    rect(x, y, mCardWidthS*size, mCardHeightS*size, 10);
    fill(0);
    textSize(28*size);
    var l = this.length();
    text(l, x+mCardWidthS*size/2-textWidth(l)/2, y+mCardHeightS*size+30*size);
};

ManaDeck.prototype.cloneGen = function(that) {
	this.clear();
	
	for (var i = 0; i < that.deck.length; ++ i) {
		var thatCard = new ManaCard();
		thatCard.clone(that.deck[i]);
		this.deck.push(thatCard);
	}
};


var ManaBase = function() {
    this.N = new ManaDeck("N");
    this.R = new ManaDeck("R");
    this.B = new ManaDeck("B");
    this.G = new ManaDeck("G");
    this.W = new ManaDeck("W");
    this.U = new ManaDeck("U");
};

ManaBase.prototype.draw = function(x, y, size) {
    Object.keys(this).forEach((a, i) => {
        this[a].draw(x+mcHorzSpace*size*i, y, size);
    });
};

ManaBase.prototype.change = function(attr1, attr2) {
    var v1 = enumHas(ManaType, attr1);
    var v2 = enumHas(ManaType, attr2);
    if (v1 === null || v2 === null) {
        throw ("Invalid Value Exception: " + attr1 + " or " + attr2 + " is not associated with a ManaType");
    }
    if (this[v1.Alias].length() < 1) {
        return;
    } else {
        this[v1.Alias].remove();
        this[v2.Alias].add(new ManaCard(attr2));
    }
};



var SpellCard = function(name, cost, effect, up) {
    if (arguments.length < 4) {
        this.up = false;
    } else {
		this.up = up;
    }
    
    this.name = name;
	this.cost = cost;
	this.effect = effect;
	this.selected = false;
};

var manaSymSize = 10;

function drawManaSym(sym, x, y, size) {
    var v = enumHas(ManaType, sym);
    if (v === null) {
        throw ("Invalid Value Exception: " + sym + " is not associated with a ManaType");
    }
    var c = v.RGB;
    fill(c[0], c[1], c[2]);
    ellipse(x, y, manaSymSize*size);
}

SpellCard.prototype.setSel = function(sel) {
    this.selected = sel;
};

SpellCard.prototype.draw = function(x, y, size) {
    if (this.up) {
        if (this.selected == true) {
            stroke(0, 255, 50);
            strokeWeight(4);
        } else {
            stroke(0);
            strokeWeight(1);
        }
        var w = mCardWidth*size;
        var h = mCardHeight*size;
        fill(255);
        rect(x, y, w, h, 10);
        stroke(0);
        strokeWeight(1);
        fill(0);
        textSize(14*size);
        text(this.name, x+3*size, y+16*size);
        
        var clen = this.cost.length;
        for (var i = 0; i < clen; ++i) {
            drawManaSym(this.cost.substr(i, 1), x+w-(manaSymSize+1.5)*size*(clen-i), y+28*size, size);
        }
        fill(0);
        textSize(10*size);
        text(this.effect, x+5*size, y+46*size, w-15*size, h-25*size);
        
    } else {
        drawMagicCardBack(x, y, size);
    }
};

Card.prototype.clone = function(that) {
	this.suit = that.suit;
	this.rank = that.rank;
	this.up = that.up;
}

var SpellDeck = function() {
    this.deck = [];
    this.length = 0;
};

SpellDeck.prototype.length = function() {
    return this.deck.length;
};

SpellDeck.prototype.add = function(/*SpellCard*/ card) {
    this.deck.push(card);
};

SpellDeck.prototype.addUp = function(/*SpellCard*/ card) {
    card.up = true;
    this.deck.push(card);
};

SpellDeck.prototype.remove = function(/*int*/ index) {
    if (arguments.length == 0) {
        return this.deck.pop();
    } else {
        var spliced = this.deck.splice(index, 1);
        return spliced[0];
    }
};

SpellDeck.prototype.draw = function(x, y, size) {
    stroke(0);
    strokeWeight(1);
    var l = this.deck.length;
    for (var i = 0; i < l; ++ i) {
        this.deck[i].draw(x + (mCardWidth+5)*i*size, y, size);
    }
};

SpellDeck.prototype.clear = function() {
    return this.deck.splice(0, this.deck.length);
};

SpellDeck.prototype.instantiate = function() {
    loopN(50, () => { this.add(new SpellCard("Zippety Zap", "NNRR", "Deal 2 damage to any opponent.", false)); });
};

SpellDeck.prototype.shuffle = function() {
    var newDeck = [];
    for (var i = 0; i < this.deck.length; i ++) {
        newDeck.push(null);
    }
    var randomSpot;
    for (var i = 0; i < this.deck.length; i ++) {
        do {
            randomSpot = floor(random() * this.deck.length);
        } while (newDeck[randomSpot] !== null);
        //System.out.println("Putting " + deck[i] + " in spot " + randomSpot);
        newDeck[randomSpot] = this.deck[i];
    }
    this.deck = newDeck;
};


var MagicPlayer = function(lifeAmt) {
    this.mana = new ManaBase();
    this.life = new IncDec(lifeAmt, 0, 99, 1);
    this.turn = false;
    this.hand = new SpellDeck();
    this.battlefield = new SpellDeck();
};

MagicPlayer.prototype.draw = function(/*int*/x, /*int*/y, /*bool*/isSelf, /*bool*/isTurn) {
    var size;
    if (isSelf === true) { size = 1.2; } else { size = 0.75; }
    this.mana.draw(x, y, size);
    var handX = x+(mcHorzSpace*6+10)*size;
    var handY = y+mCardHeightS-mCardHeight+20;
    // Draw hand or hand size
    if (this.isSelf) {
        this.hand.draw(handX, handY, size);
    } else {
        drawMagicCardBack(handX, handY, size);
        strokeWeight(1*size);
        textSize(56*size);
        fill(0);
        var hl = this.hand.deck.length;
        text(hl, handX+mCardWidth*size/2-textWidth(hl)/2, handY+mCardHeight*size/2+16);
    }
    // Draw whether it is your turn
    strokeWeight(1*size);
    if (!isTurn) {
        fill(0, 255, 255);
    } else {
        fill(0, 255, 0);
    }
    // Draw Life Total
    rect(x, y-mCardHeightS*size/2-5, mcHorzSpace*size*3+5*size, mCardHeightS*size/2, 8*size);
    fill(0);
    textSize(24*size);
    text(this.life.getVal(), x+9*size, y-mCardHeightS*size/3+10*size);
};

MagicPlayer.prototype.genLifePlus = function(x, y) {
    var size = 1.2;
    return new RectClickArea(x+mcHorzSpace*size+2*size, y-mCardHeightS*size/2-2*size, mcHorzSpace*size-8*size, mCardHeightS*size/2-4*size);
};

MagicPlayer.prototype.genLifeMinus = function(x, y) {
    var size = 1.2;
    return new RectClickArea(x+mcHorzSpace*size*2+2*size, y-mCardHeightS*size/2-2*size, mcHorzSpace*size-8*size, mCardHeightS*size/2-4*size);
};

MagicPlayer.prototype.cloneGen = function(that) {
    newMP = new MagicPlayer(this.life.val());
    
    newMP.mana = that.mana.clone();
    this.turn = that.turn;
    this.hand = that.hand.clone();
    this.battlefield = that.battlefield.clone();
};

var SpellHandClickArea = function(x, y, dir, length, size, cut) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.length = length;
};

SpellHandClickArea.prototype.clickCheck = function(size) {
    var ch = mCardHeight*size;
    var cw = mCardWidth*size;
    var hs = mcHorzSpace*size;
    
    for (var i = 0; i < this.length-1; ++ i) {
        if (mouseX >= this.x + hs*i &&
            mouseX <= this.x + hs*(i+1) &&
            mouseY >= this.y &&
            mouseY <= this.y + ch
            ) {
                
            return i;
        }
    }
    if (mouseX >= this.x + hs*(this.length-1) &&
        mouseX <= this.x + hs*(this.length-1) + cw &&
        mouseY >= this.y &&
        mouseY <= this.y + ch
        ) {
        
        return this.length-1;
    }
    return -1;
}

SpellHandClickArea.prototype.matchLength = function(Deck) {
    this.length = Deck.deck.length;
}

/** ***************************************** END New Code ***************************************** **/

/*

Card.prototype.draw = function(x, y) {
    stroke(0);
    strokeWeight(1);
    fill(255);
    rect(x, y, mCardWidth, mCardHeight, 10);
    fill(0);
    textSize(48);
    //text(abbr[this.rank-1], x+50-textWidth(abbr[this.rank-1])/2, y+50);
    if (this.suit === 0) {
        drawClub(x+20, y+65, 60);
    } else if (this.suit === 1) {
        drawDiamond(x+20, y+65, 60);
    } else if (this.suit === 2) {
        drawHeart(x+20, y+65, 60);
    } else {
        drawSpade(x+20, y+65, 60);
    }
};

Card.prototype.drawCorner = function(x, y) {
    stroke(0);
    strokeWeight(1);
    fill(255);
    rect(x, y, mCardWidth, mCardHeight, 10);
    fill(0);
    textSize(24);
    text(abbr[this.rank-1], x+20-textWidth(abbr[this.rank-1])/2, y+25);
    if (this.suit === 0) {
        drawClub(x+5, y+30, 30);
    } else if (this.suit === 1) {
        drawDiamond(x+5, y+30, 30);
    } else if (this.suit === 2) {
        drawHeart(x+5, y+30, 30);
    } else {
        drawSpade(x+5, y+30, 30);
    }
};

Card.prototype.drawSmall = function(x, y) {
    stroke(0);
    strokeWeight(1);
    fill(255);
    rect(x, y, mCardWidthS, mCardHeightS, 10);
    fill(0);
    textSize(24);
    text(abbr[this.rank-1], x+20-textWidth(abbr[this.rank-1])/2, y+25);
    if (this.suit === 0) {
        drawClub(x+5, y+30, 30);
    } else if (this.suit === 1) {
        drawDiamond(x+5, y+30, 30);
    } else if (this.suit === 2) {
        drawHeart(x+5, y+30, 30);
    } else {
        drawSpade(x+5, y+30, 30);
    }
};

Card.prototype.drawBack = function(x, y) {
    stroke(0);
    strokeWeight(1);
    fill(50, 50, 200);
    rect(x, y, mCardWidth, mCardHeight, 10);
    fill(0);
    stroke(255);
    for (var i = mCardWidth/4; i < mCardWidth; i += mCardWidth/4) {
        line(x+i, y, x, y+i);
        line(x+mCardWidth-i, y, x+mCardWidth, y+i);
        line(x+i, y+mCardHeight, x, y+mCardHeight-i);
        line(x+mCardWidth-i, y+mCardHeight, x+mCardWidth, y+mCardHeight-i);
    }
};

Card.prototype.drawBackSmall = function(x, y) {
    stroke(0);
    strokeWeight(1);
    fill(50, 50, 200);
    rect(x, y, mCardWidthS, mCardHeightS, 10);
    fill(0);
    stroke(255);
    for (var i = mCardWidthS/4; i < mCardWidthS; i += mCardWidthS/4) {
        line(x+i, y, x, y+i);
        line(x+mCardWidthS-i, y, x+mCardWidthS, y+i);
        line(x+i, y+mCardHeightS, x, y+mCardHeightS-i);
        line(x+mCardWidthS-i, y+mCardHeightS, x+mCardWidthS, y+mCardHeightS-i);
    }
};
   
Card.prototype.equals = function(that) {
    return (this.rank === that.rank && this.suit === that.suit);
};
   
Card.prototype.compareCard = function(that) {
    if (this.suit < that.suit) {
        return -1;
    } else if (this.suit > that.suit) {
        return 1;
    } else {
        if (this.rank < that.rank) {
            return -1;
        } else if (this.rank > that.rank) {
            return 1;
        } else {
            return 0;
        }
    }
};
   
Card.prototype.compareRankSuit = function(rank, suit) {
    if (this.suit < suit) {
        return -1;
    } else if (this.suit > suit) {
        return 1;
    } else {
        if (this.rank < rank) {
            return -1;
        } else if (this.rank > rank) {
            return 1;
        } else {
            return 0;
        }
    }
};
   
Card.prototype.toString = function() {
    if (this.rank === 0) {
        return "Joker";
    } else {
        return (ranks[this.rank] + " of " + suits[this.suit]);
    }
};

Card.prototype.getColor = function() {
    if (this.suit === 1 || this.suit === 2) {
        return 'R';
    } else {
        return 'B';
    }
}

Card.prototype.setUp = function(up) {
	this.up = up;
}

Card.prototype.setRank = function(rank) {
	this.rank = rank;
}

Card.prototype.getRank = function() {
	return this.rank;
}

Card.prototype.setSuit = function(suit) {
	this.suit = suit;
}

Card.prototype.getSuit = function() {
	return this.suit;
}

Card.prototype.clone = function(that) {
	this.suit = that.suit;
	this.rank = that.rank;
	this.up = that.up;
}


var Deck = function(size) {
    if (arguments.length > 0) {
        this.deck = [];
        for (var i = 0; i < size; i ++) {
            this.deck.push(null);
        }
    } else {
        this.deck = [];
        this.reload(1, false);
    }
};

Deck.prototype.getLength = function() {
    return this.deck.length;
}

Deck.prototype.getTop = function() {
    if (this.deck.length > 0)
        return this.deck[0];
}

Deck.prototype.getCard = function(n) {
	if (n >= 0 && n < this.deck.length) {
		return this.deck[n];
	}
}

Deck.prototype.setDown = function(cardNum) {
    if (this.deck.length > cardNum) {
        this.deck[cardNum].setUp(false);
    }
}

Deck.prototype.setUp = function(cardNum) {
    if (this.deck.length > cardNum) {
        this.deck[cardNum].setUp(true);
    }
}
   
Deck.prototype.add = function(card) {
    this.deck.push(card);
}

Deck.prototype.remove = function(index) {
    var spliced = this.deck.splice(index, 1);
    return spliced[0];
}

Deck.prototype.removeCard = function(card) {
    var n = -1;
    for (var i = 0; i < this.deck.length; i++) {
        if (this.deck[i].equals(card)) {
            n = i;
            break;
        }
    }
    if (n > -1) {
        return this.deck.splice(n, 1);
    }
}

Deck.prototype.removeRank = function(rank) {
    for (var i = 0; i < 4; i ++) {
        this.removeCard(new Card(rank, i));
    }
}

Deck.prototype.removeSuit = function(suit) {
    for (var i = 1; i <= 13; i ++) {
        this.removeCard(new Card(i, suit));
    }
}

Deck.prototype.clear = function() {
    return this.deck.splice(0, this.deck.length);
}

Deck.prototype.clone = function(that) {
	this.clear();
	
	for (var i = 0; i < that.getLength(); ++ i) {
		var thatCard = that.getCard(i);
		this.deck.push(thatCard);
	}
}

Deck.prototype.cloneGen = function(that) {
	this.clear();
	
	for (var i = 0; i < that.deck.length; ++ i) {
		var thatCard = new Card();
		thatCard.clone(that.deck[i]);
		this.deck.push(thatCard);
	}
}

Deck.prototype.reload = function(a1, a2) {
    this.clear();
    var numDeck = 1;
    var up = false;
    if (arguments.length > 0) {
        if (arguments.length === 2) {
            numDeck = a1;
            up = a2;
        } else if (arguments.length === 1) {
            up = a1;
        }
    }
    for (var n = 0; n < numDeck; ++ n) {
        for (var suit = 0; suit < 4; ++ suit) {
            for (var rank = 1; rank <= 13; ++ rank) {
                var temp = new Card(rank, suit, up);
                this.deck.push(temp);
            }
        }
    }
}
   
Deck.prototype.shuffle = function() {
    var newDeck = [];
    for (var i = 0; i < this.deck.length; i ++) {
        newDeck.push(null);
    }
    var randomSpot;
    for (var i = 0; i < this.deck.length; i ++) {
        do {
            randomSpot = floor(random() * this.deck.length);
        } while (newDeck[randomSpot] !== null);
        //System.out.println("Putting " + deck[i] + " in spot " + randomSpot);
        newDeck[randomSpot] = this.deck[i];
    }
    this.deck = newDeck;
   }
   
Deck.prototype.selectionSort = function() {
    var check;
    var temp;
    for (var i = 0; i < this.deck.length; i ++) {
        check = this.deck[i];
        for (var j = i; j < this.deck.length; j ++) {
            if (check.compareCard(this.deck[j]) > 0) {
               temp = this.deck[j];
               this.deck[j] = check;
               check = temp;
            }
        }
        this.deck[i] = check;
    }
}
   
Deck.prototype.toString = function() {
    var out = ("[" + this.deck[0]);
    for (var i = 1; i < this.deck.length; i ++) {
        out = out + (", " + this.deck[i]);
    }
    out = out + "]";
    return out;
}

var mCardHandClickArea = function(x, y, dir, length, size, cut) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.length = length;
    if (arguments.length < 5) {
        this.size = "L";
    } else {
        this.size = size;
    }
    if (arguments.length < 6) {
        if (dir === "H") {
            this.cut = mCardHeight;
        } else if (dir === "V") {
            this.cut = mCardWidth;
        }
    } else {
        this.cut = cut;
    }
};

mCardHandClickArea.prototype.clickCheck = function() {
    var ch, cw;
    if (this.size === "S") {
        ch = mCardHeightS;
        cw = mCardWidthS;
    } else {
        ch = mCardHeight;
        cw = mCardWidth;
    }
    for (var i = 0; i < this.length-1; ++ i) {
        if (this.dir === "H") {
            if (mouseX >= this.x + mcHorzSpace*i &&
                mouseX <= this.x + mcHorzSpace*(i+1) &&
                mouseY >= this.y &&
                mouseY <= this.y + this.cut
                ) {
                    
                return i;
            }
        } else if (this.dir === "V") {
            if (mouseX >= this.x &&
                mouseX <= this.x + this.cut &&
                mouseY >= this.y + mcVertSpace*i &&
                mouseY <= this.y + mcVertSpace*(i+1)
                ) {
                    
                return i;
            }
        }
    }
    if (this.dir === "H") {
        if (mouseX >= this.x + mcHorzSpace*(this.length-1) &&
            mouseX <= this.x + mcHorzSpace*(this.length-1) + cw &&
            mouseY >= this.y &&
            mouseY <= this.y + this.cut
            ) {
            
            return this.length-1;
        }
    } else if (this.dir === "V") {
        if (mouseX >= this.x &&
            mouseX <= this.x + this.cut &&
            mouseY >= this.y + mcVertSpace*(this.length-1) &&
            mouseY <= this.y + mcVertSpace*(this.length-1) + ch
            ) {
            
            return this.length-1;
        }
    }
    return -1;
}

mCardHandClickArea.prototype.matchLength = function(Deck) {
    this.length = Deck.deck.length;
}


*/