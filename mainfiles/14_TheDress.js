/*
The Dress Revisited Code
programmed by Christopher Biggs
version 1
updated 10/10/2022
*/

//Interface object creates the background color, name, workspace outline, workspace divisions, instructions outline, and instructions text
var interface;
//workspace outline, arguments for Interface
var borders = [50, 50, 182*2+50, 277*2]; //upper corner, size
//separation between the top and the workspace
var header = 50;

//hold calculated y positions for the instructions
var insYpos = [];

//help object to show help text
var helper;

var pic;


var fr=30;

 //files
function preload() {
  insJson = loadJSON("../jsonfiles/14_ins.json");
  examples = loadJSON("../jsonfiles/examplesMenu.json");
 pic=loadImage("../assets/14_theDress.jpg");
   
}
  

function setup() {
  //create a canvas the size of the window
  createCanvas(windowWidth, windowHeight);
  //set framerate
  frameRate(fr);
  colorMode(RGB, 255);

  //create major components standard for most sketches (name, workspace borders)
  interface = new Interface(
    "Example 14: The Dress",
    borders[0],
    borders[1],
    borders[2],
    borders[3]
  );
  //call the method of the Interface object to update calculate positions for the instructions
  interface.instructionParams();
  //create help region: four rect params are the arguments
  helper = new HelpRegion(borders[2] + borders[0], 5, borders[2], 40);
}

function draw() {
   //create main workspace
  //arguments: background color for sketch, main workspace divisions as an array
  interface.mainWorkspace(50,0);
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
  
      image(pic, borders[0]+25, borders[1], pic.width*2, pic.height*2 );


  
}

/* full screening will change the size of the canvas */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//reset parameters of sketch
function initialize() {
  currentSound.reset();
  for (var i = 0; i < sliders.length; i++) {
    sliders[i].reset();
  }
  toggleMakeClick.reset();
  toggleRun.reset();
}
