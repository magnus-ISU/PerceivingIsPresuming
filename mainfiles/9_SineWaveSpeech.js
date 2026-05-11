/*
Sine Wave Speech Demonstration Code
programmed by Christopher Biggs
version 1
updated 9/5/2022
*/

//Interface object creates the background color, name, workspace outline, workspace divisions, instructions outline, and instructions text
var interface;
//workspace outline, arguments for Interface
var borders = [50, 50, 400, 600]; //upper corner, size
//separation between the top and the workspace
var header = 50;

//hold calculated y positions for the instructions
var insYpos = [];

//help object to show help text
var helper;

//buttons to play files
var swsButtons = new Array(3);
var normButtons = new Array(3);

//timing information
var fr = 60; //variable for the frame rate, must be a value that leaves no remainder with 1000 is divided by the frame rate

//sound file player objects
var swsSF = new Array(3);
var normSF = new Array(3);

//load files
function preload() {
  insJson = loadJSON("../jsonfiles/9_ins.json");
  examples = loadJSON("../jsonfiles/examplesMenu.json");

  normSF[0] = loadSound("../assets/9_apples3.mp3");
  swsSF[0] = loadSound("../assets/9_apples3SWS.mp3");
  normSF[1] = loadSound("../assets/9_efl2.mp3");
  swsSF[1] = loadSound("../assets/9_efl2SWS.mp3");
  normSF[2] = loadSound("../assets/9_lunch1.mp3");
  swsSF[2] = loadSound("../assets/9_lunch1SWS.mp3");
  for(var i = 0; i < normSF; i++){
    normSF[i].noLoop();
    normSF[i].stop();
    swsSF[i].stop();
    swsSF[i].noLoop();
  }
}

function setup() {
  //create a canvas the size of the window
  createCanvas(windowWidth, windowHeight);
  //set framerate
  frameRate(fr);
  colorMode(RGB, 255);

  //create major components standard for most sketches (name, workspace borders)
  interface = new Interface(
    "Example 9: Sine Wave Speech",
    borders[0],
    borders[1],
    borders[2],
    borders[3]
  );
  //call the method of the Interface object to update calculate positions for the instructions
  interface.instructionParams();
  //create help region: four rect params are the arguments
  helper = new HelpRegion(borders[2] + borders[0], 5, borders[2], 40);

  //create button objects
  var pad = 20;
  //arguments: name, rectangle positions
  for (var i = 0; i < swsButtons.length; i++) {
    
    var append = i+1;
    
    normButtons[i] = new Button(
      append+" PLAY NORMAL SPEECH",
      borders[0] + pad,
      header + pad + 70 + i * 200,
      borders[2] - borders[0],
      50
    );

    swsButtons[i] = new Button(
      append+" PLAY SINE WAVE SPEECH",
      borders[0] + pad,
      header + pad + i * 200,
      borders[2] - borders[0],
      50
    );
  }
}

function draw() {
  //create main workspace
  //arguments: background color for sketch, main workspace divisions as an array
  interface.mainWorkspace(50, [200, 400]);
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
  //draw reset button
  //arguments x and y offset for text
  // reinit.make(30, 25);
  // reinit.help("click to load default settings"); //show help text
  for (var i = 0; i < swsButtons.length; i++) {
    swsButtons[i].make(100, 30);
    swsButtons[i].help("CLICK TO PLAY DISTORTED SPEECH");
    normButtons[i].make(100, 30);
    normButtons[i].help("CLICK TO PLAY ORIGINAL SPEECH");
    if(swsButtons[i].trigger()){
      swsSF[i].play();
      //swsButtons[i].trigger();
    }
    if(normButtons[i].trigger()){
      normSF[i].play();
    }
  }
}

/* full screening will change the size of the canvas */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//reset parameters of sketch
function initialize() {}
