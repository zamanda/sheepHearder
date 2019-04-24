// global variables for images and time
var moveAwayTime = 5; // sheep moves away from dog when collision detected for 5 frames

// holds time left ot play game and time game is played
var timeLeft;
var timePassed = 0;

// canvas dimensions
var theCanvas;
var canvasWidth = 900;
var canvasHeight = 650;

// pen dimensions and positioning
var penX = canvasWidth;
var penY = canvasHeight/2;
var penWidth = 70; 
var penHeight = canvasHeight/2; 

// start button positioning
var startButtonX = canvasWidth * 0.90;
var startButtonY = canvasHeight *0.85;

// hold start screen sound and bahh sound
var sound; 
var sheepSound;

// how many times the game has been played - for leveling
var timesPlayed = 0; 

// start and end conditions
var start = false;
var end = false;
var showEnd = false; // when to show end screen

// characters, canvas, and mic
var dog; // ones dog object
var sheeps = [ ]; // array of sheep objects
var SheepSprites;
var DogSprites;
var canvas;
var mic;
var richFont;

// background images depending on state
var startscreen;
var endscreen; 
var backgroundImage;

// keeps track of number of sheep left to herd
var sheepLeft;

// keep count of which dog image to use
var count = 1;
// hold number of frames
var frames = 0;

// 'empty' object to figure out which dog image to use
var currentDog = {
  xpos:0,
  ypos:0,
  w:0,
  h:0
};

// preload images, sounds, and fonts
function preload(){
  // load images
  SheepSprites = loadImage("images/sheepSprite.png");
  DogSprites = loadImage("images/dogSprite.png");
  grass = loadImage("images/grass3.png");
  startscreen = loadImage("images/start-screen.png");
  endscreen = loadImage("images/end-screen.png");
  backgroundImage = loadImage("images/background-with-pen-fixed.png");
  richFont = loadFont("fonts/Rich_M_Font.ttf");
  
  // load sounds
  sound = loadSound("sounds/trim2.mov");
  sheepSound = loadSound("sounds/baa.mp3");
}

function setup(){
  // create and style the canvas
  theCanvas = createCanvas(canvasWidth,canvasHeight);
  theCanvas.style('border','5px solid black');
  theCanvas.style('display','block');
  theCanvas.style('margin','auto');

  // set noise detail for Perlin noise
  noiseDetail(24);
    
  // get audio through mic
  mic = new p5.AudioIn()
  mic.start();
    
  // create lots of sheep
  for (var i = 0; i < 10; i++) {
    sheeps.push( new Sheep(random(width-canvasWidth/5), random(height),randomSheepPic()) );
  }
    
  // get the number of sheep in the array initially  
  sheepLeft = sheeps.length;
    
  // create the dog
  dog = new Dog(canvasWidth/2,canvasHeight/2);
}

function draw(){
  imageMode(CORNER);
  image(grass,0,0,canvasWidth, canvasHeight);
  imageMode(CENTER);
  
  // startScreen
  if(start == false && end == false){
    startScreen();
  }
  
  // play game
  else if (start == true && end == false){ 
    // background and time left display
    imageMode(CORNER);
    image(backgroundImage,0,0,canvasWidth,canvasHeight);
    textAlign(LEFT,TOP);
    fill(0);
    textSize(50);
    text("Time Left :  " + ceil(timeLeft/60),20,20);

    // draw all of our sheeps
    for (var i = 0; i < sheeps.length; i++) {
      sheeps[i].move();
      sheeps[i].display();
      heardBark(dog, sheeps[i]); // have all the sheep react to barking/ noise
      collisionDogToSheep(dog, sheeps[i]); // check for collision between dog and all sheep
    }
    
    // check collision between all sheep
    for (var i = 0; i < (sheeps.length - 1); i++){
      for(var j = 1; j < sheeps.length; j++){
        collisionSheepToSheep(sheeps[i], sheeps[j]);
      }
    }
    
    // dog display and actions
    dog.move();
    dog.display();
    dog.penCollision();
    
    // choose which image of the dog sprite to be shown
    if (count < 4){
      count++
    }
    else{
      count = 1
    }
    
    // reset frames every 60 frames
    frames++;
    if (frames > 60){
      frames = 0;
    }
    
    // decrement time left
    timeLeft -= 1;
    
    // check collisions between sheep and pen - if sheep in pen, delete from array/game
    for (var j = 0; j < sheeps.length ;j++){
      if (sheeps[j].penCollision()){
        sheeps.splice(j, 1);
      }
    }
    
    // if the player reaches next level (and they've only played the first level,  then refill the game with more sheep)
    if (nextLevel() && timesPlayed < 2){ 
      // create lots of sheep
      for (var i = 0; i < 20; i++) {
        sheeps.push( new Sheep(random(width-canvasWidth/5), random(height),randomSheepPic()) );
      }
      // check number of sheep left in array
      sheepLeft = sheeps.length;
    }
    
    // constantly check if game over
    gameOver();
  }
  
  // do game over events if game over
  else if (start == false && end == true){
    gameOver();
  }
}

// Sheep constructor
function Sheep(x, y, name){
  // holds current sheep sprite image to be used
  var currentSheep = {
    xpos:0,
    ypos:0,
    w:0,
    h:0
  }
  
  // sheep position
  this.x = x;
  this.y = y;
  
  // get the name of the current sheep to be displayed
  this.name = name;
  currentSheep = name;

  // number of frames sheep should stay as a particular image
  this.framesInState = 0;
  
  // compute a perlin noise offiset
  this.noiseOffsetX = random(0,1000);
  this.noiseOffsetY = random(0,1000);

  // display the sheep
  this.display = function(){
     imageMode(CENTER);
      image (SheepSprites,currentSheep.xpos,currentSheep.ypos,currentSheep.w,currentSheep.h,this.x,this.y,currentSheep.w,currentSheep.h);
      // once direction of sheep to face is decided - animate the image using mutiple images with slightly altered positioning
      if(this.name == SheepDown2){
        if(this.framesInState % 10==0){
          currentSheep = SheepDown2;
        }
        if(this.framesInState % 30==0){
          currentSheep = SheepDown3;
        }
        if(this.framesInState % 50 ==0){
          currentSheep = SheepDown4;
        }
        if(this.framesInState % 70 ==0){
          currentSheep = SheepDown1;
        }
        if(this.framesInState % 90 ==0){
          currentSheep = SheepDown2;
        }
      }
    if(this.name == SheepDown1){
        if(this.framesInState % 10==0){
          currentSheep = SheepDown1;
        }
        if(this.framesInState % 30==0){
          currentSheep = SheepDown2;
        }
        if(this.framesInState % 50 ==0){
          currentSheep = SheepDown3;
        }
        if(this.framesInState % 70 ==0){
          currentSheep = SheepDown4;
        }
        if(this.framesInState % 90 ==0){
          currentSheep = SheepDown1;
        }
      }
    if(this.name == SheepDown3){
        if(this.framesInState % 10==0){
          currentSheep = SheepDown3;
        }
        if(this.framesInState % 30==0){
          currentSheep = SheepDown4;
        }
        if(this.framesInState % 50 ==0){
          currentSheep = SheepDown1;
        }
        if(this.framesInState % 70 ==0){
          currentSheep = SheepDown2;
        }
        if(this.framesInState % 90 ==0){
          currentSheep = SheepDown3;
        }
      }
    if(this.name == SheepDown4){
        if(this.framesInState % 10==0){
          currentSheep = SheepDown4;
        }
        if(this.framesInState % 30==0){
          currentSheep = SheepDown1;
        }
        if(this.framesInState % 50 ==0){
          currentSheep = SheepDown2;
        }
        if(this.framesInState % 70 ==0){
          currentSheep = SheepDown3;
        }
        if(this.framesInState % 90 ==0){
          currentSheep = SheepDown4;
        }
      }
      
      // increment frames and reset to 0 when 90 frames have passed
      this.framesInState +=1
      if(this.framesInState > 90){
        this.framesInState = 0;
      }
  }

  // move this sheep
  this.move = function() {
    // movement of sheep in x and y direction
    var xMovement = map(noise(this.noiseOffsetX), 0, 1, -1.5, 1.5);
    this.x += xMovement;
    var yMovement = map(noise(this.noiseOffsetY), 0, 1, -1, 1);
    this.y += yMovement;
    
    // sheep should bounce off the walls of the screen - want wraparound but not working
    if (this.x > (width-canvasWidth/5)+25 && (this.y > (height-canvasHeight/4)|| this.y < (canvasHeight/4))) {
      this.x -= 2;
    }
    if (this.x < 25) {
      this.x += 2;
    }
    if (this.y < 25) {
      this.y += 2;
    }
    if (this.y > height-25) {
      this.y -= 2;
    }
    
    // advance our noise offset a little bit
    this.noiseOffsetX += 0.01;
    this.noiseOffsetY += 0.01;
  }
  
  // detect collision beterrn sheep and pen and play bahh sound when it occurs
  this.penCollision = function() {
    if (this.x > canvasWidth - canvasWidth/10 && (this.y < canvasHeight/2 + canvasHeight/4) && (this.y > canvasHeight/2 - canvasHeight/4)){
      sheepSound.play();
      return true;
    } 
    else{
      return false;
    }
  }
}

// determines whether or not next level is reached
function nextLevel(){
  if (sheeps.length == 0 && timeLeft > 0 && timesPlayed < 2){
    timeLeft = 6000;
    timesPlayed++;
    return true;  
  }
}

// choose which sheep to display randomly
function randomSheepPic(){
  switch(Math.floor(Math.random() * (3 + 1))){
    case 0:
      return SheepDown1;
    case 1:
      return SheepDown2;
    case 2:
      return SheepDown3;
    case 3:
      return SheepDown4;
  }
}

// Dog constructor
function Dog(x, y){
  this.x = x;
  this.y = y;
  
  // display the dog
  this.display = function(){
    //ellipse(this.x, this.y, 30);
    if(this.direction == 1 && !(keyIsDown(65) || keyIsDown(LEFT_ARROW))){
      currentDog = DogLeft2;
    }
    if(this.direction == 2 && !(keyIsDown(68) || keyIsDown(RIGHT_ARROW))){
      currentDog = DogRight2;
    }
    if(this.direction == 3 && !(keyIsDown(87) || keyIsDown(UP_ARROW))){
      currentDog = DogUp2;
    }
    if(this.direction == 4 && !(keyIsDown(83) || keyIsDown(DOWN_ARROW))){
      currentDog = DogDown1;
    }
  }

  // handles dog's collision with the pen
  this.penCollision = function(){
    if (this.x >= (canvasWidth - penWidth/2) &&  this.y <= (canvasHeight - penHeight + penHeight/2) && this.y >= (canvasHeight - penHeight - penHeight/2)){ // if 
  	  this.x = canvasWidth - penWidth/2;
    }
  	else if(this.x >= canvasWidth - penWidth/2 && this.y == canvasHeight/4 ){ // if on top edge
  	  this.y = canvasHeight/4;
  	}
  	else if (this.x >= canvasWidth - penWidth/2 && this.y == (canvasHeight/4) * 3) {// bottom edge 
  	  this.y = (canvasHeight/4) * 3;
  	}
  }
  
  // holds which image direction dog is displayed in
  this.direction = 1;

  // keyboard directed movement of dog - determines which image of the dog should be displayed
  this.move = function(){
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)){
      imageMode(CENTER);
      if(frames %5 ==0){
        if(count == 1){
          currentDog = DogLeft1;
        }
        if(count == 2){
          currentDog = DogLeft2;
        }
        if(count == 3){
          currentDog = DogLeft3;
        }
        if(count == 4){
          currentDog = DogLeft4;
        }
      }
      this.x -= 5; 
      this.direction = 1;
    }
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
      imageMode(CENTER);
      if(frames %5 ==0){
        if(count == 1){
          currentDog = DogRight1;
        }
        if(count == 2){
          currentDog = DogRight2;
        }
        if(count == 3){
          currentDog = DogRight3;
        }
        if(count == 4){
          currentDog = DogRight4;
        }
      }
      this.x += 5;
      this.direction = 2;
    }
    if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
      imageMode(CENTER);
      if(frames %5 ==0){
        if(count == 1){
          currentDog = DogUp1;
        }
        if(count == 2){
          currentDog = DogUp2;
        }
        if(count == 3){
          currentDog = DogUp3;
        }
        if(count == 4){
          currentDog = DogUp4;
        }
      }
      this.y -= 5;
      this.direction = 3;
    }
    if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
      imageMode(CENTER);
      // currentDog = DogDown2;
      if(frames %5 ==0){
        if(count == 1){
          currentDog = DogDown1;
        }
        if(count == 2){
          currentDog = DogDown2;
        }
        if(count == 3){
          currentDog = DogDown3;
        }
        if(count == 4){
          currentDog = DogDown4;
        }
      }
      this.y += 5;
      this.direction = 4;
    }
 
    // prevent dog from moving beyond boundries
    if (this.x > canvasWidth - (canvasWidth/10)){  
      this.x = canvasWidth - (canvasWidth/10); 
    }
    if (this.y < 0){ this.y = 0; }
    if (this.x <  0){ this.x = 0; }
    if (this.y > height){ this.y = height; }
    
    // display the current dog image
    image (DogSprites,currentDog.xpos,currentDog.ypos,currentDog.w,currentDog.h,this.x,this.y,currentDog.w,currentDog.h);
  }
}

// detects collision between dog and the sheep
function collisionDogToSheep(dog, sheep){
    if(dist(dog.x, dog.y, sheep.x, sheep.y) < 50){
       moveAway(dog, sheep);
    }
}

// detects when a collision between sheep occurs
function collisionSheepToSheep(sheepA, sheepB){
  if(dist(sheepA.x, sheepA.y, sheepB.x, sheepB.y) < 20){
    if(sheepA.x < sheepB.x){
      sheepA.x -= 1;
      sheepB.x += 1;
    }
    else if(sheepA.x > sheepB.x){
      sheepA.x += 1;
      sheepB.x -= 1;
    }
    if(sheepA.y < sheepB.y){
      sheepA.y -= 1;
      sheepB.y += 1;
    }
    else if(sheepA.x > sheepB.y){
      sheepA.y += 1;
      sheepB.y -= 1;
    }
  }
}

// sheep move away from dog but not beyond borders 
function moveAway(dog, sheep){
  if(dog.x < sheep.x){
    sheep.x += 1;
    if(sheep.x > width-25){
      if(sheep.y < 25){
        sheep.y += 1;
      }
      else if(sheep.y > height-25){
        sheep.y -= 1;
      }
    }
  }
  else if(dog.x > sheep.x){
    sheep.x -= 1;
    if(sheep.x < 25){
      if(sheep.y < 25){
        sheep.y += 1;
      }
      else if(sheep.y > height-25){
        sheep.y -= 1;
      }
    }
  }
  if(dog.y < sheep.y){
    sheep.y += 1;
    if(sheep.y < 25){
      if(sheep.x < 25){
        sheep.x += 1;
      }
      else if(sheep.x > width-25){
        sheep.x -= 1;
      }
    }
  }
  else if(dog.y > sheep.y){
    sheep.y -= 1;
    if(sheep.y > height-25){
      if(sheep.x < 25){
        sheep.x += 1;
      }
      else if(sheep.x > width-25){
        sheep.x -= 1;
      }
    }
  }
}

// detects sound and checks distance 
function heardBark(dog, sheep){
  // change display based on if it is in radius of dog 
  micLevel = mic.getLevel();
  
  // holds the radius and whether player is barking
  var radius = 0;
  var isBarking = false;
  
  // if(micLevel >= 0.2 && micLevel <= 0.4){
  if(micLevel > 0.05 && micLevel <= 0.1){
    radius = 100;
    isBarking = true;
    dogGlow(dog,radius,isBarking);
    if(dist(dog.x, dog.y, sheep.x, sheep.y) < radius){
      moveAway(dog, sheep);
    }
  }
  // else if(micLevel > 0.4 && micLevel <= 0.6){
  else if(micLevel > 0.1 && micLevel <= 0.2){
    radius = 125;
    isBarking = true;
    dogGlow(dog,radius,isBarking);
    if(dist(dog.x, dog.y, sheep.x, sheep.y) < radius){
       moveAway(dog, sheep);
    }
  }
  // else if(micLevel > 0.6 && micLevel <= 0.8){
  else if(micLevel > 0.2 && micLevel <= 0.3){
    radius = 150;
    isBarking = true;
    dogGlow(dog,radius,isBarking);
    if(dist(dog.x, dog.y, sheep.x, sheep.y) < radius){
      moveAway(dog, sheep);
    }
  }
  else{
    isBarking = false;
    radius = 0;
    dogGlow(dog,radius,isBarking);
  }
}

var fillOpacity = 0;
var ellipseRadius = 0;

// draws a glowing yellow globe/ball around dog when barking is picked up
function dogGlow(dog, radius, isBarking){
  if(isBarking){
    if(ellipseRadius < radius){ // constrain the radius of the glow ball
      fill(255,255,fillOpacity); // get shades of yellow by changing the blue color values and setting red and green to 255
      stroke(255,255,fillOpacity);
      ellipse(dog.x,dog.y,ellipseRadius,ellipseRadius);
      
      fillOpacity += 10;
      ellipseRadius += 5;
    }
    else{
        fillOpacity = 0;
        ellipseRadius = 0;
    }
  }
  else{
    fillOpacity = 0;
    ellipseRadius = 0;
  }
}

// check if player has won
function doYouWin(){
  if (sheeps.length === 0 && timeLeft > 0){
    return true;
  }
  else{
    return false;
  }
}

// game over events
function gameOver(){
  // increment one second per frame (assume 60 frames per second)
  timePassed += 1;
  if(timePassed == 6000){
    // set start to false and end to true so draw no longer runs the game
    start = false;
    end = true;
    showEnd = true; // true when end image to be shown
  }
  
  // show end screen
  if(showEnd || sheeps.length == 0){
    imageMode(CORNER);
    // reset background image according to results of game
    image(endscreen,0,0,canvasWidth,canvasHeight);
    if(doYouWin()){
      stroke(255,209,5);
      fill(255,224,20);
      strokeWeight(3);
      textSize(100);
      text("YOU WIN!",canvasWidth*0.05,canvasHeight*0.04);
    }
    else{
      stroke(255,209,5);
      fill(255,224,20);
      strokeWeight(3);
      textSize(100);
      text("YOU LOSE.",canvasWidth*0.05,canvasHeight*0.04);
    }
  }
}   
    
//This function displays start screen
function startScreen(){
  // play sound if not playing
  if (sound.isPlaying() === false){
    sound.play();
  }
  timeLeft = 6000;
  
  imageMode(CORNER);
  image(startscreen,0,0,canvasWidth,canvasHeight);
  
  drawButton(mouseX,mouseY);
  
  fill(255, 255, 151);
  textSize(150);
  textFont(richFont);
  stroke(255, 255, 151);
  strokeWeight(5);
  fill(0);
  text("Sheep Heard-er!", canvasWidth/2, canvasHeight/10);
}

//This function checks if start button is hovered over or pressed
function drawButton(testX, testY){
  
   // Start button
  rectMode(CENTER);
  fill(224,255,255); // blue-white
  stroke(116,209,23); // green
  strokeWeight(5);
  rect(startButtonX, startButtonY, 120, 90);
    
  // start text
  textSize(26);
  fill(116,209,23); // green
  stroke(224,255,255); // blue-white
  strokeWeight(1);
  textStyle(BOLD);
  textSize(47);
  textAlign(CENTER,CENTER);
  text("START",startButtonX,startButtonY);
  
 if(testX > startButtonX-45 && testX < startButtonX+45 && testY > startButtonY-45 && testY < startButtonY+45){
    // drawing button
    fill(116,209,23); //green
    stroke(224,255,255); // blue-white
    strokeWeight(5);
    rect(startButtonX, startButtonY, 120, 90);
    
    // text
    fill(224,255,255);
    strokeWeight(1);
    textSize(47);
    textStyle(BOLD);
    textAlign(CENTER,CENTER);
    text("START",startButtonX,startButtonY);
    
    //if start button is pressed, game starts
    if(mouseIsPressed == true){
      start = true;
      sound.stop();
    }
    
  }
}

// objects to hold positions of the dog and sheep sprite within a larger image to determine which image to use
var SheepUp1 = {
  xpos: 50,
  ypos: 40,
  w: 27,
  h: 47
}

var SheepUp2 = {
  xpos:178,
  ypos:42,
  w:27,
  h:45
}

var SheepUp3 = {
  xpos: 434,
  ypos: 44,
  w: 27,
  h: 43
}

var SheepUp4 = {
  xpos: 306,
  ypos: 45,
  w: 27,
  h: 42
}

var SheepLeft1={
  xpos: 37,
  ypos: 172,
  w: 49,
  h: 39
}

var SheepLeft2={
  xpos:163, 
  ypos:177,
  w:51,
  h:34
}

var SheepLeft3={
  xpos:289,
  ypos:179,
  w:53,
  h:32
}

var SheepLeft4={
  xpos:417, 
  ypos:179,
  w:53,
  h:32
}

var SheepDown1={
  xpos:50, 
  ypos:304,
  w:27,
  h:39
}

var SheepDown2={
  xpos:178, 
  ypos:304,
  w:27,
  h:39
}

var SheepDown3={
  xpos:306, 
  ypos:304,
  w:27,
  h:44
}

var SheepDown4={
  xpos:434, 
  ypos:304,
  w:27,
  h:44
}

var SheepLeft1={
  xpos:42, 
  ypos:428,
  w:49,
  h:39
}

var SheepLeft2={
  xpos:170, 
  ypos:433,
  w:51,
  h:34
}

var SheepLeft3={
  xpos: 298,
  ypos: 435,
  w: 53,
  h: 32
}

var SheepLeft4={
  xpos: 426,  
  ypos: 435,
  w:53,
  h:32
}

var DogDown1={
  xpos:8,
  ypos:22,
  w:32,
  h:40
}

var DogDown2={
  xpos:104,
  ypos:22,
  w:32,
  h:40
  
}

var DogDown3={
  xpos:56,
  ypos:22,
  w:32,
  h:40
}

var DogDown4={
  xpos:8,
  ypos:22,
  w:32,
  h:40
}

var DogLeft1={
  xpos: 8,
  ypos: 84,
  w:32,
  h:42
}

var DogLeft2={
  xpos: 104,
  ypos: 84,
  w:32,
  h:42
  
}

var DogLeft3={
  xpos: 56,
  ypos: 86,
  w: 30,
  h:40
}

var DogLeft4={
  xpos: 152,
  ypos:86,
  w:30,
  h:40
  
}

var DogRight1={
  xpos: 8,
  ypos:148,
  w: 32,
  h:42
  
}

var DogRight2={
  xpos: 104,
  ypos: 148,
  w:32,
  h:42
  
}

var DogRight3={
  xpos: 58,
  ypos:150,
  w:30,
  h:40
  
}

var DogRight4={
  xpos:154,
  ypos:150,
  w:30,
  h:40
}

var DogUp1={
  xpos:8,
  ypos:212,
  w:32,
  h:42
  
}

var DogUp2={
  xpos: 56,
  ypos:212,
  w:32,
  h:42
}

var DogUp3={
  xpos:104,
  ypos:212,
  w:32,
  h:42
  
}

var DogUp4={
  xpos:152,
  ypos:212,
  w:32,
  h:42
  
}
