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
const RECORDMODE = 0; // creating barcode using mouse
const PARTICLEMODE = 1; // playing back barcode from particle tracer
const JOYSTICKMODE = 2; // playing back barcode from joystick tracer

var controlMode = RECORDMODE;

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

    let activeTracer = jtracer;
    if (controlMode==PARTICLEMODE) { activeTracer = ptracer; }

    let point = activeTracer.getCurrentJoystickPx();

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

    let canv = jtracer.getJoystickCanvas();

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
    
    jtracer.sendPathData(drawSegment);
}

function drawParticlePath(){
    strokeWeight(7);
    strokeCap(ROUND);
    colorMode(HSB,255);

    let canv = ptracer.getParticleCanvas();
    
    let drawSegment = function(start, end) {
	if (useColor&&useBrightness) {
            stroke(end.getColor(), end.getSaturation(), end.getBrightness());
        } else if (useColor) {
            stroke(end.getColor(),255,255);
        } else {
            stroke(50);
        }
	let startCoord = canv.canvasToScreen(start.getCoord());
	let endCoord = canv.canvasToScreen(end.getCoord());
	line(startCoord.getX(), startCoord.getY(), endCoord.getX(), endCoord.getY());
    };
    
    ptracer.sendPathData(drawSegment);
}

function drawParticleVector(colorInfo) {
    strokeWeight(2);
    colorMode(HSB,255);
    if(useBrightness){
        stroke(colorInfo.getColor(), colorInfo.getSaturation(), colorInfo.getBrightness());
    }else{
        stroke(colorInfo.getColor(), 255, 255);
    }

    let activeTracer = ptracer;
    if (controlMode==JOYSTICKMODE) { activeTracer = jtracer; }
    
    let part = activeTracer.getCurrentParticlePx();
    let joy = activeTracer.getCurrentJoystickPx().subtract(JOYSTICK_CENTER);
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

    let activeTracer = ptracer;
    if (controlMode==JOYSTICKMODE) { activeTracer = jtracer; }

    let part = activeTracer.getCurrentParticlePx();
    ellipse(part.getX(), part.getY(), 15, 15);
}

function drawButton(x, y, label) {
    fill(50);
    noStroke();
    ellipse(x, y, BUTTON_SIZE, BUTTON_SIZE);
    fill(200);
    textAlign(CENTER,CENTER);
    textSize(BUTTON_TEXT_SIZE);
    text(label, x, y);
}

function drawBarcodes() {
    // tracers
    rectMode(CORNER);
    colorMode(HSB,255);
    ptracer.display();
    jtracer.display();

    // play/pause buttons
    // TODO move this into Tracer.display() ?
    fill(50);
    noStroke();
    push();
    translate(PLAY_BUTTON_CENTER_X, PPLAY_BUTTON_CENTER_Y);
    if (ptracer.isPlaying()) {
	rect(-20,-20,15,40);
	rect(0,-20,15,40);
    } else {
	triangle(15,0,-15,-20,-15,20);
    }
    pop();

    push();
    translate(PLAY_BUTTON_CENTER_X, JPLAY_BUTTON_CENTER_Y);
    if (jtracer.isPlaying()) {
	rect(-20,-20,15,40);
	rect(0,-20,15,40);
    } else {
	triangle(15,0,-15,-20,-15,20);
    }
    pop();

    drawButton(EJECT_BUTTON_CENTER_X, PARTICLE_TRACER_Y + BARCODE_HEIGHT/2, "↑");
    drawButton(EJECT_BUTTON_CENTER_X, JOYSTICK_TRACER_Y + BARCODE_HEIGHT/2, "↑");

    // drawing a playhead position indicator
    // TODO move this into Tracer.display()
    noFill();
    stroke(50);
    strokeWeight(4);
    let pplayheadCoord = map(ptracer.getCurrentFrameNumber(),
			     0, MAX_BARCODE_LENGTH,
			     TRACER_X, TRACER_X + SLOT_WIDTH);
    rect(pplayheadCoord-6, PARTICLE_TRACER_Y-2, 6, BARCODE_HEIGHT+4);
    
    let jplayheadCoord = map(jtracer.getCurrentFrameNumber(),
			     0, MAX_BARCODE_LENGTH,
			     TRACER_X, TRACER_X + SLOT_WIDTH);
    rect(jplayheadCoord-6, JOYSTICK_TRACER_Y-2, 6, BARCODE_HEIGHT+4);

    // everything else
    for (const slot of presets) {
        slot.display();
    }

    for (const t of transformers) {
	t.display();
    }
    
    for(const barc of freeBarcodes){
        barc.update();
        barc.display();
    }
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
	ptracer.clear();
        jtracer.clear();
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
