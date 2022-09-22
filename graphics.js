
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
    joystickCanvas.display();
    particleCanvas.display();
    //draw menu toggles
    //drawMenu();
}

function drawJoystickPosition(colorInfo){
    colorMode(HSB,255);
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

function drawJoystickHistory() {
    strokeWeight(1);
    strokeCap(ROUND);
    let canv = tracer.getJoystickCanvas();

    let drawSegment = function(start, end) {
	if (useColor&&useBrightness) {
            stroke(end.getColor(), end.getSaturation(), end.getBrightness());
            fill(end.getColor(), end.getSaturation(), end.getBrightness());
        } else if (useColor) {
            stroke(end.getColor(),255,255);
            fill(end.getColor(),255,255);
        } else {
            stroke(255);
	    fill(255);
        }
	let startCoord = canv.canvasToScreen(start.getCoord());
	let endCoord = canv.canvasToScreen(end.getCoord());

	ellipse(endCoord.getX(), endCoord.getY(), 7, 7);
	line(startCoord.getX(), startCoord.getY(), endCoord.getX(), endCoord.getY());
    };
    
    tracer.sendPathData(drawSegment);
}

function drawParticlePath(){
    strokeWeight(7);
    strokeCap(ROUND);
    colorMode(HSB,255);
    let canv = tracer.getParticleCanvas();
    let previous = tracer.getStartingParticle();
    
    let drawSegment = function(start, end) {
	if (useColor&&useBrightness) {
            stroke(end.getColor(), end.getSaturation(), end.getBrightness());
        } else if (useColor) {
            stroke(end.getColor(),255,255);
        } else {
            stroke(50);
        }
	let next = end.applyAsVelocity(previous);
	let startCoord = canv.canvasToScreen(previous);
	let endCoord = canv.canvasToScreen(next);
	line(startCoord.getX(), startCoord.getY(), endCoord.getX(), endCoord.getY());
	previous = next;
    };
    
    tracer.sendPathData(drawSegment);
}

function drawParticleVector(colorInfo) {
    strokeWeight(2);
    colorMode(HSB,255);
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

    // draw transformers
    transform1.update();
    transform1.display();
    transform2.update();
    transform2.display();
    
    // draw editing stations
/*    for (var i = 0; i < editingStation.length; i++) {
	noFill();
	stroke(200);
	strokeWeight(2);
	rect(EDITING_STATION_X[i], EDITING_STATION_Y[i], SLOT_WIDTH, BARCODE_HEIGHT);

	drawButtonPanel(i);
    }

    drawCombinerPanel();
*/
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
