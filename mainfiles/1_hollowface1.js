/*
Sound Flash Illusion Code
programmed by Christopher Biggs
version 2
updated 8/18/2022
*/

//Interface object creates the background color, name, workspace outline, workspace divisions, instructions outline, and instructions text
var interface;
//workspace outline, arguments for Interface
var borders = [50, 50, 532, 650]; //upper corner, size
//separation between the top and the workspace
var header = 50;

//hold calculated y positions for the instructions
var insYpos = [];

//help object to show help text
var helper;

//top bar interface objects and return variables
//toggles
var toggleRun;
//return variables for toggle objects
var isRunning = false;
var prevIsRunning = isRunning;

//button to reinitialize sketch to defaults
var reInit;

//slider to control speed
var speedSlider;
//variable to hold the speed
var currentSpeed = 1;

//timing information
var fr = 24; //variable for the frame rate, must be a value

let vid;
let isPlaying = false;

var insJson, examples;

function preload() {

  insJson = loadJSON("../jsonfiles/1_ins.json");
  examples = loadJSON("../jsonfiles/examplesMenu.json");
  
  vid = createVideo("../assets/1_HollowFaceLoop2.mp4");
  vid.size(532, 600);
  vid.position(borders[0], borders[1] + header);
  vid.show();
  vid.pause();

}

function setup() {
  createCanvas(displayWidth, displayHeight);
  //set framerate
  frameRate(fr);
  colorMode(RGB, 255);
  //create major components standard for most sketches (name, workspace borders)
  interface = new Interface(
    "Example 1: Hollow Face 1",
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

  //create togle objects
  //arguments: name, if it is checked by defualt
  toggleRun = new Toggle("Run", false); //name, default value

  //create button object
  //arguments: name, rectangle positions
  reinit = new Button("reset", borders[2] - 55, 5 + borders[1], 100, 40);

  //create the slider to control speed
  //arguemnts: xpos, ypos, width, name, minimum value, maximum value, default value, step size, data type
  speedSlider = new Slider(
    borders[0] + 55,
    header +10 + header / 2,
    borders[2]-100,
    "speed",
    0.25,
    4,
    1,
    1,
    "f"
  );
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
  //draw reset button
  //arguments x and y offset for text
  reinit.make(30, 25);
  reinit.help("click to load default settings"); //show help text
  if (reinit.trigger()) {
    initialize();
  }

  //draw sliders, post the value, generate the help text, update the reutrn values
  speedSlider.make();
  speedSlider.post(4);
  speedSlider.help("control video playback speed")
  currentSpeed = speedSlider.value();
  
  
  vid.speed(currentSpeed);

  if (isRunning && isRunning != prevIsRunning) {
    vid.loop();
  } else {
    vid.pause();
  }

  prevIsrunning = isRunning;

}

/* full screening will change the size of the canvas */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//reset parameters of sketch
function initialize() {
  speedSlider.reset();
  toggleRun.reset();
  vid.time(0);
}
