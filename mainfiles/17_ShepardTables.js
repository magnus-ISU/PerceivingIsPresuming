//Interface object creates the background color, name, workspace outline, workspace divisions, instructions outline, and instructions text
var interface;
//workspace outline, arguments for Interface
var borders = [50, 50, 625, 468]; //upper corner, size
//separation between the top and the workspace
var header = 50;

//hold calculated y positions for the instructions
var insYpos = [];

//help object to show help text
var helper;

//var json file references
let insJson; //instruction files and separation values
let examples; //examples list and links

//frameRate variable
var fr = 30;

//top bar interface controls defined in order of apparence, not by type
var toggleRun, selectVideo;

var isRunning = false;
var prevIsRunning = isRunning;
var whichVideo = 0;

//arrays to hold video and audio files
var vid = new Array(3);

function preload() {
  insJson = loadJSON("../jsonfiles/17_ins.json");
  examples = loadJSON("../jsonfiles/examplesMenu.json");

  for (var i = 0; i < vid.length; i++) {
    var vidName = "../assets/17_" + i + "shepard" + ".mp4";
    vid[i] = createVideo(vidName);

    vid[i].position(borders[0], borders[1] + header);
    vid[i].size(625, 416);
    vid[i].speed(2);
    vid[i].hide();
    vid[i].pause();
  }
}

function setup() {
  createCanvas(displayWidth, displayHeight);
  //set framerate
  frameRate(fr);
  colorMode(RGB, 255);
  //create major components standard for most sketches (name, workspace borders)
  interface = new Interface(
    "Example 17: Shepard Tables",
    borders[0],
    borders[1],
    borders[2],
    borders[3]
  );

  //call the method of the Interface object to update calculate positions for the instructions
  interface.instructionParams();
  //create help region: four rect params are the arguments
  helper = new HelpRegion(borders[2] + borders[0], 5, borders[2], 40);

  //create togle objects
  //arguments: name, if it is checked by defualt
  toggleRun = new Toggle("Run", false); //name, default value

  //create rotate select object
  //arguments: initial value in loop, rect params, item list
  selectVideo = new RotateSelect(1, 50 + borders[0], 5 + borders[1], 80, 40, [
    "Move",
    "Exchange",
    "Obama",
  ]);
}

function draw() {
  //create main workspace
  //arguments: background color for sketch, main workspace divisions as an array
  interface.mainWorkspace(50, [header]);
  //create the instructions workspace
  //arguments: width of instructions box, length of instructions box, instructions title space
  //instructions text, instructions boundries, y position for instructions
  interface.instructions(
    borders[2],
    borders[3],
    header,
    insJson.text,
    insJson.boundry,
    insYpos
  );
  //draw navigation tool bar
  interface.navigation();

  //draw toggles and assign return values
  //arguments: xpos, ypos, xsize, ysize, behavior [solid, cross, or flash with duration]
  toggleRun.make(borders[0] + 5, 25 + borders[1], 20, 20, ["flash", 10]);
  toggleRun.help("click to start or stop: will flash when running");
  isRunning = toggleRun.isChecked();

  if (isRunning) {
    if (isRunning != prevIsRunning) {
      vid[whichVideo].show();
      vid[whichVideo].loop();
    }
  } else {
    //draw change words
    selectVideo.make(10, 25); //x and y offset for text
    //help text for rotate select person
    selectVideo.help("click to select video");
    //update the person variable to switch the videos
    whichVideo = selectVideo.value();

    for (var i = 0; i < vid.length; i++) {
      vid[i].stop();
      if (i != whichVideo) {
        vid[i].hide();
      }
    }
    vid[whichVideo].show();
  }

  prevIsRunning = isRunning;
}

/* full screening will change the size of the canvas */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
