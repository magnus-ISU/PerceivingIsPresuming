//Interface Class
//created by Christopher Biggs
//updated 8/17/2022

//Class to create the interface for all Perceiving is Presuming Interactive Examples
//arguments: name, borders
function Interface(n, x, y, x1, y1) {
  var iw; //variable to hold the width of instructions workspace, assigned in instructions method
  var il; //variable for length of instructions workspace, assigned in instructions method
  var home = new Link(); //home link for navigation
  var exampleLinks = new Menu(); //a menu with links to all examples, requires the Menu class
  var workspaceUpRightCorn = x + x1; //upper right corner of the workspace

  //draw the primary workspace, workspace divisions, example title
  //arguments: color for background, line divisions of workspace which is an array
  this.mainWorkspace = function (backgroundColor, workspaceDivisionsArray) {
    //fill entire background
    noStroke();
    fill(backgroundColor);
    rect(0, 0, width, height);

    //draw main workspace
    noStroke();
    fill(0);
    rect(x, y, x1, y1);
    noFill();
    stroke(20, 100, 255, 255);
    //outline of workarea
    strokeWeight(2);
    rect(x, y, x1, y1);

    //workspaceDivisions
    strokeWeight(1);
    stroke(20, 100, 255, 255);
    //top line
    for (var i = 0; i < workspaceDivisionsArray.length; i++) {
      var yPos = workspaceDivisionsArray[i] + y;
      line(x, yPos, workspaceUpRightCorn, yPos);
    }

    //example title
    textSize(24);
    fill(54, 255, 0, 255);
    noStroke();
    textAlign(LEFT, BOTTOM);
    text(n, x, borders[1] - 5);
  };

  //create the instructions workspace
  //arguments: width of instructions box, length of instructions box, instructions title space
  //instructions text, instructions boundries, y position for instructions
  this.instructions = function (w, l, instructionsTitleSpace, instructionsText, instructionsBoundry, instructionsYposition) {
    iw = w; //assign iw to w to access w elsewhere
    il = l; //same with length
    //fill background opf the instruction's workspace
    noStroke();
    fill(0);
    rect(workspaceUpRightCorn, y, w, l);
    //outline of the instruction's workspace
    strokeWeight(2);
    stroke(20, 100, 255, 255);
    rect(workspaceUpRightCorn, y, w, l);

    //dividing line for "instructions" text
    strokeWeight(1);
    var offset = y + instructionsTitleSpace;
    line(workspaceUpRightCorn, offset, w + workspaceUpRightCorn, offset);
    //draw "instuctions" text
    textAlign(LEFT, BOTTOM);
    fill(255);
    noStroke();
    textSize(20);
    //20 is the pad from the rightside ofthe main workspace and 35 is the bottom ofthe text vertically
    text("INSTRUCTIONS", workspaceUpRightCorn + 20, y + 35);
    //draw the instructions

    for (var i = 0; i < instructionsText.length; i++) {
      interface.instructionsText(
        instructionsText[i], //text
        instructionsYposition[i], //y offset
        20, //x padding
        instructionsBoundry[i], //y boundry
        16 //text size
      );
    }
  };

  //function called by the instuctions method
  //arguments: text, y offset, x boundry, y boundy, text size
  this.instructionsText = function (t, ty, tw, tl, ts) {
    textAlign(LEFT, TOP);
    textSize(ts);
    text(t, x1 + x + 20, ty + 110, iw - tw, tl);
  };

  //draw the navigation elements
  this.navigation = function () {
    //draw divider for navigation header
    strokeWeight(1);
    stroke(20, 100, 255, 255);
    line(x1 + x, il + 50 - 75, iw + x1 + x, il + 50 - 75);
    
    //draw "navigation" text
    fill(255);
    textAlign(LEFT, TOP);
    textSize(16);
    text("NAVIGATATION", x1 + x + 5, il + 60 - 75);
    
    //"home" is an instance of the Link object
    //arguemnts: name, text size, rectangular parameters, link
    home.make(
      "HOME", //name
      12, //text size
      x1 + x + 5, //rectangle parameters
      il + 60 - 50,
      50,
      25,
      "../index.html" //link text
    );
    if (home.help()) {
      helper.make("click to return to main page");
    }
    
    //example links is an instance of the Menu object
    //arguments; display text, text size, rectangle parameters
    exampleLinks.make(
      "Show/Hide Example List –––––––––––-––––––––––––––>",
      12,
      x1 + x + 60,
      il + 60 - 50,
      325,
      25,
      x1 + iw + 50
    );
    if (exampleLinks.help()) {
      helper.make("click to open or close links to each example");
    }
  };
  //calculates the positions for the instructions used above
  this.instructionParams = function () {
    var setYPad = 5; //separation between yboundry and next set of text instuctions
    var yBoundrySum = insJson.boundry[0];
    for (var i = 0; i < insJson.boundry.length; i++) {
      if (i > 0) {
        insYpos[i] = yBoundrySum + setYPad * i;
        yBoundrySum += insJson.boundry[i];
      } else {
        insYpos[i] = 0;
      }
    }
  };

  //circles in workspace, only used by the motion bounce illlusion
  this.workshopCirc = function (cs, o) {
    ellipseMode(CENTER);
    //calculate center for circle position and offset by x and y
        strokeWeight(2);
    stroke(20, 100, 255, 255);
    fill(0);
    ellipse(x1 * 0.5 + x, cs * 0.5 + y + o, cs, cs);
  };
}
