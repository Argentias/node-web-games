var testForComponents = function() { return true; };

var Incrementer = function(value, min, max, step) {
    this.value = value;
    //this.x = x;
    //this.y = y;
    this.min = min;
    this.max = max;
    this.step = step;
};

Incrementer.prototype.increment = function() {
    this.value += this.step;
    if (this.value > this.max) {
        this.value = this.min;
    }
};

var IncDec = function(value, min, max, step) {
    this.value = value;
    //this.x = x;
    //this.y = y;
    this.min = min;
    this.max = max;
    this.step = step;
};

IncDec.prototype.getVal = function() {
    return this.value;
};

IncDec.prototype.increment = function() {
    if (this.value < this.max) {
        this.value += this.step;
    }
};

IncDec.prototype.decrement = function() {
    if (this.value > this.min) {
        this.value -= this.step;
    }
};

var Toggler = function(value, x, y) {
    this.value = value;
    this.x = x;
    this.y = y;
};

Toggler.prototype.toggle = function() {
    if (this.value === false) {
        this.value = true;
    } else if (this.value === true) {
        this.value = false;
    }
};

var RectClickArea = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
};

RectClickArea.prototype.clickCheck = function() {
    if (mouseX >= this.x && mouseX <= this.x+this.w && mouseY >= this.y && mouseY <= this.y+this.h) {
        return true;
    } else {
        return false;
    }
};

RectClickArea.prototype.draw = function(t) {
    if (this.clickCheck()) {
        fill(150);
    } else{
        fill(255);
    }
    rect(this.x, this.y, this.w, this.h, 5);
    textAlign(CENTER, CENTER);
    fill(0);
    text(t, this.x+this.w/2, this.y+this.h/2);
    textAlign(LEFT, BASELINE);
};

var CircClickArea = function(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
};

CircClickArea.prototype.clickCheck = function() {
    if (sqrt(pow(mouseX-this.x, 2) + pow(mouseY-this.y, 2)) <= this.r) {
        return true;
    } else {
        return false;
    }
};

var timesCalled = 0;

var Timeline = function() {
    this.time = 0;
    this.running = false;
    this.events = [];
    this.frame = frameRate();
};

Timeline.prototype.start = function() {
    this.running = true;
};

Timeline.prototype.pause = function() {
    this.running = false;
};

Timeline.prototype.advance = function() {
    if (this.running === true) {
        this.time += 1 / frame;
    }
    for (var e in this.events) {
        if (this.time >= this.events[e].time) {
            if (this.events[e].done === false) {
                this.events[e].do();
                ++ timesCalled;
            }
        }
    }
};

Timeline.prototype.addEvent = function(ev) {
    this.events.push(ev);
};

Timeline.prototype.getHours = function() {
    return floor(this.time/60/60);
};

Timeline.prototype.getMinutes = function() {
    return floor((this.time - this.getHours()*60*60) / 60);
};

Timeline.prototype.getSeconds = function() {
    return floor( (this.time - (this.getHours()*60*60) - (this.getMinutes()*60)) * 100) / 100;
};

var TimelineEvent = function(time, func, setDone) {
    this.time = time;
    this.function = func;
    this.done = false;
    this.setDone = setDone;
};

TimelineEvent.prototype.do = function() {
    this.fuction();
    if (this.setDone) {
        this.done = true;
    }
};


/** @func createEnum
 *  Creates a basic enum object, with the option of added pseudo-attributes
 *  @param values The array of (String) values to turn into an enum (e.g. ["Up", "Down", "Left", "Right"])
 *  @param attributes An optional array of attributes a variant has (e.g. ["NumVal", "CharVal"])
 *  @param avals An optional array of sets of values for the attributes of the enum (e.g. [[1, 2, 3, 4], ['U', 'D', 'L', 'R']])
 *  @return A frozen object containing the given enum values as well as attributes
 *
 *  ~~ Example Output for (["Up, Down"], ["asNum", "asChar"], [[1, 2], ['U', 'D']]) ~~
 *  {
        Up: "Up",
        Down: "Down",
        Up_asNum: 1,
        Down_asNum: 2,
        Up_asChar: 'U',
        Down_asChar: 'D'
    };
 *
**/
function createEnum(values, attributes, avals) {
    const enumObject = {};
    var vlen = values.length;
    for (var i = 0; i < vlen; ++i) {
        var val = values[i];
        enumObject[val] = val;
    }
    
    if (arguments.length > 1) {
        var alen = attributes.length;
        if (alen != avals.length) {
            throw "Enum Exception: The given number of attributes doesn't match the number of value sets";
        }
        
        for (var i = 0; i < alen; ++i) {
            var av = avals[i];
            if (av.length != vlen) {
                throw "Enum Exception: One of the variants has a missing attribute";
            }
            var att = attributes[i];
            
            for (var j = 0; j < vlen; ++j) {
                var val = values[j];
                enumObject[(val+"_"+att)] = av[j];
            }
        }
    }
    return Object.freeze(enumObject);
}

/** @func createNestedEnum
 *  Creates an enum object where the variants are also objects containing the value and attributes of that enum.
 *  @param values The array of (String) values to turn into an enum (e.g. ["Up", "Down", "Left", "Right"])
 *  @param attributes An optional array of attributes a variant has (e.g. ["NumVal", "CharVal"])
 *  @param avals An optional array of sets of values for the attributes of the enum (e.g. [[1, 2, 3, 4], ['U', 'D', 'L', 'R']])
 *  @return A frozen object containing the given enum values as well as attributes
 *
 *  ~~ Example Output for (["Up, Down"], ["asNum", "asChar"], [[1, 2], ['U', 'D']]) ~~
 *  {
        Up: {
            val: "Up",
            asNum: 1,
            asChar:'U'
        },
        Down: {
            val: "Down",
            asNum: 2,
            asChar: 'D'
        }
    };
 *
**/
function createNestedEnum(values, attributes, avals) {
    const enumObject = {};
    var vlen = values.length;
    var alen = attributes.length;
    if (alen != avals.length) {
        throw "Enum Exception: The given number of attributes doesn't match the number of value sets";
    }
        
    for (var i = 0; i < vlen; ++i) {
        var val = values[i];
        const nestedObject = {};
        nestedObject["val"] = val;
        
        for (var j = 0; j < alen; ++j) {
            var av = avals[j];
            if (av.length != vlen) {
                throw "Enum Exception: One of the variants has a missing attribute";
            }
            var att = attributes[j];
            nestedObject[att] = av[i];
        }
        
        enumObject[val] = nestedObject;
    }
    
    
    return Object.freeze(enumObject);
}

/** @func enumHasVariant
 *  Returns the variant of the given enum with the given attribute if it exists
 *
**/
function enumHas(en, a1, a2) {
    if (arguments.length < 2) {
        throw "Argument Length Exception: Incorrect number of arguments passed";
    }
    
    var lookFor;
    var attribute;
    if (arguments.length == 2) {
        lookFor = a1;
        attribute = "";
    } else {
        lookFor = a2;
        attribute = a1;
    }
    
    var out = null;
    
    Object.keys(en).forEach((key, index) => {
        var variant = en[key];
        Object.keys(variant).forEach((att, ind2) => {
            var a = variant[att];
            if (a == lookFor) {
                if (attribute.length == 0 || attribute == att) {
                    out = variant;
                }
            }
        });
    });
    return out;
}

/** @func loopN
 * Takes a callback and a number, and calls the callback that many times
 * @param n The number of times to loop
 * @param func The callback to use
**/
function loopN(n, func) {
    for (var i = 0; i < n; ++i) {
        func();
    }
}

/** @func randomizeArray
 *  Takes an array and randomizes the order of its elements
 *  @param arr The array to randomize
 *  @return A new array with the same elements as the original, but in a random order
**/
function randomizeArray(arr)
    var newArr = [];
    var len = arr.length;
    // Instantiate the new array with nulls
    for (var i = 0; i < len; ++i) {
        newArr.push(null);
    }
    // Pick random empty spots and assign elements of the original array to those spots
    var randomSpot;
    for (var i = 0; i < len; ++i) {
        do {
            randomSpot = floor(random() * len);
        } while (newArr[randomSpot] !== null);
        
        newArr[randomSpot] = arr[i];
    }
    // Return the randomized array
    return newArr;
}
