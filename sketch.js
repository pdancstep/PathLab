
function setup() {
    createCanvas(1500,900);

}

function draw() {

    colorMode(RGB,255);
    background(indicator);


    //draw the environment...
    drawUI();

    //infer all coordinates based on present mode...
    setNewCoordinates(controlMode);
        
    



    //////////////////////////////  JOYSTICK

    //draw joystick dot...
    drawJoystickPosition();


    //if dragging in DRAGGINGMODE or JOYSTICKMODE, record to present timeline...
    if(dragging){
        tracer.push([particleX,particleY,myColor,mySaturation,myBrightness]);
        if(tracer.length>tracerLimit){
            tracer.splice(0,1);
        }
    }

    





    //////////////////////////////  PARTICLE

    //draw particle path stored in tracer array...
    if(drawPath){
        drawParticlePath();
    }


    //draw particle velocity vector...
    if(drawVector){
        drawParticleVector();
    }

    
    //draw particle itself
    colorMode(RGB,255);

    fill(50);
    strokeWeight(2);
    stroke(225,225,220);
    ellipse(particleX, particleY, 15, 15);

    



    /////////////////////////////  TIMELINE

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







    ////////////////////////////  BARCODES

    //draw barcodes on canvas
    for(const barc of myBarcodes){
        barc.update();
        barc.display();
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



















