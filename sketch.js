var myBarcodes = [];

function setup() {
    createCanvas(1500,900);

}

// coordinates of joystick area
const JOYSTICK_CENTER_X = 450;
const JOYSTICK_CENTER_Y = 725;
const JOYSTICK_AREA_SIZE = 250;

// coordinates of particle area
const PARTICLE_CENTER_X = 325;
const PARTICLE_CENTER_Y = 280;
const PARTICLE_AREA_SIZE = 500;

// barcode display parameters
const BARCODE_HEIGHT = 50;
const FRAME_WIDTH = 2;

// scaling
const JOYSTICK_SCALING = 0.05;

//gives angle of current vector
var controlAngle;

//NOTE: *what* is being dragged depends on controlMode
var dragging = false;

// current coordinates of joystick and particle (start centered)
var controlDotX = JOYSTICK_CENTER_X;
var controlDotY = JOYSTICK_CENTER_Y;
var particleX = PARTICLE_CENTER_X;
var particleY = PARTICLE_CENTER_Y;


var indicator = 150;

var myColor = 0;
var myBrightness = 255;
var mySaturation = 255;

var clearButtonColor = 200;

var tracer = [];
var tracerLimit = 200;
var tracerAlpha = 255;

//states
var drawPath = true;
var useColor = false;
var useBrightness = false;

var drawVector = true;

var snapToZero = true;


//timeline and playback variables
var playhead = 0; // index of the current frame of the active barcode
var activeBarcode = -1; // index of the barcode currently on playback

var emptyTimeline = true;


//where are we controlling from?
const DRAGGINGMODE = 0; // directly controlling the particle
const JOYSTICKMODE = 1; // using joystick to set velocity of the particle
const PLAYBACKMODE = 2; // moving the particle based on a recorded barcode

var controlMode = JOYSTICKMODE;

//variables for driving with particle
var myMagnitude = 0;


var pmouse1X = 0;
var pmouse1Y = 0;
var pmouse2X = 0;
var pmouse2Y = 0;
var pmouse3X = 0;
var pmouse3Y = 0;
var pmouse4X = 0;
var pmouse4Y = 0;
var pmouse5X = 0;
var pmouse5Y = 0;
var pmouse6X = 0;
var pmouse6Y = 0;

var pAvgX;
var pAvgY;

function draw() {

    colorMode(RGB,255);
    background(indicator);

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

    //Mode buttons    
    stroke(50);
    noFill();
    strokeWeight(4);
    //upperleft
    ellipse(35,45,25,25);
    //lowerleft
    ellipse(35,610,25,25);
    //lowerright
    ellipse(675,610,25,25);

    //mode indication
    noStroke();
    fill(50);
    if (controlMode==DRAGGINGMODE){
        ellipse(35,45,18,18);
    }
    if (controlMode==JOYSTICKMODE){
        ellipse(35,610,18,18);
    }
    if (controlMode==PLAYBACKMODE){
        ellipse(675,610,18,18);
    }

    //draw settings toggles
    drawSettings();
    rectMode(CENTER);

    //draw stage for particle
    fill(225,225,220);
    noStroke();

    rect(PARTICLE_CENTER_X,PARTICLE_CENTER_Y,PARTICLE_AREA_SIZE,PARTICLE_AREA_SIZE);

    //stage coordinate system
    noFill();
    stroke(150);
    strokeWeight(2);
    line(PARTICLE_CENTER_X,PARTICLE_CENTER_Y-(PARTICLE_AREA_SIZE/2),PARTICLE_CENTER_X,PARTICLE_CENTER_Y+(PARTICLE_AREA_SIZE/2));
    line(PARTICLE_CENTER_X-(PARTICLE_AREA_SIZE/2),PARTICLE_CENTER_Y,PARTICLE_CENTER_X+(PARTICLE_AREA_SIZE/2),PARTICLE_CENTER_Y);
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

    setNewCoordinates(controlMode);
        
    //draw control dot...
    
    noFill();
    if(useBrightness){
        stroke(myColor,mySaturation,myBrightness);
    }else{
        stroke(myColor,255,255);
    }
    line(JOYSTICK_CENTER_X,JOYSTICK_CENTER_Y,controlDotX,controlDotY);

    strokeWeight(2);
    stroke(220);
    if(dist(controlDotX,controlDotY,JOYSTICK_CENTER_X,JOYSTICK_CENTER_Y)<5){
        fill(0);    
    }else{
        if(useBrightness){
            fill(myColor,mySaturation,myBrightness);
        }else{
            fill(myColor,255,255);
        }
    }
    ellipse(controlDotX,controlDotY,15,15);


    if(dragging){
        emptyTimeline = false;
        tracer.push([particleX,particleY,myColor,mySaturation,myBrightness]);
        if(tracer.length>tracerLimit){
            tracer.splice(0,1);
        }
    }


    if(drawPath){
        strokeWeight(7);
        strokeCap(ROUND);
        for(i=0;i<tracer.length-1;i++){
            //tracerAlpha = map(i,0,tracer.length,0,255);
            if(useColor&&useBrightness){
                stroke(tracer[i][2],tracer[i][3],tracer[i][4]);
            }else if(useColor){
                stroke(tracer[i][2],255,255);
            }else{
                stroke(50);
            }
            line(tracer[i][0],tracer[i][1],tracer[i+1][0],tracer[i+1][1]);
        }
    }


    //draw velocity vector...
    if(drawVector){
        strokeWeight(2);
        if(useBrightness){
            stroke(myColor,mySaturation,myBrightness);
        }else{
            stroke(myColor,255,255);
        }
        line(particleX, particleY, particleX+(controlDotX-JOYSTICK_CENTER_X), particleY+(controlDotY-JOYSTICK_CENTER_Y));
        drawTriangle(particleX+(controlDotX-JOYSTICK_CENTER_X),particleY+(controlDotY-JOYSTICK_CENTER_Y),8);
    }

    
    colorMode(RGB,255);

    fill(50);
    strokeWeight(2);
    stroke(225,225,220);
    ellipse(particleX, particleY, 15, 15);

    //draw timeline/recording bar BACKGROUND

    rectMode(CORNER);

    fill(100);
    noStroke();
    rect(750,700,400,50);


    colorMode(HSB,255);
    for(i=0;i<tracer.length;i++){
        stroke(tracer[i][2],tracer[i][3],tracer[i][4]);
        line(750+2*i,700,750+2*i,750);
    }

    //draw timeline/recordng bar OUTLINE
    noFill();
    stroke(200);
    rect(750,700,400,50);


    //draw barcodes on canvas


    for(const barc of myBarcodes){
        barc.update();
        barc.display();
    }

    fill(0);
    text(emptyTimeline,900,450);

}


function drawTriangle(xPos,yPos,Rad){


    if(useBrightness){
        fill(myColor,mySaturation,myBrightness);
    }else{
        fill(myColor,255,255);
    }
    noStroke();

    push();

        translate(xPos,yPos);
        rotate(controlAngle);


        beginShape();
            for(i=0;i<3;i++){
                vertex(Rad*cos(i*TWO_PI/3),Rad*sin(i*TWO_PI/3));
            }
        endShape(CLOSE);

    pop();
}

function drawSettings(){

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

        if(useBrightness&&useColor&&drawPath){
            fill(50);
            noStroke();
            ellipse(100,730,13,13);
        }

        if(useColor&&drawPath){
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


function touchStarted() {

    //mode changes:
    if(dist(mouseX,mouseY,35,45)<25){
        controlMode = DRAGGINGMODE;
	return;
    }

    if(dist(mouseX,mouseY,35,610)<25){
        controlMode = JOYSTICKMODE;
	return;
    }

    if(dist(mouseX,mouseY,675,610)<25){
	myBarcodes.push(new Barcode(750,700));
	particleX = PARTICLE_CENTER_X;
	particleY = PARTICLE_CENTER_Y;
        controlMode = PLAYBACKMODE;
	playhead = 0;
	activeBarcode = myBarcodes.length - 1;
	drawPath = true;
	return;
    }


    //turn on dot dragging...

    if(controlMode==DRAGGINGMODE){
        if(dist(mouseX,mouseY,particleX,particleY)<15){
            dragging = true;
        }
    }

    if(controlMode==JOYSTICKMODE){
        if(dist(mouseX,mouseY,controlDotX,controlDotY)<15){
            dragging = true;
        }
    }

    if(mouseX>750&&mouseX<1150&&mouseY>700&&mouseY<750){
        myBarcodes.push(new Barcode(mouseX,mouseY))
    }

    //dragging existing barcode...
    for(const barc of myBarcodes){
        barc.onClick();
    }

    // clicking on the settings menu...

    if(dist(mouseX,mouseY,75,650)<20){     
        drawPath = !drawPath;
    }

    //if we're hovering over clear button...
    if(clearButtonColor==255){     
        tracer = [];
        emptyTimeline = true;
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

function touchMoved() {

}

function touchEnded(){

    if(snapToZero){
        controlDotX = JOYSTICK_CENTER_X;
        controlDotY = JOYSTICK_CENTER_Y;
    }

    dragging = false;

    for(const barc of myBarcodes){
        barc.dragging = false;
    }
}

// encoding of magnitude as brightness/saturation
//
// radius 0               = brightness 0, saturation 255
//                                     \/
//                               increases to
//                                     \/
// radius MAX_MAGNITUDE/2 = brightness 255, saturation 255
//                                                     \/
//                                               decreases to
//                                                     \/
// radius MAX_MAGNITUDE   = brightness 255, saturation 0

// 
const MAX_BRIGHTNESS = 255;
const MAX_MAGNITUDE = 100;

function coordToColor(x, y) {
    let magnitude = sqrt(y*y + x*x);
    let angle = atan2(y, x);

    let color = map(angle, -PI, PI, 0, 255);
    let intensity = map(magnitude, 0, MAX_MAGNITUDE, 0, MAX_BRIGHTNESS*2);
    let brightness = min(MAX_BRIGHTNESS, intensity);
    let saturation = min(MAX_BRIGHTNESS, (MAX_BRIGHTNESS*2) - intensity);
    
    return [color, brightness, saturation];
}

function colorToCoord(color, brightness, saturation) {
    let angle = map(color, 0, 255, -PI, PI);
    let intensity = brightness - saturation + MAX_BRIGHTNESS;
    let magnitude = map(intensity, 0, MAX_BRIGHTNESS*2, 0, MAX_MAGNITUDE);

    let x = magnitude * cos(angle);
    let y = magnitude * sin(angle);

    return [x, y];
}

// update particle, joystick, and barcode according to current UI mode
function setNewCoordinates(mode) {
    // update particle and related values based on mouse
    if(mode==DRAGGINGMODE){
        if(dragging){

            particleX = mouseX;
            particleY = mouseY;

            pmouse6X = pmouse5X;
            pmouse6Y = pmouse5Y;

            pmouse5X = pmouse4X;
            pmouse5Y = pmouse4Y;

            pmouse4X = pmouse3X;
            pmouse4Y = pmouse3Y;

            pmouse3X = pmouse2X;
            pmouse3Y = pmouse2Y;

            pmouse2X = pmouse1X;
            pmouse2Y = pmouse1Y;

            pmouse1X = pmouseX;
            pmouse1Y = pmouseY;

            pAvgX = (pmouse1X+pmouse2X+pmouse3X+pmouse4X+pmouse5X+pmouse6X)/6;
            pAvgY = (pmouse1Y+pmouse2Y+pmouse3Y+pmouse4Y+pmouse5Y+pmouse6Y)/6;

	    // magnitude the joystick needs to be at
            myMagnitude = sqrt((mouseY-pAvgY)*(mouseY-pAvgY)+(mouseX-pAvgX)*(mouseX-pAvgX))

            controlDotX = JOYSTICK_CENTER_X + 10*myMagnitude*cos(atan2(mouseY-pAvgY,mouseX-pAvgX))
            controlDotY = JOYSTICK_CENTER_Y + 10*myMagnitude*sin(atan2(mouseY-pAvgY,mouseX-pAvgX))
	    let colorInfo = coordToColor(controlDotX - JOYSTICK_CENTER_X,
					 controlDotY - JOYSTICK_CENTER_Y);
	    myColor = colorInfo[0];
	    myBrightness = colorInfo[1];
	    mySaturation = colorInfo[2];
        }
    }

    // update joystick based on mouse
    else if (mode==JOYSTICKMODE) {
        if(dragging){
            controlDotX = mouseX;
            controlDotY = mouseY;

	    let colorInfo = coordToColor(mouseX - JOYSTICK_CENTER_X,
					 mouseY - JOYSTICK_CENTER_Y);
	    myColor = colorInfo[0];
	    myBrightness = colorInfo[1];
	    mySaturation = colorInfo[2];
        }
    }

    // update joystick based on next recorded frame
    else if (mode==PLAYBACKMODE) {
	let frame = myBarcodes[activeBarcode].getFrame(playhead);
	if (frame==null)
	{
	    // stop playback
	    return;
	}
	myColor = frame[2];
	myBrightness = frame[3];
	mySaturation = frame[4];
	
	let coords = colorToCoord(myColor, myBrightness, mySaturation);
	controlDotX = coords[0] + JOYSTICK_CENTER_X;
	controlDotY = coords[1] + JOYSTICK_CENTER_Y;

	playhead++;
    }

    // update particle based on updates to joystick
    if (controlMode != DRAGGINGMODE)
    {
        particleX += JOYSTICK_SCALING * (controlDotX - JOYSTICK_CENTER_X);
        particleY += JOYSTICK_SCALING * (controlDotY - JOYSTICK_CENTER_Y);
    }
}
