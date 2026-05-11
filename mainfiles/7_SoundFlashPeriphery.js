/*
Sound Flash Periphery Illusion Code
programmed by Christopher Biggs
version 2
updated 8/31/2022
*/

//Interface object creates the background color, name, workspace outline, workspace divisions, instructions outline, and instructions text
var interface;
//workspace outline, arguments for Interface
var borders = [50, 50, 700, 700]; //upper corner, size
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
var soundFileIndex = 4; //default sound file
//button to reinitialize sketch to defaults
var reInit;

//sliders
var sliders = new Array(6); //hold an array of sliders
var sliderNames = [
  "Flash Size",
  "Flash Color",
  "Flash Transparency",
  "Flash Frequency",
  "Flash Duration",
  "Double Click Separation",
];

var sliderHelp = [
  "increase flash size (pixels)",
  "change flash color",
  "increase transparency of flash",
  "loop length (ms)",
  "length of flash (ms)",
  "time between clicks (ms)",
];
var sliderMinimums = [50, 0, 0, 500, 20, 10];
var sliderMaximums = [180, 1, 1, 4000, 200, 70];
var sliderStepSize = [1, 1, 1, 10, 10, 10];
var sliderDefaults = [80, 0, 0.3, 1000, 50, 30];
var sliderDataTypes = ["i", "f", "f", "i", "i", "i"];

//slider poisitioning
var sliderOffsetX = 50; //distance from workspace border
var sliderXpos = sliderOffsetX + borders[0]; //final x starting position
var sliderYposOffset = header + borders[1]; //y offset from the top
var sliderSeparation = 40; //distance between sliders

//assignemnt variables from sliders
var sliderReturns = new Array(sliders.length);

//variables for the flash
//determine flash position
var flashPositionLeft = [];
flashPositionLeft[0] = (borders[2]-borders[0]) *0.15+borders[0];; 
flashPositionLeft[1] = (borders[3] + borders[1]) / 3 + borders[1]; 
var flashPositionRight = [];
flashPositionRight[0] = (borders[2]-borders[0]) *0.9+borders[0]; 
flashPositionRight[1] = (borders[3] + borders[1]) / 3 + borders[1]; 

//hold if the previous trigger value
var prevTriggerA = false;
var triggerAonCount =0; //count whenever the trigger turns on

//variable for the flash color
var flashColor; //variable to hold the flash color as an array, created in setup

//variable for the crosses
var centerX = (borders[2]-borders[0]) *.5+borders[0];
var centerY = (borders[3]-400)/2+borders[1]+header*2;

//timing information
var fr = 100; //variable for the frame rate, must be a value that leaves no remainder with 1000 is divided by the frame rate
var msPerFrame = 1000 / fr; //calculate the milliseconds in each frame
var frameWithinLoop = 0; //variable to hold the numer of frames that have occurred while isRunning is true

//sound file player objects
var sf = new Array(6);
var sfB = new Array(6);

//determine if the sound files should play
var soundFileTrigger = false;

//load files
function preload() {
  insJson = loadJSON("../jsonfiles/7_ins.json");
  examples = loadJSON("../jsonfiles/examplesMenu.json");
  for (var i = 0; i < sf.length; i++) {
    var name = "7_click" + i;
    var thisFile = "../assets/" + name + ".mp3";
    var thisFileB = "../assets/" + name + "B" + ".mp3";
    sf[i] = loadSound(thisFile);
    sfB[i] = loadSound(thisFileB);
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
    "Example 7: Sound Flash Periphery",
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
  toggleMakeClick = new Toggle("Sound", true);
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
    )
    //set the values that hold the value from the slider returns, to the slider defaults
    sliderReturns[i]=sliderDefaults[i]; 
  }   
  //initialize flash color, which will be replaced by the color from the slider
  flashColor = color(255, 255, 255, 255);
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
    //returns are flash size, color, transparency, frequency, duration, double click separation
    sliderReturns[i]=sliders[i].value();
  }
  
  //the double click separation can not exceed the flash duraiton, so this updates the flash duration as needed based on the double click separation value
  if(sliderReturns[5] > sliderReturns[4]-10){
    sliders[4].overridePositionAndValue(sliderReturns[5]+10);
  }
  
  //convert the units ofthe return values as needed for the coding, millisecond to number of frames
  sliderReturns[3]=sliderReturns[3]/msPerFrame; //loop frequency
  sliderReturns[4]=sliderReturns[4]/msPerFrame; //flash duration
  sliderReturns[5]=sliderReturns[5]/msPerFrame; //double click separation
  //convert the 0-1 return for flashColor
  flashColor = calculateFlashColor(sliderReturns[1], sliderReturns[2]);
  
  crossPlus(sliderReturns[0]/2);

//create the flashes and clicks while when the code is running
  if (isRunning) {
    noStroke(); //we don't want an outline on our flash
    
    //only run the code if the needed files have loaded, this is probably unneeded security
    if (sf[soundfileIndex].isLoaded() && sfB[soundfileIndex].isLoaded()) {
      //determine if a flash should trigger based on current frame count
      var triggerA = frameWithinLoop >= 0 && frameWithinLoop <= sliderReturns[4];
      if(triggerA!=prevTriggerA && triggerA){
        triggerAonCount++;
      }
      prevTriggerA = triggerA;

      if (triggerA) {
        fill(flashColor);
        ellipseMode(CENTER);
        if(triggerAonCount%2==1){
        ellipse(flashPositionLeft[0], flashPositionLeft[1], sliderReturns[0], sliderReturns[0]);
        } else {
                 ellipse(flashPositionRight[0], flashPositionRight[1], sliderReturns[0], sliderReturns[0]);
        }

        
        //if sound file trigger is false, set it to true
        //this is needed to make sure we do not click every frame, but only when the 
        //trigger becomes true, whereas the flash needs to be rendered every frame
        //if the sound file has not been, then do it
        if (!soundFileTrigger) {
          soundFileTrigger = true; //indicate the file has played
          //only click when the sound toggle is checked
          if (isClicking) {
            sf[soundfileIndex].play();
          }
        }
        //play second file every other time
        //since this tests a specific frame, we don't need to worry about having another variable to track if it changed
        if (
          triggerAonCount % 2 == 0 &&
          frameWithinLoop == sliderReturns[5]
        ) {
          if (isClicking) {
            sfB[soundfileIndex].play();
          }
        }
      } else {
        soundFileTrigger = false; //if triggerA is not running, which is does during the flash, reset the sound file trigger code so that it will happen again
      }

      //increment the frame count until it reaches the end of the loop time
      if (frameWithinLoop < sliderReturns[3]) {
        frameWithinLoop++;
      } else {
        frameWithinLoop = 0;
      }
    }
  } else { //if we are not running, reset the counting
    frameWithinLoop = 0;
    triggerAonCount = 0;
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

function calculateFlashColor(c, o){
  let r, g, b;
      if(c>=0.0 && c<0.25) {
       r = 255;
       g = Math.floor(map(c, 0, 0.25, 255, 0));
       b = g;
    } else if(c>=0.25&&c<0.5){
      r = Math.floor(map(c, 0.25, 0.5, 255, 0));
      g = 255-r;
      b = 0;
    } else if(c>=0.5&&c<0.75){
      r = 0;
      g = Math.floor(map(c, 0.5, 0.75, 255, 0));
      b = 255-g;
    } else {
     r = Math.floor(map(c, 0.75, 1.0, 0, 255));
     g = r;
     b = 255-g;
    }
  return [r, g, b, o*255];
}

function crossPlus(crossSize) {
  stroke(255);
  strokeWeight(2);
  line(centerX - crossSize, centerY, centerX + crossSize, centerY);
  line(centerX, centerY - crossSize, centerX, centerY + crossSize);
}


