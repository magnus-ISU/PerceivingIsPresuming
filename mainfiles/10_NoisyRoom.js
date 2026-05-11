/*
Noisey Room Demonstration Code
programmed by Christopher Biggs
version 1
updated 9/7/2022
*/

//Interface object creates the background color, name, workspace outline, workspace divisions, instructions outline, and instructions text
var interface;
//workspace outline, arguments for Interface
var borders = [50, 50, 532, 750]; //upper corner, size
//separation between the top and the workspace
var header = 50;

//hold calculated y positions for the instructions
var insYpos = [];

//help object to show help text
var helper;

//var json file references
let insJson; //instruction files and separation values
let examples; //examples list and links

//top bar interface objects and return variables
//toggles
var toggleRun, toggleShowVideo, rotateSelectSentence;
//return variables for toggle objects
var isRunning = false;
var prevIsRunning = isRunning;
var isShwon = false;

var sentence = 0;
var prevSentence = sentence;

var volumeSliders = new Array(2);
var volumes = new Array(2);
var initialVolumes = [0.5, 0.15];
var sliderNames = ["noise", "voice"];

//timing information
var fr = 24; //variable for the frame rate, must be a value

//variable to hold video files
var vid = new Array(3);

//hold that noise
let noise;
//filter noise
var lp;

function preload() {
  insJson = loadJSON("../jsonfiles/10_ins.json");
  examples = loadJSON("../jsonfiles/examplesMenu.json");
  for (var i = 0; i < vid.length; i++) {
    var vidName = "../assets/" + "10_noise" + i + ".mp4";
    vid[i] = createVideo(vidName);
    vid[i].size(532, 600);
    vid[i].position(borders[0], borders[1] + header);
    vid[i].pause();
    vid[i].volume(1);
    vid[i].hide();
  }
}

function setup() {
  createCanvas(displayWidth, displayHeight);
  //set framerate
  frameRate(fr);
  colorMode(RGB, 255);
  //create major components standard for most sketches (name, workspace borders)
  interface = new Interface(
    "Example 10: Noisy Room",
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
  toggleShowVideo = new Toggle("Show Video", false);

  //create rotate select object
  //arguments: initial value in loop, rect params, item list
  rotateSelectSentence = new RotateSelect(
    0,
    125 + borders[0],
    5 + borders[1],
    80,
    40,
    ["Sentence 1", "Sentence 2", "Sentence 3"]
  );
  
  for(var i = 0; i < volumeSliders.length; i++){
      //create the sliderd for volume control
  //arguemnts: xpos, ypos, width, name, minimum value, maximum value, default value, step size, data type
  volumeSliders[i] = new Slider(
    borders[0]+50,
    borders[3]-60+header+i*40,
    borders[2]-borders[1],
    sliderNames[i],
    0.,
    1,
    initialVolumes[i],
    1,
    "f"
  );
  }
  
  const buffer = new Float32Array(44100);
    for (let i = 0; i < 44100; i++) {
      buffer[i] = random(0, 1);
    }
  
   mySound = new p5.SoundFile();
  mySound.setBuffer([buffer]);

  lp = new p5.LowPass();
  mySound.connect(lp);
  
}
function draw() {
  //create main workspace
  //arguments: background color for sketch, main workspace divisions as an array
  interface.mainWorkspace(50, [header,650]);
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

  toggleShowVideo.make(borders[0] + 50, 25 + borders[1], 60, 20);
  toggleShowVideo.help("show and hide video");

  //draw select sentence
  rotateSelectSentence.make(10, 25); //x and y offset for text
  //help text for rotate select person
  rotateSelectSentence.help(
    "click here to change the sentence, then press run"
  );

  //return values from interface objects
  isRunning = toggleRun.isChecked();
  var videoShown = toggleShowVideo.isChecked();
  //update the person variable to switch the videos
  sentence = rotateSelectSentence.value();
  if (sentence != prevSentence) {
    initialize();
  }

  prevSentence = sentence;
  
    //draw sliders, post the value, generate the help text, update the reutrn values
    for(var i = 0; i < volumeSliders.length; i++){
    volumeSliders[i].make();
      volumeSliders[i].post(4);
      volumes[i]=volumeSliders[i].value();
    }

  if (isRunning) {
      vid[sentence].volume(volumes[1]);
      mySound.setVolume(volumes[0]);
    if (videoShown) {
      vid[sentence].show();
    } else {
      vid[sentence].hide();
    }

    if (isRunning != prevIsRunning) {
      print("start video");
      vid[sentence].loop();
       mySound.loop();
      lp.set(100, 2);
     
    }
  } else {
    vid[sentence].stop();
    vid[sentence].hide();
    toggleShowVideo.reset();
    if (prevIsRunning != isRunning) {
      initialize();
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
  toggleShowVideo.reset();
  mySound.stop();
  for (var i = 0; i < vid.length; i++) {
    vid[i].stop();
    vid[i].hide();
  }
}
