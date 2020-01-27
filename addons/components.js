var testForComponents = function() { return true; };

var Incrementer = function(value, x, y, min, max, step) {
    this.value = value;
    this.x = x;
    this.y = y;
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

var IncDec = function(value, x, y, min, max, step) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.min = min;
    this.max = max;
    this.step = step;
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