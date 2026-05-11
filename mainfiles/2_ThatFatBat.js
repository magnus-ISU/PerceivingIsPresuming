/*
McGurk Illusion Code: That Fat Bat
programmed by Christopher Biggs
version 2
updated 8/19/2022
*/

//Interface object creates the background color, name, workspace outline, workspace divisions, instructions outline, and instructions text
var interface;
//workspace outline, arguments for Interfacex
var borders = [50, 50, 545, 700]; //upper corner, size
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
var toggleRun,
  toggleShowVideo,
  buttonChangeAudio,
  toggleShowWords,
  rotateSelectPerson,
  buttonReset;
//return variables from top bar interface controls
//toggles
var isRunning, correctAudio;

var person = 0; //this is the intial selected person

//initial variables
isRunning = false;
var prevIsRunning = isRunning; //to track changes
//by default the audio will be the incorrect audio
correctAudio = false;

//strings that will display when show words is active
var words = ["Actual Audio: 'Bat Bat Bat'", "Actual Audio: 'That Fat Bat'"];

//arrays to hold video and audio files
var vid = new Array(3);
var sfCorrect = new Array(3);
var sfWrong = new Array(3);

function preload() {
  insJson = loadJSON("../jsonfiles/2_ins.json");
  examples = loadJSON("../jsonfiles/examplesMenu.json");
  for (var i = 0; i < vid.length; i++) {
    var aCorrect = "../assets/2_aCorrect" + i + ".mp3";
    var aWrong = "../assets/2_aWrong" + i + ".mp3";
    sfCorrect[i] = loadSound(aCorrect);
    sfWrong[i] = loadSound(aWrong);
    sfCorrect[i].stop();
    sfWrong[i].stop();
    var vidName = "../assets/2_v" + i + "_1.mp4";
    vid[i] = createVideo(vidName);
    vid[i].size(532, 600);
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
    "2: That Fat Bat",
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
  toggleShowVideo = new Toggle("Show Video", true);
  toggleShowWords = new Toggle("Show Words", false);
  //create buttons
  //arguments: name, rectangle positions
  buttonChangeAudio = new Button(
    "Change Audio",
    120 + borders[0],
    5 + borders[1],
    120,
    40
  );
  buttonReset = new Button(
    "Restart",
    350 + borders[0],
    5 + borders[1],
    100,
    40
  );
  //create rotate select object
  //arguments: initial value in loop, rect params, item list
  rotateSelectPerson = new RotateSelect(
    0,
    50 + borders[0],
    5 + borders[1],
    150,
    40,
    ["Meredith", "David", "Rhea"]
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
  
  //do all this stuff when run is checked
  if (isRunning) {
    //draw reset button
    //arguments x and y offset for text
    buttonReset.make(20, 25);
    buttonReset.help("if audio and video becomes misaligned, click this");
    toggleShowVideo.make(borders[0] + 50, 25 + borders[1], 60, 20);
    toggleShowVideo.help("show and hide video and listen to what you hear");
    toggleShowWords.make(borders[0] + 250, 25 + borders[1], 65, 20); //xpos, ypos, xsize, ysize, behavior
    toggleShowWords.help("show the actual words that match the audio");
    //draw button
    //arguments: x and y offset for text
    buttonChangeAudio.make(20, 25); 
    buttonChangeAudio.help("change the audio while watching and listen to what you hear while watching");
    
    //reset function
    if(buttonReset.trigger()){
      initialize();
      }
    
    //determine if it is correct or incorrect audio
    if (buttonChangeAudio.trigger()) {
      correctAudio = !correctAudio;
    }

    if (correctAudio) {
      sfWrong[person].setVolume(0);
      sfCorrect[person].setVolume(1);
    } else {
      sfCorrect[person].setVolume(0);
      sfWrong[person].setVolume(1);
    }
    //when is running is true, due to if statement that start this block
    //if isRunning just became true, it will not equal the previous value
    //that is the only time the video and audio should start
    if (isRunning != prevIsRunning) {
      vid[person].loop();
      sfCorrect[person].loop();
      sfWrong[person].loop();
    }
    //determine if the video is displayed or not
    if (toggleShowVideo.isChecked()) {
      image(vid[person], borders[0] + 5, borders[1] + header + 5);
    }
    //show the text corresponding to actual sounded words or not
    if (toggleShowWords.isChecked()) {
      drawWords();
    }
  } else {
    //draw select person
    rotateSelectPerson.make(50, 25); //x and y offset for text
    //help text for rotate select person
    rotateSelectPerson.help("click here to change speaker");
    //update the person variable to switch the videos
    person = rotateSelectPerson.value();
    //stop the most recently selected person, when isRunning becomes false
    if(prevIsRunning !=isRunning){
      vid[person].hide();
      vid[person].pause();
      vid[person].time(0);
      sfWrong[person].stop();
      sfCorrect[person].stop();
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
  correctAudio = false;
  for(let i = 0; i < vid.length; i++){
    vid[i].pause();
    vid[i].hide();
    sfWrong[i].stop();
    sfCorrect[i].stop();
  } 
}
