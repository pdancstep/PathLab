// coordinates of joystick area
const JOYSTICK_CENTER_X = 450;
const JOYSTICK_CENTER_Y = 725;
const JOYSTICK_AREA_SIZE = 250;
const JOYSTICK_CENTER = new Coord(JOYSTICK_CENTER_X, JOYSTICK_CENTER_Y);
const JOYSTICK_TOPLEFT = new Coord(JOYSTICK_CENTER_X - JOYSTICK_AREA_SIZE/2,
				   JOYSTICK_CENTER_Y - JOYSTICK_AREA_SIZE/2);
const JOYSTICK_SCALE = 50;

// coordinates of particle area
const PARTICLE_CENTER_X = 325;
const PARTICLE_CENTER_Y = 280;
const PARTICLE_AREA_SIZE = 500;
const PARTICLE_CENTER = new Coord(PARTICLE_CENTER_X, PARTICLE_CENTER_Y);
const PARTICLE_TOPLEFT = new Coord(PARTICLE_CENTER_X - PARTICLE_AREA_SIZE/2,
				   PARTICLE_CENTER_Y - PARTICLE_AREA_SIZE/2);
const PARTICLE_SCALE = 100;

// barcode display parameters
const BARCODE_HEIGHT = 50;
const FRAME_WIDTH = 2;
const SLOT_WIDTH = MAX_BARCODE_LENGTH * FRAME_WIDTH / BARCODE_DISPLAY_RESOLUTION;

//NOTE: *what* is being dragged depends on controlMode
var dragging = false;

var draggingParticle = false;
var draggingJoystick = false;

// debug
var indicator = 150;

// color changes based on mouseover state
var clearButtonColor = 200;

// set initial states for menu options
var drawPath = true;
var drawJoystickPath = true;
var useColor = false;
var useBrightness = false;

var drawVector = true;

var snapToZero = true;

//where are we controlling from?
const DRAGGINGMODE = 0; // directly controlling the particle
const JOYSTICKMODE = 1; // using joystick to set velocity of the particle
const PLAYBACKMODE = 2; // moving the particle based on a recorded barcode

var controlMode = JOYSTICKMODE;

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

    // note that y values are inverted here: we're centered according to the
    // joystick coordinate system, but still using screen coordinates, so +y is down
    //neg. x-axis
    stroke(0,255,255);
    line(0,0,-JOYSTICK_AREA_SIZE/2,0);
    
    //quad 3 diagonal
    stroke(32,255,255);
    line(0,0,-JOYSTICK_AREA_SIZE/2,JOYSTICK_AREA_SIZE/2);  

    //neg. y-axis
    stroke(64,255,255);
    line(0,0,0,JOYSTICK_AREA_SIZE/2);
    
    //quad 4 diagonal
    stroke(96,255,255);
    line(0,0,JOYSTICK_AREA_SIZE/2,JOYSTICK_AREA_SIZE/2);
    
    //pos. x-axis
    stroke(128,255,255);
    line(0,0,JOYSTICK_AREA_SIZE/2,0);
    
    //quad 1 diagonal
    stroke(160,255,255);
    line(0,0,JOYSTICK_AREA_SIZE/2,-JOYSTICK_AREA_SIZE/2);
    
    //pos y-axis
    stroke(192,255,255);
    line(0,0,0,-JOYSTICK_AREA_SIZE/2);
    
    //quad 2 diagonal
    stroke(224,255,255);
    line(0,0,-JOYSTICK_AREA_SIZE/2,-JOYSTICK_AREA_SIZE/2);    
    
    pop();
}

function drawJoystickPosition(colorInfo){
    let sat = 255;
    let bri = 255;
    if (useBrightness) {
	sat = colorInfo.getSaturation();
	bri = colorInfo.getBrightness();
    }
    noFill();
    stroke(colorInfo.getColor(), sat, bri);

    let point = tracer.getCurrentJoystickPx();
    line(JOYSTICK_CENTER_X, JOYSTICK_CENTER_Y, point.getX(), point.getY());
    
    strokeWeight(2);
    stroke(220);
    if(dist(point.getX(), point.getY(), JOYSTICK_CENTER_X, JOYSTICK_CENTER_Y) < 5) {
        fill(0);
    }else{
        fill(colorInfo.getColor(), sat, bri);
    }
    ellipse(point.getX(), point.getY(),15,15);
}

// TODO update this
function drawJoystickHistory() {
    if (false) {
    strokeWeight(1);
    strokeCap(ROUND);
    
    let pathEnd = min(tracer.length()-1, playhead);
    if (pathEnd < 1) {
	return;
    }

    let previous = tracer.getFrame(0).getCoord().translate(JOYSTICK_CENTER);
    for(i=1; i<pathEnd; i++){
	let frame = tracer.getFrame(i);
	let coord = frame.getCoord().translate(JOYSTICK_CENTER);
        if(useColor&&useBrightness){
            stroke(frame.getColor(),frame.getSaturation(),frame.getBrightness());
            fill(frame.getColor(),frame.getSaturation(),frame.getBrightness());
        }else if(useColor){
            stroke(frame.getColor(),255,255);
            fill(frame.getColor(),255,255);
        }else{
            stroke(255);
	    fill(255);
        }
	ellipse(coord.getX(), coord.getY(), 7, 7);
        line(previous.getX(), previous.getY(), coord.getX(), coord.getY());
	previous = coord;
    }
    }
}

// TODO update this
function drawParticlePath(){
    if (false) {
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
            stroke(frame.getColor(),frame.getSaturation(),frame.getBrightness());
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
}

function drawParticleVector(colorInfo) {
    strokeWeight(2);
    if(useBrightness){
        stroke(colorInfo.getColor(), colorInfo.getSaturation(), colorInfo.getBrightness());
    }else{
        stroke(colorInfo.getColor(), 255, 255);
    }
    let part = tracer.getCurrentParticlePx();
    let joy = tracer.getCurrentJoystickPx().subtract(JOYSTICK_CENTER);
    let xplusdx = part.getX() + joy.getX();
    let yplusdy = part.getY() + joy.getY();
    
    line(part.getX(), part.getY(), xplusdx, yplusdy);
    drawTriangle(xplusdx, yplusdy, atan2(joy.getY(), joy.getX()), colorInfo);
}

function drawTriangle(xPos, yPos, angle, colorInfo) {
    if(useBrightness){
        fill(colorInfo.getColor(), colorInfo.getSaturation(), colorInfo.getBrightness());
    }else{
        fill(colorInfo.getColor(), 255, 255);
    }
    noStroke();

    push();
        translate(xPos,yPos);
        rotate(angle);

        beginShape();
            for(i=0;i<3;i++){
                vertex(8*cos(i*TWO_PI/3),8*sin(i*TWO_PI/3));
            }
        endShape(CLOSE);
    pop();
}

function drawParticle() {
    colorMode(RGB,255);
    fill(50);
    strokeWeight(2);
    stroke(225,225,220);
    let part = tracer.getCurrentParticlePx();
    ellipse(part.getX(), part.getY(), 15, 15);
}

function drawBarcodes() {
    // tracer
    rectMode(CORNER);
    fill(100);
    noStroke();
    rect(TRACER_X, TRACER_Y, SLOT_WIDTH, BARCODE_HEIGHT);

    // TODO use the barcode class to avoid duplication here
    colorMode(HSB,255);
    tracer.display();

    //draw play/pause button:
    fill(50);
    noStroke();
    push();
    translate(PLAY_BUTTON_CENTER_X, PLAY_BUTTON_CENTER_Y);
    if (tracer.isPlaying()) {
	rect(-25,-25,20,55);
	rect(5,-25,20,55);
    } else {
	triangle(25,0,-25,-30,-25,30);
    }
    pop();

    drawButton(TRACER_X + SLOT_WIDTH + BUTTON_SPACE, TRACER_Y + BARCODE_HEIGHT/2, "↑");

    // drawing a playhead position indicator
    noFill();
    stroke(50);
    strokeWeight(4);
    playheadCoord = map(tracer.getCurrentFrameNumber(),
			0, MAX_BARCODE_LENGTH,
			TRACER_X, TRACER_X + SLOT_WIDTH);
    rect(playheadCoord-6,698,6,54);
    
    // draw barcodes on canvas
    for(const barc of freeBarcodes){
        barc.update();
        barc.display();
    }

    // draw editing stations
    for (var i = 0; i < editingStation.length; i++) {
	noFill();
	stroke(200);
	strokeWeight(2);
	rect(EDITING_STATION_X[i], EDITING_STATION_Y[i], SLOT_WIDTH, BARCODE_HEIGHT);

	drawButtonPanel(i);
    }

    drawCombinerPanel();
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
	particlePos = PARTICLE_CENTER;
	tracer.clear();
	prevMouseCoords = Array(SAMPLE_SIZE).fill(PARTICLE_CENTER);
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
