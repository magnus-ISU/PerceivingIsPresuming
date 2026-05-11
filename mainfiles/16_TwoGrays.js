/*
The Two Grays Illusion
programmed by Christopher Biggs
version 2
updated 10/15/2022
*/

//Interface object creates the background color, name, workspace outline, workspace divisions, instructions outline, and instructions text
var interface;
//workspace outline, arguments for Interface
var borders = [50, 50, 821, 620]; //upper corner, size
//separation between the top and the workspace
var header = 50;

//hold calculated y positions for the instructions
var insYpos = [];

//help object to show help text
var helper;

let insJson; //instruction files and separation values
let examples; //examples list and links

var fr=120;

//button to reset sounds
var reInit;
//toggles and initial values
var drawConnectRect; //toggle to determine if the connection rectangle should be shown
var rectDrawn = false;
var drawConnectStroke; //detrmine if the rectangle should have an outline
var strokeDrawn = false;

var tg;//variable to hold picture

function preload() {
  insJson = loadJSON("../jsonfiles/16_ins.json");
  examples = loadJSON("../jsonfiles/examplesMenu.json");
  tg = loadImage('../assets/16_twoGrays.png');
}

var fr = 120; //set the frame rate, faster updates makes it less likely the user leaves the rectangle beyond when they drag
var tgSize = new Array(2); //hold the size ofthe picture
var r; //this is the object of the MoveRect class
  

function setup() {
  //create a canvas the size of the window
  createCanvas(windowWidth, windowHeight);
  //set framerate
  frameRate(fr);
  colorMode(RGB, 255);

  //create major components standard for most sketches (name, workspace borders)
  interface = new Interface(
    "Example 16: Two Grays",
    borders[0],
    borders[1],
    borders[2],
    borders[3]
  );
  //call the method of the Interface object to update calculate positions for the instructions
  interface.instructionParams();
  //create help region: four rect params are the arguments
  helper = new HelpRegion(borders[2] + borders[0], 5, borders[2], 40);
  
  reInit = new Button("reset", 270 + borders[0], 5+header, 100, 40); //name, rectangle
  drawConnectRect = new Toggle("Show Connection", false); //name, default value
  drawConnectStroke = new Toggle("Show Outline", false); //name, default value
  
  
  tgSize[0] = tg.width*0.5;
  tgSize[1] = tg.height*0.5;
  print(tgSize[0], tgSize[1]);
  r = new MoveRect(60, 100, 100)

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

  reInit.make(30, 25);
  reInit.help("click to reset rectangle position");
  
  drawConnectRect.make(borders[0] + 20, 25+header, 90, 20, ["solid", 5, 164, 248, 150]); //xpos, ypos, xsize, ysize, behavior
  drawConnectRect.help("click to see a bridge between upper and lower squares");
  rectDrawn = drawConnectRect.isChecked();
  
  
  if (reInit.trigger()) {
    r.reInit();
    drawConnectRect.reset();
    drawConnectStroke.reset();
  }
  
  image(tg, borders[0], borders[1]+header, tgSize[0], tgSize[1]);
  r.make();
  r.help("Drag box over the A and B");
  
   if (rectDrawn) {
    drawConnectStroke.make(borders[0] + 120, 25+header, 70, 20, ["solid", 5, 164, 248, 150]); //xpos, ypos, xsize, ysize, behavior
    drawConnectStroke.help("click to an outline around the bridge");
    strokeDrawn = drawConnectStroke.isChecked();
      rectMode(CORNER);

    noStroke();
    if (strokeDrawn) {
      strokeWeight(2);
      stroke(5, 164, 248, 150);
    }

    fill(137, 137, 137, 255);
    rect(410, 175+header, 100, 300);
  
  }
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
