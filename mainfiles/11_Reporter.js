//Interface object creates the background color, name, workspace outline, workspace divisions, instructions outline, and instructions text
var interface;
//workspace outline, arguments for Interface
var borders = [50, 50, 532, 700]; //upper corner, size
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
var toggleRun, toggleShowWords, rotateSelectChangeWords, buttonReset;
//return variables from top bar interface controls
//toggles
var isRunning;

var whichWords = 0; //this is the intially selected words
var currentWords = [
  "I think you’re a lying bitch.",
  "Okay, you don’t want to engage.",
];
for (var i = 0; i < currentWords.length; i++) {
  currentWords[i] = currentWords[i].toUpperCase();
}

//initial variables
isRunning = false;
var prevIsRunning = isRunning; //to track changes
//by default the audio will be the incorrect audio
showWords = false;

//arrays to hold video and audio files
var vid;

function preload() {
    insJson = loadJSON("../jsonfiles/11_ins.json");
  examples = loadJSON("../jsonfiles/examplesMenu.json");
  vid = createVideo("../assets/11_reporter.mp4");
  vid.position(borders[0], borders[1] + header);
  vid.size(532, 600);
  vid.hide();
  vid.pause();
}

function setup() {
  createCanvas(displayWidth, displayHeight);
  //set framerate
  frameRate(fr);
  colorMode(RGB, 255);
  //create major components standard for most sketches (name, workspace borders)
  interface = new Interface(
    "Example 11: The Reporter",
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

  toggleShowWords = new Toggle("Show Words", false);
  //create buttons
  //arguments: name, rectangle positions
  buttonReset = new Button("Reset", 450 + borders[0], 5 + borders[1], 80, 40);
  //create rotate select object
  //arguments: initial value in loop, rect params, item list
  rotateSelectChangeWords = new RotateSelect(
    0,
    120 + borders[0],
    5 + borders[1],
    60,
    40,
    ["Text A", "Text B"]
  );
}

function draw() {
  //create main workspace
  //arguments: background color for sketch, main workspace divisions as an array
  interface.mainWorkspace(50, [header, borders[3] - header - 25]);
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

  toggleShowWords.make(borders[0] + 40, 25 + borders[1], 65, 20); //xpos, ypos, xsize, ysize, behavior
  toggleShowWords.help("display a possible interpretation of the words spoken");

  //draw reset button
  //arguments x and y offset for text
  buttonReset.make(20, 25);
  buttonReset.help("reset to defaults");

  //draw change words
  rotateSelectChangeWords.make(10, 25); //x and y offset for text
  //help text for rotate select person
  rotateSelectChangeWords.help("change the text displayed below the video");
  //update the person variable to switch the videos
  whichWords = rotateSelectChangeWords.value();

  //reset function
  if (buttonReset.trigger()) {
    initialize();
  }
  
   if (toggleShowWords.isChecked()) {
      noStroke();
      textSize(24);
      textAlign(LEFT, TOP);
      fill(54, 255, 0, 255);
      noStroke();
      text(currentWords[whichWords], borders[0] + 50, borders[3] + header - 50);
    }

  //do all this stuff when run is checked
  if (isRunning) {
    //when is running is true, due to if statement that start this block
    //if isRunning just became true, it will not equal the previous value
    //that is the only time the video and audio should start
    if (isRunning != prevIsRunning) {
      vid.show();
      vid.loop();
    }
    //show the text corresponding to actual sounded words or not
   

    if (vid.time() > 5 && vid.time() < 7) {
      noStroke();
      fill(50);
      rect(borders[0] + 200, header + 5, 220, 40);
      textSize(18);
      textAlign(LEFT, TOP);
      fill(255, 0, 0, 255);
      noStroke();
      text("LISTEN CLOSELY NOW", borders[0] + 210, header + 15);
    }
  } else {
    //stop the most recently selected person, when isRunning becomes false
    if (prevIsRunning != isRunning) {
      vid.hide();
      vid.stop();
    }
  }
  prevIsRunning = isRunning;
}

/* full screening will change the size of the canvas */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//reset parameters of sketch
function initialize() {
  toggleRun.reset();
  toggleShowWords.reset();
  rotateSelectChangeWords.reset();

  vid.stop();
  vid.hide();
}
