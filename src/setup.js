// Define Globals
var Global = {};

Global.members = [];
Global.username = "";
Global.room = "";
Global.roomNum = -1;
Global.socket;
Global.smgr;
var n = 0;
Global.numM = 0;

function setup() {
    ++n;
    console.log("Been here " + n + " times");
    
    // set up the socket
    Global.socket = io.connect();
    
    // set up the scene manager
    Global.smgr = new SceneManager();
    Global.smgr.wire();
    Global.smgr.addScene(Home);
    //Global.smgr.addScene(Bingo);
    Global.smgr.addScene(Magic);
    Global.smgr.showScene(Home);
}

function mousePressed() {
    if (event.type != 'touchstart') { return true; }
    Global.smgr.handleEvent("mousePressed");
}

/*
function draw() {
    Global.smgr.draw();
}

function keyPressed() {
    Global.smgr.handleEvent("keyPressed");
}
*/
