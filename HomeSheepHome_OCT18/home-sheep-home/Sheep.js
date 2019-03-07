function Sheep(sheepParas, world) {
  //store this sheep's name
  this.name = sheepParas.name;

  //width & height of sheep image
  this.w = sheepParas.w;
  this.h = sheepParas.h;

  // ear length of the sheep's image
  // store this to adjust left&right sensors' position - to correctly reflect sheep's position
  this.ear = sheepParas.ear;

  // wool thickness on sheep's back
  // eliminates blank space on upper edge of image - optimizes sheep-on-sheep visual effect
  this.wool = sheepParas.wool;

  // sheep's weight & strength
  // determines which sheep can carry which other sheep(s) around
  this.weight = sheepParas.weight;
  this.strength = sheepParas.strength;

  this.carrys = sheepParas.carrys;

  // amount of weight this sheep is carrying
  this.carrying = [];
  this.burden = 0;

  // store the player position
  this.x = sheepParas.x;
  this.y = sheepParas.y;

  // set up holders for all of our walk cycle images
  this.leftCycle = [];
  this.rightCycle = [];
  this.jumpCycleR = [];
  this.jumpCycleL = [];

 //number of frames in this sheep's jumpCycle
  this.jumpNum = sheepParas.jumpNum;

  // set up holders for all of this sheep's sounds
  this.voices = [];
  this.jumpSounds = [];
  this.walkSound;

  // store a reference to our "world" object - we will ask the world to tell us about
  // tiles that are in our path
  this.world = world;

  // // load & store our artwork
  for(var f=1; f<=6; f++){
    var img_filename = f + ".png";
    this.rightCycle.push( loadImage("sheep/" + this.name + "/right/" + img_filename) );
    this.leftCycle.push( loadImage("sheep/" + this.name + "/left/" + img_filename) );
  }


  for(var g=1; g<=this.jumpNum; g++){
    var img_filename = g + ".png";
    this.jumpCycleR.push( loadImage("sheep/" + this.name + "/jump-right/" + img_filename) ); // right
    this.jumpCycleL.push( loadImage("sheep/" + this.name + "/jump-left/" + img_filename) ); // left
  }

  // assume we are pointing to the right
  this.currentImage = 0;

  //variable to keep track of our current cycle
  this.currentCycle = this.rightCycle;


  //load & store our sounds + set playModes & volumes----------------------------------------------------------> sounds
  //voices
  for(var v=0; v<=2; v++){
    var v_filename = "v" + v + ".mp3";
    this.voices.push( loadSound("aud/" + this.name + "/" + v_filename) );
    this.voices[v].playMode('untilDone');
  }
  //jumping sounds
  for(var j=0; j<=2; j++){
    var j_filename = "j" + j + ".mp3";
    this.jumpSounds.push( loadSound("aud/" + this.name + "/" + j_filename) );
    this.jumpSounds[j].playMode('untilDone');
  }
  //walking sound
  this.walkSound = loadSound("aud/" + this.name + "/w.mp3");
  this.walkSound.playMode('untilDone');

    // set sound volumes if needed
    if(this.name=='shirley'){
      this.walkSound.setVolume(0.6);
      this.voices[0].setVolume(2);
      this.voices[1].setVolume(0.2);
      this.voices[2].setVolume(1.2);
    } else {
      this.walkSound.setVolume(0.7);
    }

  // define our desired movement speed
  this.speed = sheepParas.speed;

  // define our falling speed
  // initial fall speed - 3
  this.fallSpeed = 3;

  // define our jumping power
  this.jumpPower = sheepParas.jumpPower;

  // did this sheep pass this level? (arrive at the left end of the screen & touch trigger tile)
  this.pass = false;

  // display our player
  this.display = function() {
    imageMode(CORNER);
    image(this.currentCycle[ this.currentImage ], this.x, this.y, this.w, this.h);
  }

  // display "sensor" positions
  this.displaySensor = function(direction) {
    fill(255);
    if (direction == "up") {
      ellipse(this.top[0], this.top[1], 20, 20);
    } else if (direction == "down") {
      ellipse(this.bottom[0], this.bottom[1], 20, 20);
    } else if (direction == "right" && this.name == "timmy") {
      ellipse(this.right[0], this.right[1], 20, 20);
    } else if (direction == "left" && this.name == "timmy") {
      ellipse(this.left[0], this.left[1], 20, 20);
    } else if (direction == "right" && this.name != "timmy") {
      ellipse(this.rightT[0], this.rightT[1], 20, 20);
      ellipse(this.rightB[0], this.rightB[1], 20, 20);
    } else if (direction == "left" && this.name != "timmy") {
      ellipse(this.leftT[0], this.leftT[1], 20, 20);
      ellipse(this.leftB[0], this.leftB[1], 20, 20);
    }
  }

  // set our sensor positions (computed based on the position of the character and the
  // size of our graphic)
  this.refreshSensors = function() {
    // timmy is small, so it only needs 1 sensor on both right & left sides
    if(this.name == "timmy"){
      this.left = [this.x + this.ear, this.y + this.h / 2];
      this.right = [this.x + this.w - this.ear, this.y + this.h / 2];
    } else {
      //Shirley & Shaun are bigger, so they need 2 sensors on both right & left sides
      this.leftT = [this.x + this.ear, this.y + this.h / 3];
      this.leftB = [this.x + this.ear, this.y + this.h * 2 / 3];
      this.rightT = [this.x + this.w - this.ear, this.y + this.h / 3];
      this.rightB = [this.x + this.w - this.ear, this.y + this.h * 2 / 3];
    }

    this.top = [this.x + this.w / 2, this.y];
    this.bottom = [this.x + this.w / 2, this.y + this.h];

  }

  // display a pointer over the sheep when it's active
  this.displayPointer = function(){
    noStroke();
    fill(200);
    triangle(this.x+this.w/2, this.y+this.wool-20, this.x+this.w/2-10, this.y+this.wool-30, this.x+this.w/2+10, this.y+this.wool-30 );
  }


  // move our character
  this.move = function() { //------------------------------------------------------------------------->beginning of .move
    // refresh our "sensors" - these will be used for movement & collision detection
    this.refreshSensors();

    // apply gravity to us every frame!
    // get the tile below us

    var belowTile = world.getTile(this.bottom[0], this.bottom[1]);

    var onSheep = this.isOnSheep(this.name, this.bottom[0], this.bottom[1]);

    //calculate total burden this sheep has
    this.burden = getSum(this.carrying);

    // is below tile solid / is this sheep on top of another sheep?
    if (!world.isTileSolid(belowTile) && !onSheep) {
      // apply gravity
      this.fallSpeed += world.gravity;

      // make sure that gravity doesn't get too out of control
      this.fallSpeed = constrain(this.fallSpeed, 0, world.gravityMax);

      // update position based on fall speed
      this.y += this.fallSpeed;
    }
    // otherwise it is solid - stop falling
    else {
      this.fallSpeed = 0;
    }

    // decrease jump power, if necessary
    this.jumpPower -= world.gravity;
    if (this.jumpPower < 0) {
      this.jumpPower = 0;
    }

    // apply jump power
    this.y -= this.jumpPower;

    // see if one of our movement keys is down -- if so, we should try and move
    // note that this character responds to the following key combinations:
    // WASD
    // wasd
    // The four directional arrows
    // only loop image frames when one of the movement keys is down
    // +In need: Move/don't move according to burden & weight(strength) ---------->
    if(keyIsPressed){
      if (keyIsDown(LEFT_ARROW) || keyIsDown(97) || keyIsDown(65)) {

        // In need: different checking methods for timmy & shirley/shaun ----------------------------------------------------->*

        // see if tile(s) is to our left is solid

        var leftIsClear = false;

        if(this.name=="timmy"){
          var tile = world.getTile(this.left[0], this.left[1]);
          leftIsClear = !world.isTileSolid(tile);

        } else { // for shirley & shaun, who have 2 sensors
          var tileT = world.getTile(this.leftT[0], this.leftT[1]);
          var tileB = world.getTile(this.leftB[0], this.leftB[1]);

          //when both sensors detect non-solid tile
          if( !world.isTileSolid(tileT) && !world.isTileSolid(tileB) ){
            leftIsClear = true;
          }
        }


        // would moving this way touch the nextLevel-triggering tiles?
        var triggered = false;

        if(this.name=="timmy"){
          triggered = world.isTileTrigger(tile);
        } else {
          if( world.isTileTrigger(tileT) || world.isTileTrigger(tileB)){
            triggered = true;
          }
        }

        if ( triggered ){
          // In need of a var for all three sheep
          this.pass = true;

          // Check if all three sheep has passed current level
          if(Shirley.pass && Shaun.pass && Timmy.pass){
            // play passing level music
            passMusic.play();
            scoreOn = true;

            // ask the world to change level * After 5 seconds ----------------------------------------------------->*
            setTimeout(world.changeLevel, 3000);

            //world.changeLevel();//param?
          }
        }

        // If not triggered - is this tile solid?
        else if ( leftIsClear && this.burden<=this.strength) {
          // move
          this.x -= this.speed;

          // sheep on this sheep's back be carried along
          for(var k=0; k<this.carrying.length; k++){
            if( this.carrying[k] == 1 ){
              Timmy.x -= this.speed;

            } else if ( this.carrying[k] == 2 ){
              Shaun.x -= this.speed;

              // Check if Shaun is carrying Timmy, if so, carry along
              if(Shaun.carrying!=[] ){
                for(var q=0; q<Shaun.carrying.length; q++){
                  if(Shaun.carrying[q] == 1){
                    Timmy.x -= this.speed;
                  }
                }
              }

            }
          }

        }// otherwise it's a solid tile

        // change artwork
        this.currentCycle = this.leftCycle;

        //every 10 frames, update to the next GIF frame
        if (keyIsPressed && frameCount % 5 == 0) {
          this.currentImage += 1;
          // cycle around to the beginning of the walk cycle, if necessary
          if (this.currentImage >= 6) {
            this.currentImage = 0;
          }
        }

        //play walking sound
        this.walkSound.play();

        //this.displaySensor("left");
      }


      if (keyIsDown(RIGHT_ARROW) || keyIsDown(100) || keyIsDown(68)) {

        // see if tile(s) is to our right is solid

        var rightIsClear = false;

        if(this.name=="timmy"){
          var tile = world.getTile(this.right[0], this.right[1]);
          rightIsClear = !world.isTileSolid(tile);

        } else { // for shirley & shaun, who have 2 sensors
          var tileT = world.getTile(this.rightT[0], this.rightT[1]);
          var tileB = world.getTile(this.rightB[0], this.rightB[1]);

          //when both sensors detect non-solid tile
          if( !world.isTileSolid(tileT) && !world.isTileSolid(tileB) ){
            rightIsClear = true;
          }
        }


        // would moving this way touch the nextLevel-triggering tiles?
        var triggered = false;

        if(this.name=="timmy"){
          triggered = world.isTileTrigger(tile);
        } else {
          if( world.isTileTrigger(tileT) || world.isTileTrigger(tileB)){
            triggered = true;
          }
        }

        if ( triggered ){
          // In need of a var for all three sheep
          this.pass = true;

          // Check if all three sheep has passed current level
          if(Shirley.pass && Shaun.pass && Timmy.pass){
            // play passing level music
            passMusic.play();
            scoreOn = true;

            // ask the world to change level * After 5 seconds ------------------------------------------------------>
            //var worldVar = world;
            //setTimeout( function(){ world.changeLevel() }, 3000);

            world.changeLevel();
          }
        }

        // is this tile solid?
         else if ( rightIsClear && this.burden<=this.strength) {
          // move
          this.x += this.speed;


          for(var k=0; k<this.carrying.length; k++){
            if( this.carrying[k] == 1 ){
              Timmy.x += this.speed;
            } else if ( this.carrying[k] == 2 ){
              Shaun.x += this.speed;
              // Check if Shaun is carrying Timmy, if so, carry along
              if(Shaun.carrying!=[] ){
                for(var q=0; q<Shaun.carrying.length; q++){
                  if(Shaun.carrying[q] == 1){
                    Timmy.x += this.speed;
                  }
                }
              }
            }
          }


        }

        // change artwork
        this.currentCycle = this.rightCycle;
        if (!keyIsDown(87) && frameCount %  5 == 0) {
          this.currentImage += 1;
        }
        // cycle around to the beginning of the walk cycle, if necessary
        if (this.currentImage >= 6) {
          this.currentImage = 0;
        }

        //play walking sound
        this.walkSound.play();

        //this.displaySensor("right");
      }

      // note that the "up' arrow now controls jumping and does not cause the character to
      // directly move up
      if (keyIsDown(UP_ARROW) || keyIsDown(119) || keyIsDown(87)) {
        // see which tile is below us
        var tile = world.getTile(this.top[0], this.top[1]);

        // see if the tile below us is solid || if we're on top of another sheep
        if (world.isTileSolid(belowTile) || onSheep) {
          // give us some jumping power
          this.jumpPower = sheepParas.jumpPower;
        }

        // is the tile above solid? is this sheep carrying more that it can move?
        if (world.isTileSolid(tile) || this.strength<this.burden ) {
          // negate jump power
          this.jumpPower = 0;
        }


        // change artwork
        if (this.currentCycle==this.leftCycle){
          this.currentCycle = this.jumpCycleL;
        } else if (this.currentCycle==this.rightCycle){
          this.currentCycle = this.jumpCycleR;
        }

        //every 10 frames, update to the next GIF frame
        if (keyIsPressed && frameCount % 5 == 0) {
          this.currentImage += 1;

          // cycle around to the beginning of the walk cycle, if necessary
          if (this.currentImage >= this.jumpNum) {
            this.currentImage = 0;
          }
        }

        //play sound
        this.jumpSounds[0].play();

        //this.displaySensor("up");
      }
      // when up key isn't pressed, don't play jumping sound
      else{
        //this.jumpSounds[2].pause();
      }
    }

    //when no key is pressed, sheep should stand still as the frame 1 & walking sound stops (pauses)
    else {
        this.currentImage = 0;
        this.walkSound.pause();
    }
  } //----------------------------------------------------------------------------------------------->end of .move



  //Checker method: isOnSheep function - return boolean value ----------------------------------------------------------------->
  this.isOnSheep = function(id, x, y){
    for(var s=0; s<=2; s++){
      if(s!=S_idx){ // for every OTHER sheep
        //Check if this sheep's bottom is within a slim rectangular area on top of the other sheep's back
        if(x >= Sheeps[s].x + Sheeps[s].w*0.1 && x <= Sheeps[s].x+Sheeps[s].w*0.9 && y >= Sheeps[s].y+Sheeps[s].wool && y <= Sheeps[s].y+Sheeps[s].wool+5 ){
          if( !(Sheeps[s].carrys[S_idx]) ) {
            Sheeps[s].carrying.push( this.weight );
            //console.log(Sheeps[s].name,Sheeps[s].carrying);
            Sheeps[s].carrys[S_idx] = true;
          }
          return true;
        }
      }
    }

    //Otherwise - remove this sheep from bottom sheep's 'carrying' array
    for(var s=0; s<=2; s++){
      if(s!=S_idx){
        if( !(x >= Sheeps[s].x && x <= Sheeps[s].x+Sheeps[s].w && y >= Sheeps[s].y+Sheeps[s].wool && y <= Sheeps[s].y+Sheeps[s].wool+5) ){
          for(var e=0; e<Sheeps[s].carrying.length; e++){
          //console.log("entered for loop");
          if( Sheeps[s].carrying[e] == this.weight){
              Sheeps[s].carrying.splice(e,1);
              e--;
              //console.log("deleted item");
            }
          }
          Sheeps[s].carrys[S_idx] = false;
        }
      }
    }
    //otherwise this sheep is not on top of any other sheep - return false
    return false;
  }

}

function getSum(array){
  var sum = 0;
  for(var n=0; n<array.length; n++){
    sum+=array[n];
  }
  return sum;
}
