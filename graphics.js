// coordinates of joystick area
const JOYSTICK_CENTER_X = 450;
const JOYSTICK_CENTER_Y = 725;
const JOYSTICK_AREA_SIZE = 250;
const JOYSTICK_CENTER = new Coord(JOYSTICK_CENTER_X, JOYSTICK_CENTER_Y);

// coordinates of particle area
const PARTICLE_CENTER_X = 325;
const PARTICLE_CENTER_Y = 280;
const PARTICLE_AREA_SIZE = 500;
const PARTICLE_CENTER = new Coord(PARTICLE_CENTER_X, PARTICLE_CENTER_Y);

// barcode display parameters
const BARCODE_HEIGHT = 50;
const FRAME_WIDTH = 2;


//gives angle of current vector
var arrowAngle;

//NOTE: *what* is being dragged depends on controlMode
var dragging = false;

var draggingParticle = false;
var draggingJoystick = false;

// current coordinates of joystick and particle (start centered)
var joystickX = JOYSTICK_CENTER_X;
var joystickY = JOYSTICK_CENTER_Y;
var particleX = PARTICLE_CENTER_X;
var particleY = PARTICLE_CENTER_Y;

// ?
var indicator = 150;

var myColor = 0;
var myBrightness = 255;
var mySaturation = 255;

var clearButtonColor = 200;

//states
var drawPath = true;
var useColor = false;
var useBrightness = false;

var drawVector = true;

var snapToZero = true;

//where are we controlling from?
const DRAGGINGMODE = 0; // directly controlling the particle
const JOYSTICKMODE = 1; // using joystick to set velocity of the particle
const PLAYBACKMODE = 2; // moving the particle based on a recorded barcode

var controlMode = JOYSTICKMODE;

//variables for driving with particle
var myMagnitude = 0;

var playheadCoord;

function drawUI(){
    //subdividing regions
    rectMode(CORNERS);
    noStroke();

    //particle, upper left
    fill(175,175,190);
    rect(0,0,650,575);

    //control, lower left
    fill(140,160,140);
    rect(0,575,650,height);

    //timeline
    fill(180,150,180);
    rect(650,575,width,height);


    //draw menu toggles
    drawMenu();
    rectMode(CENTER);

    //draw stage for particle
    fill(225,225,220);
    noStroke();

    rect(PARTICLE_CENTER_X,PARTICLE_CENTER_Y,PARTICLE_AREA_SIZE,PARTICLE_AREA_SIZE);

    //stage coordinate system
    noFill();
    stroke(150);
    strokeWeight(2);
    line(PARTICLE_CENTER_X,PARTICLE_CENTER_Y-(PARTICLE_AREA_SIZE/2),
	 PARTICLE_CENTER_X,PARTICLE_CENTER_Y+(PARTICLE_AREA_SIZE/2));
    line(PARTICLE_CENTER_X-(PARTICLE_AREA_SIZE/2),PARTICLE_CENTER_Y,
	 PARTICLE_CENTER_X+(PARTICLE_AREA_SIZE/2),PARTICLE_CENTER_Y);
    ellipse(PARTICLE_CENTER_X,PARTICLE_CENTER_Y,200,200);

    //draw control box
    fill(50);
    noStroke();
    rect(JOYSTICK_CENTER_X,JOYSTICK_CENTER_Y,JOYSTICK_AREA_SIZE,JOYSTICK_AREA_SIZE);

    noFill();
    stroke(225,225,220);
    ellipse(JOYSTICK_CENTER_X,JOYSTICK_CENTER_Y,100,100);

    colorMode(HSB,255);

    if (useBrightness){
        noFill();
        for (i=0;i<25;i++){
            for (j=0;j<64;j++){
                if ((15*i)<255){
                    stroke(4*j,255,15*i);
                } else {
                    stroke(4*j,500-(15*i),15*i);
                }
                arc(JOYSTICK_CENTER_X, JOYSTICK_CENTER_Y,
		    10*i, 10*i, PI + j*TWO_PI/64, PI + (j+1)*TWO_PI/64);
            }
        }
    }

    push();
    translate(JOYSTICK_CENTER_X,JOYSTICK_CENTER_Y);

    //pos. x-axis
    stroke(128,255,255);
    line(0,0,JOYSTICK_AREA_SIZE/2,0);
    
    //quad 1 diagonal
    stroke(160,255,255);
    line(0,0,JOYSTICK_AREA_SIZE/2,JOYSTICK_AREA_SIZE/2);
    
    //pos y-axis
    stroke(192,255,255);
    line(0,0,0,JOYSTICK_AREA_SIZE/2);
    
    //quad 2 diagonal
    stroke(224,255,255);
    line(0,0,-JOYSTICK_AREA_SIZE/2,JOYSTICK_AREA_SIZE/2);
        
    //neg. x-axis
    stroke(0,255,255);
    line(0,0,-JOYSTICK_AREA_SIZE/2,0);
    
    //quad 3 diagonal
    stroke(32,255,255);
    line(0,0,-JOYSTICK_AREA_SIZE/2,-JOYSTICK_AREA_SIZE/2);  
    
    //neg. y-axis
    stroke(64,255,255);
    line(0,0,0,-JOYSTICK_AREA_SIZE/2);
    
    //quad 4 diagonal
    stroke(96,255,255);
    line(0,0,JOYSTICK_AREA_SIZE/2,-JOYSTICK_AREA_SIZE/2);
    
    pop();
}

function drawJoystickPosition(){
    let sat = 255;
    let bri = 255;
    if (useBrightness) {
	sat = mySaturation;
	bri = myBrightness;
    }
    noFill();
    stroke(myColor, sat, bri);

    line(JOYSTICK_CENTER_X,JOYSTICK_CENTER_Y,joystickX,joystickY);

    strokeWeight(2);
    stroke(220);
    if(dist(joystickX,joystickY,JOYSTICK_CENTER_X,JOYSTICK_CENTER_Y) < 5){
        fill(0);    
    }else{
        fill(myColor, sat, bri);
    }
    ellipse(joystickX,joystickY,15,15);
}

function drawParticlePath(){
    strokeWeight(7);
    strokeCap(ROUND);
    
    let pathEnd = min(tracer.length()-1, playhead);
    if (pathEnd < 0) {
	return;
    }

    let previous = pathstart;
    for(i=0; i<pathEnd; i++){
	let frame = tracer.getFrame(i);
        if(useColor&&useBrightness){
            stroke(frame.getColor(),frame.getBrightness(),frame.getSaturation());
        }else if(useColor){
            stroke(frame.getColor(),255,255);
        }else{
            stroke(50);
        }
	let newpos = frame.applyAsVelocity(previous);
        line(previous.getX(), previous.getY(), newpos.getX(), newpos.getY());

	previous = newpos;
    }
}

function drawParticleVector(){
    strokeWeight(2);
    if(useBrightness){
        stroke(myColor,mySaturation,myBrightness);
    }else{
        stroke(myColor,255,255);
    }
    line(particleX, particleY,
	 particleX+(joystickX-JOYSTICK_CENTER_X), particleY+(joystickY-JOYSTICK_CENTER_Y));
    drawTriangle(particleX+(joystickX-JOYSTICK_CENTER_X),
		 particleY+(joystickY-JOYSTICK_CENTER_Y));
}

function drawTriangle(xPos,yPos){

    arrowAngle = atan2(joystickY-JOYSTICK_CENTER_Y,joystickX-JOYSTICK_CENTER_X);


    if(useBrightness){
        fill(myColor,mySaturation,myBrightness);
    }else{
        fill(myColor,255,255);
    }
    noStroke();

    push();

        translate(xPos,yPos);
        rotate(arrowAngle);

        beginShape();
            for(i=0;i<3;i++){
                vertex(8*cos(i*TWO_PI/3),8*sin(i*TWO_PI/3));
            }
        endShape(CLOSE);

    pop();
}

function drawMenu(){
    push()
        translate(0,0);

        textAlign(LEFT,CENTER);
        textSize(30);
        fill(50);
        noStroke();
        text("Settings:", 85, 605);

        textSize(20);

        ///////////////////////////////////////////////path toggle button
        stroke(50);
        strokeWeight(3);
        noFill();
        ellipse(75,650,20,20);

        if(drawPath){
            fill(50);
            noStroke();
            ellipse(75,650,13,13);
        }

        fill(50);
        noStroke();
        text("path", 90, 650);

        ////////////////////////////////////////////clear path button
        if(drawPath){
            
            //check if we're over the clear button:
            if(dist(mouseX,mouseY,180,650)<40&&!dragging){
                clearButtonColor = 255;
            }else{
                clearButtonColor = 200;
            }

            fill(clearButtonColor);
            noStroke();
            rectMode(CENTER);
            rect(180,650,80,35,20);
            fill(50);
            textAlign(CENTER,CENTER);
            text("clear", 180, 650);
        }

        ////////////////////////////////// direction / hue button
        if(drawPath){
            stroke(50);
        }else{
            stroke(120);
        }

        strokeWeight(3);
        noFill();
        ellipse(100,690,20,20);

        if(useColor&&drawPath){
            fill(50);
            noStroke();
            ellipse(100,690,13,13);
        }

        if(drawPath){
            fill(50);
        }else{
            fill(120);
        }
        noStroke()
        textAlign(LEFT,CENTER);
        text("direction / hue", 115,690);

        //////////////////////////////   speed / brightness button
        if(useColor&&drawPath){
            stroke(50);
        }else{
            stroke(120);
        }

        strokeWeight(3);
        noFill();
        ellipse(100,730,20,20);

        if (useBrightness&&useColor&&drawPath){
            fill(50);
            noStroke();
            ellipse(100,730,13,13);
        }

        else if (useColor&&drawPath){
            fill(50);
        }else{
            fill(120);
        }

        noStroke()
        text("speed / brightness", 115,730);

        ///////////////////////////// show vector button
        stroke(50);
        strokeWeight(3);
        noFill();
        ellipse(75,780,20,20);

        if(drawVector){
            fill(50);
            noStroke();
            ellipse(75,780,13,13);
        }

        fill(50);
        noStroke();
        text("show vector", 90, 780);

        /////////////////////////////  snap-back-to-zero
        stroke(50);
        strokeWeight(3);
        noFill();
        ellipse(75,820,20,20);

        if(snapToZero){
            fill(50);
            noStroke();
            ellipse(75,820,13,13);
        }

        fill(50);
        noStroke();
        text("snap to zero", 90, 820);

    pop()
}

function menuClick() {

    if(dist(mouseX,mouseY,75,650)<20){     
        drawPath = !drawPath;
    }

    //if we're hovering over clear button...
    if(clearButtonColor==255){     
	   particleX = PARTICLE_CENTER_X;
	   particleY = PARTICLE_CENTER_Y;
	   pathstart = PARTICLE_CENTER;
       tracer = new Barcode(0, 0, []);
       playhead = 0;
    }

    //if we have paths and we're over the hue button...
    if(drawPath&&dist(mouseX,mouseY,100,690)<20){     
        useColor = !useColor;
    }

    if(useColor&&dist(mouseX,mouseY,100,730)<20){     
        useBrightness = !useBrightness;
    }


    if(dist(mouseX,mouseY,75,780)<20){     
        drawVector = !drawVector;

    }

    if(dist(mouseX,mouseY,75,820)<20){     
        snapToZero = !snapToZero;
    }
}
