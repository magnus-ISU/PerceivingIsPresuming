/*
The Dress Revisited Code
programmed by Christopher Biggs
version 1
updated 10/10/2022
*/

//Interface object creates the background color, name, workspace outline, workspace divisions, instructions outline, and instructions text
var interface;
//workspace outline, arguments for Interface
var borders = [50, 50, 560, 500]; //upper corner, size
//separation between the top and the workspace
var header = 50;

//hold calculated y positions for the instructions
var insYpos = [];

//help object to show help text
var helper;

//object to change the selected sound, instance of RotateSelect class
var selectPicture;
var currentPicture = 0; //default sound file

var pictures = new Array(4);
var picNames = ["15_dressDay.png", "15_dressNight.png", "15_dresses.png", "15_noBackground.png"];

var fr=30;

 //files
function preload() {
  insJson = loadJSON("../jsonfiles/15_ins.json");
  examples = loadJSON("../jsonfiles/examplesMenu.json");
  
  for(var i = 0; i< picNames.length; i++){
  var name = "../assets/"+picNames[i];
    pictures[i]=loadImage(name);
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
    "Example 15: The Dress Revisited",
    borders[0],
    borders[1],
    borders[2],
    borders[3]
  );
  //call the method of the Interface object to update calculate positions for the instructions
  interface.instructionParams();
  //create help region: four rect params are the arguments
  helper = new HelpRegion(borders[2] + borders[0], 5, borders[2], 40);
  //arguments: default item, rect params, items as text
  selectPicture = new RotateSelectAlternative(
    currentPicture,
    10 + borders[0],
    5 + borders[1],
    200,
    40,
    ["Day Light (click here to change)", "Night Light", "Side-by-Side", "Side-by-Side w/o background"]
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

  // //draw the rectangle for rotating through the sounds
  selectPicture.make(10, 25); //x and y offset for text
  // //returns the sound file index
  currentPicture = selectPicture.rotate();
  
  selectPicture.help("click to rotate through different images or press the left and right arrow keys");

  switch(currentPicture) {
  case 0:
    image(pictures[currentPicture], borders[0]+2, borders[1]+header+2, pictures[currentPicture].width / 2, pictures[currentPicture].height / 2);
    break;
  case 1:
    image(pictures[currentPicture], borders[0]+6, borders[1]+header+2, pictures[currentPicture].width / 2, pictures[currentPicture].height / 2);
    break;
    case 2:
       image(pictures[currentPicture], borders[0]+18, borders[1]+header+2, pictures[currentPicture].width / 2, pictures[currentPicture].height / 2);
    break;
    case 3:
    image(pictures[currentPicture], borders[0]+18, borders[1]+header+2, pictures[currentPicture].width / 2, pictures[currentPicture].height / 2);
        
  default:
          image(pictures[currentPicture], borders[0]+2, borders[1]+header+2, pictures[currentPicture].width / 2, pictures[currentPicture].height / 2);
    
  }
  
}

function keyPressed(){
  if (keyCode === LEFT_ARROW) {
    currentPicture--;
    if(currentPicture == -1){
      currentPicture = 3;
      }
    selectPicture.overrideIndex(currentPicture);
  } else if (keyCode === RIGHT_ARROW) {
    currentPicture++;
        if(currentPicture == 4){
      currentPicture = 0;
      }
    selectPicture.overrideIndex(currentPicture);
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
