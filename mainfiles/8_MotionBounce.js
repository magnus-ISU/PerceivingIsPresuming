/*
Motion Bounce Illusion Code
programmed by Christopher Biggs
version 2
updated 9/1/2022
*/

//Interface object creates the background color, name, workspace outline, workspace divisions, instructions outline, and instructions text
var interface;
//workspace outline, arguments for Interface
var borders = [50, 50, 400, 700]; //upper corner, size
//separation between the top and the workspace
var header = 50;

//hold calculated y positions for the instructions
var insYpos = [];

//help object to show help text
var helper;

//top bar interface objects and return variables
//toggles
var toggleRun, toggleMakeClick;
//return variables for toggle objects
var isRunning, isClicking;
//object to change the selected sound, instance of RotateSelect class
var currentSound;
var soundFileIndex = 2; //default sound file
//button to reinitialize sketch to defaults
var reInit;

//sliders
var sliders = new Array(6); //hold an array of sliders
var sliderNames = [
  "Size",
  "Speed",
  "Transparency",
  "Rotation",
  "Quantity",
  "Color",
];

var sliderHelp = [
  "change ball size",
  "change speed",
  "see through the balls more or less",
  "rotate within circle",
  "add or take away pairs of balls",
  "change ball color",
];
var sliderMinimums = [10, 1, 0, 0, 1, 0];
var sliderMaximums = [100, 8, 1, 360, 16, 1];
var sliderStepSize = [1, 1, 1, 1, 1, 1];
var sliderDefaults = [34, 3, 0.1, 0, 1, 0];
var sliderDataTypes = ["i", "f", "f", "i", "i", "f"];

var sliderReturns = new Array(sliderHelp.length);
for(let i=0;i<sliderReturns.length; i++){
  sliderReturns[i]=sliderDefaults[i];
}


//slider poisitioning
var sliderOffsetX = 50; //distance from workspace border
var sliderXpos = sliderOffsetX + borders[0]; //final x starting position
var sliderYposOffset = header + borders[1]; //y offset from the top
var sliderSeparation = 40; //distance between sliders

//assignemnt variables from sliders
var sliderReturns = new Array(sliders.length);

var ballColor; //variable to hold the flash color as an array, created in setup

//timing information
var fr = 60; //variable for the frame rate, must be a value that leaves no remainder with 1000 is divided by the frame rate

//sound file player objects
var sf = new Array(6);

//load files
function preload() {
  insJson = loadJSON("../jsonfiles/8_ins.json");
  examples = loadJSON("../jsonfiles/examplesMenu.json");
  for (var i = 0; i < sf.length; i++) {
    var name = "click" + i;
    var thisFile = "../assets/" + "8_click" + i + ".mp3";
    sf[i] = loadSound(thisFile);
  }
}

//size of the circle in which the balls will collide
var circleSize = 400;
//variables for bouncing balls
//global variables
var dir = 1; //ball direction
var initX = 0-borders[2]/2+sliderDefaults[0];

var x = initX; //initial ball x position
var y = 0; //initial ball y position
var moveBalls = [200 + borders[0], 200 + header + borders[1]];

//collision detection variable
var hit = false;
var prevHit = false;
var changeHit = false;

function setup() {
  //create a canvas the size of the window
  createCanvas(windowWidth, windowHeight);
  //set framerate
  frameRate(fr);
  colorMode(RGB, 255);

  //create major components standard for most sketches (name, workspace borders)
  interface = new Interface(
    "Perceiving is Presuming Example 8",
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
  toggleMakeClick = new Toggle("Sound", false);
  //select sound object
  //arguments: default item, rect params, items as text
  currentSound = new RotateSelectAlternative(
    soundFileIndex,
    110 + borders[0],
    5 + borders[1],
    150,
    40,
    ["Click 0", "Click 1", "Click 2", "Click 3", "Click 4", "Click 5"]
  );

  //create button object
  //arguments: name, rectangle positions
  reinit = new Button("reset", 270 + borders[0], 5 + borders[1], 100, 40);

  //create the sliders
  //arguemnts: xpos, ypos, width, name, minimum value, maximum value, default value, step size, data type
  for (let i = 0; i < sliders.length; i++) {
    sliders[i] = new Slider(
      sliderXpos,
      440 + i * sliderSeparation + sliderYposOffset,
      borders[2],
      sliderNames[i],
      sliderMinimums[i],
      sliderMaximums[i],
      sliderDefaults[i],
      sliderStepSize[i],
      sliderDataTypes[i]
    );
    //set the values that hold the value from the slider returns, to the slider defaults
    sliderReturns[i] = sliderDefaults[i];
  }
  //initialize flash color, which will be replaced by the color from the slider
  ballColor = color(255, 255, 255, 255);
}

function draw() {
  //create main workspace
  //arguments: background color for sketch, main workspace divisions as an array
  interface.mainWorkspace(50, [header, header + 400]);
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
  interface.workshopCirc(circleSize, header);

  //draw toggles and assign return values
  //arguments: xpos, ypos, xsize, ysize, behavior [solid, cross, or flash with duration]
  toggleRun.make(borders[0] + 10, 25 + borders[1], 20, 20, ["flash", 10]);
  toggleRun.help("click to start or stop: will flash when running");
  isRunning = toggleRun.isChecked();
  toggleMakeClick.make(borders[0] + 50, 25 + borders[1], 30, 20);
  toggleMakeClick.help("turn sound on and off: x indicates on");
  isClicking = toggleMakeClick.isChecked();

  //draw the rectangle for rotating through the sounds
  currentSound.make(50, 25); //x and y offset for text
  //returns the sound file index
  soundfileIndex = currentSound.rotate();
  currentSound.help("click to rotate through different sounds");
  //draw reset button
  //arguments x and y offset for text
  reinit.make(30, 25);
  reinit.help("click to load default settings"); //show help text
  if (reinit.trigger()) {
    initialize();
  }
  //draw sliders, post the value, generate the help text, update the reutrn values
  for (var i = 0; i < sliders.length; i++) {
    sliders[i].make();
    sliders[i].post(5);
    sliders[i].help(sliderHelp[i]);
    //returns are size, speed, transparency, rotation, quantity, and color
    sliderReturns[i] = sliders[i].value();
  }
  //set the ball color based on the relevant sliders
  ballColor = calculateFlashColor(sliderReturns[5], (1-sliderReturns[2])*255);

  //do the things while isRunning is true
  if (isRunning) {
    translate(moveBalls[0], moveBalls[1]);
    stroke(ballColor);
    strokeWeight(sliderReturns[0]);
    rotate(radians(sliderReturns[3]));
     
    for (let i = 0; i < sliderReturns[4]; i++) {
      var thisRot = PI / i;
      rotate(thisRot);
      point(x, y);
      point(x * -1, y);
    }
        x=x+sliderReturns[1]*dir;
   

    if (x>borders[2]/2-sliderReturns[0]/2 || x < -borders[2]/2+sliderReturns[0]/2) {
      dir *= -1;
    }
    
  if (Math.abs(x) < 0 + sliderReturns[0]/2) {
    hit = true;
  } else { 
    hit = false;
  }
    
  if (hit != prevHit && hit == true) {
    changeHit = true;
  } else {
    changeHit = false;
  }
    
  if (changeHit && isClicking ) {
    sf[soundfileIndex].play();
  }
  prevHit = hit;
    
    
    
    
  } else {
    x=initX;
    y=0;
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

function calculateFlashColor(c, o) {
  let r, g, b;
  if (c >= 0.0 && c < 0.25) {
    r = 255;
    g = Math.floor(map(c, 0, 0.25, 255, 0));
    b = g;
  } else if (c >= 0.25 && c < 0.5) {
    r = Math.floor(map(c, 0.25, 0.5, 255, 0));
    g = 255 - r;
    b = 0;
  } else if (c >= 0.5 && c < 0.75) {
    r = 0;
    g = Math.floor(map(c, 0.5, 0.75, 255, 0));
    b = 255 - g;
  } else {
    r = Math.floor(map(c, 0.75, 1.0, 0, 255));
    g = r;
    b = 255 - g;
  }
  return [r, g, b, o];
}
