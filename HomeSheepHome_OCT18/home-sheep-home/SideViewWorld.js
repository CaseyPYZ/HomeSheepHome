function SideViewWorld(params) {
  // store our desired tile size
  this.tileSize = params.tileSize;

  // store the folder in which all of our tiles are stored
  this.tileFolder = params.tileFolder;

  // store how many tiles we are working with
  this.numTiles = params.numTiles;

  // store an object that defines which tiles are solid
  this.solidTiles = params.solidTiles;

  // store an object that defines which tiles are trigger tiles
  this.triggerTiles = params.triggerTiles;

  // an array to hold all tile graphics
  this.tileLibrary = [];

  // store gravity information
  this.gravity = params.gravity;
  this.gravityMax = params.gravityMax;

  // load in all tile graphics
  for (var i = 0; i < this.numTiles; i++) {
    var tempTile = loadImage(this.tileFolder + "/" + i + ".png");
    this.tileLibrary.push(tempTile);
  }


  // setupLevels: set up levels
  this.setupLevels = function(data, startLevel){
    //store level data
    this.levelData = data;

    //know what's our start level
    this.levelCurrent = startLevel;

    //extract the tile map of our start level
    this.tileMap = this.levelData[this.levelCurrent].map;
  }



  // changeLevel: changes level
  this.changeLevel = function(){
    // update current level var to next level
    this.levelCurrent = this.levelData[this.levelCurrent].next;

    // extract tile map for next level & update world's tileMap var
    this.tileMap = this.levelData[this.levelCurrent].map;

    // reposition characters - according to each level&sheep's starting position in data.json
    Shirley.x = this.levelData[this.levelCurrent]["startPos"]["shirley"][0];
    Shaun.x = this.levelData[this.levelCurrent]["startPos"]["shirley"][0];
    Timmy.x = this.levelData[this.levelCurrent]["startPos"]["timmy"][0];

    // reset charater's 'pass' var
    Shirley.pass = false;
    Shaun.pass = false;
    Timmy.pass = false;

    // play level begin music
    //startMusic.play();

    //turn off score / congrats display
    scoreOn = false;
  }



  // displayWorld: displays the current world
  this.displayWorld = function() {
    for (var row = 0; row < this.tileMap.length; row += 1) {
      for (var col = 0; col < this.tileMap[row].length; col += 1) {
        image(this.tileLibrary[ this.tileMap[row][col] ], col*this.tileSize, row*this.tileSize, this.tileSize, this.tileSize);
      }
    }
  }


  // displayTile: draws a single tile at a specified location
  this.displayTile = function(id, x, y) {
    image(this.tileLibrary[id], x, y);
  }


  // get a tile based on a screen x,y position
  this.getTile = function(x, y) {
    // convert the x & y position into a grid position
    var col = Math.floor(x/this.tileSize);
    var row = Math.floor(y/this.tileSize);

    // if the computed position is not in the array we can send back a -1 value
    if (row < 0 || row >= this.tileMap.length || col < 0 || col >= this.tileMap[row].length) {
      return -1;
    }

    // get the tile from our map
    return this.tileMap[row][col];
  }


  // see if this tile is solid
  this.isTileSolid = function(id) {
    if (id in this.solidTiles || id == -1) {
      return true;
    }
    // otherwise return false
    return false;
  }


  // see if this  tile is a trigger tile
  this.isTileTrigger = function(id) {
    if (id in this.triggerTiles && this.levelData[this.levelCurrent].next != "none"){
        return true;
    }
    return false;
  }



}
