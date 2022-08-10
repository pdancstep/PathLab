function setup() {
    createCanvas(1500,900);
    controlMode = JOYSTICKMODE;
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
    recordFrame();

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





    //TODO? Move into graphics? note that bardcode image gets stored between timeline background and outline...

    /////////////////////////////  TIMELINE
    //draw timeline/recording bar BACKGROUND
    rectMode(CORNER);
    fill(100);
    noStroke();
    rect(750,700,400,50);

    colorMode(HSB,255);
    for(i=0; i<tracer.length(); i++){
	let frame = tracer.getFrame(i);
        stroke(frame.getColor(), frame.getBrightness(), frame.getSaturation());
        line(750+2*i,700,750+2*i,750);
    }

    //draw timeline/recordng bar OUTLINE
    noFill();
    stroke(200);
    rect(750,700,400,50);

    //draw play/pause button:
    fill(50);
    noStroke();
    if(controlMode==PLAYBACKMODE&&playhead<tracer.length()){
        //pause button
        rect(950,775,20,55);
        rect(980,775,20,55);     
    }else{
        triangle(1000,800,950,770,950,830);

    }

    ellipse(1180,725,30,30);
    fill(200);
    textAlign(CENTER,CENTER);
    textSize(20);
    text("↑",1180,727);


    ////////////////////////////  BARCODES
    //draw barcodes on canvas
    for(const barc of myBarcodes){
        barc.update();
        barc.display();
    }



    //drawing a playhead position indicator

    noFill();
    stroke(50);
    strokeWeight(4);
    playheadCoord = map(playhead,0,MAX_BARCODE_LENGTH,750,1150);
    if(playheadCoord>1150){
        playheadCoord = 1150;
    }
    rect(playheadCoord-6,698,6,54);

    






}

function touchStarted() {


    // play button
    if(mouseX>950&&mouseX<1000&&mouseY>770&&mouseY<830){
	particleX = PARTICLE_CENTER_X;
	particleY = PARTICLE_CENTER_Y;
	pathstart = PARTICLE_CENTER;
	controlMode = PLAYBACKMODE;
	playhead = 0;
	drawPath = true;
	return;
    }


    // clicking on joystick activates JOYSTICK mode controls...
    if(dist(mouseX,mouseY,joystickX,joystickY)<15){
        controlMode = JOYSTICKMODE;
        draggingJoystick = true;
    }

    //clicking on particle activates PARTICLE dragging controls...
    if(dist(mouseX,mouseY,particleX,particleY)<15){
        controlMode = DRAGGINGMODE;
        draggingParticle = true;
    }

    //"eject"
    if(dist(mouseX,mouseY,1180,725)<15){
        myBarcodes.push(tracer.clone());
    }

    //dragging existing barcode...
    for(const barc of myBarcodes){
        barc.onClick();
    }

    // clicking on the settings menu...
    menuClick();
}

function touchMoved() {

}

function touchEnded() {
    if(snapToZero){
        joystickX = JOYSTICK_CENTER_X;
        joystickY = JOYSTICK_CENTER_Y;
    }

    draggingJoystick = false;
    draggingParticle = false;

    for(const barc of myBarcodes){
        barc.dragging = false;
    }
}
