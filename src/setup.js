// Define Globals
var Global = {};

Global.members = [];
Global.username = "";
Global.room = "";
Global.roomNum = -1;
Global.socket;

var smgr;

function setup() {
    // set up the socket
    Global.socket = io.connect();
    
    // set up the scene manager
    smgr = new SceneManager();
    smgr.wire();
    smgr.showScene(Home);
}
    
function draw() {
    smgr.draw();
}

function mousePressed() {
    //smgr.handleEvent("mousePressed");
}
