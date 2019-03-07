// SPECIAL NOTE: This program uses a number of external JavaScript files to organize some of
// the objects that we need to fully implement a tile-based game.  These JavaScript files
// are referenced in the HTML document.  References to these documents are also included
// as comments within this file.

// our world object - this object handles our tiles, drawing the world and converting screen
// coordinates into game coordinates - see SideViewWorld.js for more information
var theWorld;

// create an object to hold our "world parameters" - we will send this object into our
// OverheadWorld to tell it how our world is organized
var worldParameters = {
  tileSize: 50,
  tileFolder: 'tiles',
  numTiles: 32,
  solidTiles: {3:true,4:true,5:true,6:true,7:true,8:true,9:true,10:true,
                11:true,12:true,13:true,14:true,15:true,16:true,17:true,
                20:true,21:true,22:true,24:true,26:true,28:true},

  triggerTiles: {2:true,17:true,18:true},
  gravity: 0.1,
  gravityMax: 5
};

// some variables to store general sounds
var startMusic;
var passMusic;

// some fonts
var fontA, fontB, fontC;

// some images
var bg, arrowImg;
var arrowParas ={
  x:700,
  y:400,
  w:100,
  h:65
}
var cursorImg;
var gameStarted;

// our user controlled character object - see Sheep.js for more information
// our sheep
var Shirley, Shaun, Timmy;
var Sheeps = [];

//initial active sheep
var S_idx = 0;

// sheep params
var shirleyParas = {
  name: "shirley",
  x: 100,
  y: 330,
  w: 120,
  h: 84,
  ear: 16,
  wool: 6,
  speed: 2.5,
  jumpPower: 5,
  jumpNum: 11,
  weight: 3,
  strength: 3,
  carrys:{1:false,2:false}
}

var  shaunParas = {
  name: "shaun",
  x: 180,
  y: 320,
  w: 110,
  h: 83,
  ear: 20,
  wool: 20,
  speed: 3,
  jumpPower: 7,
  jumpNum: 12,
  weight: 2,
  strength: 2,
  carrys:{0:false,2:false}
}

var  timmyParas = {
  name: "timmy",
  x: 60,
  y: 360,
  w: 72,
  h: 40,
  ear: 20,
  wool: 3,
  speed: 3,
  jumpPower: 5.2,
  jumpNum: 10,
  weight: 1,
  strength: 1,
  carrys:{0:false,1:false}
}

// current mode of the game - startPage / play / ...
var theMode;

// boolean variable controlling 'level compelete' page
var scoreOn;

// our canvas holder
var cnv;

// handle the tile loading and creating our Sheep object in preload before the game can start
function preload() {
  //load in our level data
  levelData = loadJSON("data/levels.json");

  //create the world
  theWorld = new SideViewWorld(worldParameters);

  //create the sheep
  //paras - name,x,y,w,h,ear,wool,speed,jumpPower,weight,strength,worldparas
  Shirley = new Sheep(shirleyParas, theWorld);
  Shaun = new Sheep(shaunParas, theWorld);
  Timmy = new Sheep(timmyParas, theWorld);

  startMusic = loadSound("aud/startMusic.mp3");
  passMusic = loadSound("aud/passMusic.mp3");

  fontA = loadFont("assets/sketch-coursive.ttf");
  fontB = loadFont("assets/the-skinny.otf");
  fontC = loadFont("assets/the-skinny-bold.otf");

  bg = loadImage("img/bg.png");
  arrowImg = loadImage("img/arrow.png");
  cursorImg = loadImage("img/cursor.svg");

}

//In need of level switching system


function setup() {
  cnv = createCanvas(1000,600);
  cnv.parent('cnvDiv');

  //put references to all sheep into an array
  Sheeps = [Shirley,Shaun,Timmy];

  //send level data to world object &
  //let our world know which level to begin withi
  theWorld.setupLevels(levelData, "level1");

  startMusic.playMode('untilDone');
  passMusic.playMode('untilDone');

  theMode = "startPage";
  gameStarted = false;
  scoreOn = false;

  noCursor();
}


function draw() {

  //start page
  if(theMode=="startPage"){
    image(bg,0,0,1000,600);
    fill(60);
    textAlign(CENTER);
    textSize(140);
    textFont(fontB);
    text("Home Sheep Home", width*0.5, height*0.45);
    //startMusic.play();
    image(arrowImg,arrowParas.x,arrowParas.y,arrowParas.w,arrowParas.h);
    image(Shirley.rightCycle[0], arrowParas.x-150,arrowParas.y-20,130,98);

    //cursor
    image(cursorImg,mouseX+3,mouseY+10,30,30);
  }

  //game mode
  if(theMode=="play"){

    theWorld.displayWorld();

    //only move the chosen sheep & display a pointer above it
    Sheeps[S_idx].move();
    Sheeps[S_idx].displayPointer();

    Shirley.display();
    Shaun.display();
    Timmy.display();

    //cursor
    image(cursorImg,mouseX+3,mouseY+10,30,30);
  }

  if(scoreOn){
    noStroke();
    fill(255,95);
    rect(25, 25, width-50, height-50);
    fill(60);
    textAlign(CENTER);
    textSize(140);
    textFont(fontC);
    text("LEVEL\nCOMPLETE!", width*0.5, height*0.4);
  }

  //cursor
  image(cursorImg,mouseX+3,mouseY+10,30,30);

}


//sheep switching system
function keyPressed(){
  if (keyCode===49){
    random( Shirley.voices ).play();
    S_idx = 0;
  } else if (keyCode===50){
    random( Shaun.voices ).play();
    S_idx = 1;
  } else if (keyCode===51){
    random( Timmy.voices ).play();
    S_idx = 2;
  }
}

function mousePressed(){
    if( !gameStarted && mouseX>=arrowParas.x && mouseX<=arrowParas.x+arrowParas.w && mouseY>=arrowParas.y+10 && mouseY<=arrowParas.y+arrowParas.h-10 ){
      theMode = "play";
      startMusic.play();
      gameStarted = true;
    }

    // restart level
    if( theWorld.getTile(mouseX, mouseY)==2 ){
      Shirley.x=100;
      Shirley.y=320;
      Shaun.x=180;
      Shaun.y=320;
      Timmy.x=60;
      Timmy.y=360;
      startMusic.play();
    }

}
