var testForCardGameParts = function() { return true; };

new p5();

var suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
var ranks = ["Joker", "Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
var abbr = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
var cardWidth = 100;
var cardHeight = 150;
var horzSpace = 40;
var vertSpace = 60;
var rand = function() { return random() };

function setup() {
    rand = function() { return random() };
}

var drawClub = function(x, y, size) {
    fill(0);
    stroke(0);
    strokeWeight(1);
    ellipse(x+size/2, y+size/4, size/2, size/2);
    ellipse(x+2*size/7, y+4*size/7, size/2, size/2);
    ellipse(x+5*size/7, y+4*size/7, size/2, size/2);
    triangle(x+size/2, y+2*size/3, x+6*size/9, y+size, x+3*size/9, y+size);
};

var drawDiamond = function(x, y, size) {
    fill(255, 0, 0);
    quad(x+size/2, y, x+3*size/4, y+size/2, x+size/2, y+size, x+size/4, y+size/2);
};

var drawHeart= function(x, y, size) {
    fill(255, 0, 0);
    var l = size/4*sqrt(2)/2;
    var o = size/12;
    arc(x+size/4, y+o+size/4, size/2, size/2, PI - QUARTER_PI, TWO_PI);
    arc(x+3*size/4, y+o+size/4, size/2, size/2, PI, QUARTER_PI);
    noStroke();
    triangle(x+size/4-l, y+o+size/4+l, x+size/2, y+o+size/2+2*l, x+3*size/4+l, y+o+size/4+l);
    stroke(255, 0, 0);
    quad(x+size/4-l, y+o+size/4+l, x+3*size/4+l, y+o+size/4+l, x+3*size/4, y+o+size/4, x+size/4, y+o+size/4);
    stroke(0);
    line(x+size/4-l, y+o+size/4+l, x+size/2, y+o+size/2+2*l);
    line(x+size/2, y+o+size/2+2*l, x+3*size/4+l, y+o+size/4+l);
};

var drawSpade = function (x, y, size) {
    fill(0);
    var l = size/5*sqrt(2)/2;
    var o = size/20;
    arc(x+size/4, y+o+4*size/7, 2*size/5, 2*size/5, 0, PI + QUARTER_PI);
    arc(x+3*size/4, y+o+4*size/7, 2*size/5, 2*size/5, 0 - QUARTER_PI, PI);
    triangle(x+size/4-l, y+o+4*size/7-l, x+size/2, y+o+4*size/7-2*size/5-l, x+3*size/4+l, y+o+4*size/7-l);
    quad(x+size/4-l, y+o+4*size/7-l, x+3*size/4+l, y+o+4*size/7-l, x+3*size/4, y+o+4*size/7, x+size/4, y+o+4*size/7);
    triangle(x+size/2, y-o/4+size/2, x+2*size/3, y-o/4+size, x+size/3, y-o/4+size);
};

var Card = function(rank, suit, up) {
    this.suit = suit;
    this.rank = rank;
    this.up = up;
};

Card.prototype.draw = function(x, y) {
    stroke(0);
    strokeWeight(1);
    fill(255);
    rect(x, y, cardWidth, cardHeight, 10);
    fill(0);
    textSize(48);
    text(abbr[this.rank-1], x+50-textWidth(abbr[this.rank-1])/2, y+50);
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
    rect(x, y, cardWidth, cardHeight, 10);
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
    rect(x, y, cardWidth, cardHeight, 10);
    fill(0);
    stroke(255);
    for (var i = 25; i < cardWidth; i += 25) {
        line(x+i, y, x, y+i);
        line(x+cardWidth-i, y, x+cardWidth, y+i);
        line(x+i, y+cardHeight, x, y+cardHeight-i);
        line(x+cardWidth-i, y+cardHeight, x+cardWidth, y+cardHeight-i);
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

Deck.prototype.drawTop = function(x, y, size) {
    stroke(0);
    strokeWeight(1);
    if (this.deck.length > 0) 
        this.deck[0].draw(x, y);
    textSize(16);
    fill(0);
    if (size) {
        text("Pile Size: " + this.deck.length, x, y-5);
    }
};

Deck.prototype.drawTopUpDown = function(x, y, size) {
    stroke(0);
    strokeWeight(1);
    if (this.deck.length > 0) {
        var temp = this.deck[0];
        if (temp.up === true) {
            temp.draw(x, y);
        } else {
            temp.drawBack(x, y);
        }
    }
    textSize(16);
    fill(0);
    if (size) {
        text("Pile Size: " + this.deck.length, x, y-5);
    }
};

Deck.prototype.drawTopCorner = function(x, y, size) {
    stroke(0);
    strokeWeight(1);
    if (this.deck.length > 0) 
        this.deck[0].drawCorner(x, y);
    textSize(16);
    fill(0);
    if (size) {
        text("Pile Size: " + this.deck.length, x, y-5);
    }
};

Deck.prototype.drawTopCornerUpDown = function(x, y, size) {
    stroke(0);
    strokeWeight(1);
    if (this.deck.length > 0) {
        var temp = this.deck[0];
        if (temp.up === true) {
            temp.drawCorner(x, y);
        } else {
            temp.drawBack(x, y);
        }
    }
    textSize(16);
    fill(0);
    if (size) {
        text("Pile Size: " + this.deck.length, x, y-5);
    }
};

Deck.prototype.drawDown = function(x, y, size) {
    stroke(0);
    strokeWeight(1);
    if (this.deck.length > 0) 
        this.deck[0].drawBack(x, y);
    textSize(16);
    fill(0);
    if (size) {
        text("Pile Size: " + this.deck.length, x, y-5);
    }
};

Deck.prototype.drawHand = function(x, y) {
    stroke(0);
    strokeWeight(1);
    for (var i = 0; i < this.deck.length; ++ i) {
        this.deck[i].drawCorner(x + (horzSpace*i), y);
    }
}

Deck.prototype.drawHandUpDown = function(x, y) {
    stroke(0);
    strokeWeight(1);
    for (var i = 0; i < this.deck.length; ++ i) {
        var temp = this.deck[i];
        if (temp.up === true) {
            temp.drawCorner(x + (horzSpace*i), y);
        } else {
            temp.drawBack(x + (horzSpace*i), y);
        }
    }
}

Deck.prototype.drawColumn = function(x, y) {
    stroke(0);
    strokeWeight(1);
    for (var i = 0; i < this.deck.length; ++ i) {
        this.deck[i].drawCorner(x, y + (vertSpace*i));
    }
}

Deck.prototype.drawColumnUpDown = function(x, y) {
    stroke(0);
    strokeWeight(1);
    for (var i = 0; i < this.deck.length; ++ i) {
        var temp = this.deck[i];
        if (temp.up === true) {
            temp.drawCorner(x, y + (vertSpace*i));
        } else {
            temp.drawBack(x, y + (vertSpace*i));
        }
    }
}

Deck.prototype.getLength = function() {
    return this.deck.length;
}

Deck.prototype.getTop = function() {
    if (this.deck.length > 0)
        return this.deck[0];
}

Deck.prototype.setDown = function(cardNum) {
    if (this.deck.length > cardNum) {
        this.deck[cardNum].up = false;
    }
}

Deck.prototype.setUp = function(cardNum) {
    if (this.deck.length > cardNum) {
        this.deck[cardNum].up = true;
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

var CardHandClickArea = function(x, y, dir, length, cut) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.length = length;
    if (arguments.length < 5) {
        if (dir === "H") {
            this.cut = cardHeight;
        } else if (dir === "V") {
            this.cut = cardWidth;
        }
    } else {
        this.cut = cut;
    }
};

CardHandClickArea.prototype.clickCheck = function() {
    for (var i = 0; i < this.length-1; ++ i) {
        if (this.dir === "H") {
            if (mouseX >= this.x + horzSpace*i && 
                mouseX <= this.x + horzSpace*(i+1) && 
                mouseY >= this.y && 
                mouseY <= this.y + this.cut
                ) {
                    
                return i;
            }
        } else if (this.dir === "V") {
            if (mouseX >= this.x && 
                mouseX <= this.x + this.cut && 
                mouseY >= this.y + vertSpace*i && 
                mouseY <= this.y + vertSpace*(i+1)
                ) {
                    
                return i;
            }
        }
    }
    if (this.dir === "H") {
        if (mouseX >= this.x + horzSpace*(this.length-1) &&
            mouseX <= this.x + horzSpace*(this.length-1) + cardWidth &&
            mouseY >= this.y &&
            mouseY <= this.y + this.cut
            ) {
            
            return this.length-1;
        }
    } else if (this.dir === "V") {
        if (mouseX >= this.x &&
            mouseX <= this.x + this.cut &&
            mouseY >= this.y + vertSpace*(this.length-1) &&
            mouseY <= this.y + vertSpace*(this.length-1) + cardHeight
            ) {
            
            return this.length-1;
        }
    }
    return -1;
}

CardHandClickArea.prototype.matchLength = function(Deck) {
    this.length = Deck.deck.length;
}