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
    let velocityFrame = setNewCoordinates(controlMode);

    //////////////////////////////  JOYSTICK
    //draw joystick dot...
    drawJoystickPosition(velocityFrame);

    //if dragging in DRAGGINGMODE or JOYSTICKMODE, record to present timeline...
    recordFrame(velocityFrame);

    //////////////////////////////  PARTICLE
    //draw particle path stored in tracer array...
    if(drawPath){
        drawParticlePath();
    }

    //draw particle velocity vector...
    if(drawVector){
        drawParticleVector(velocityFrame);
    }
    
    //draw particle itself
    colorMode(RGB,255);

    fill(50);
    strokeWeight(2);
    stroke(225,225,220);
    ellipse(particlePos.getX(), particlePos.getY(), 15, 15);

    //TODO? Move into graphics? note that barcode image gets stored between timeline background and outline...

    /////////////////////////////  TIMELINE
    //draw timeline/recording bar BACKGROUND
    rectMode(CORNER);
    fill(100);
    noStroke();
    rect(750,700,400,50);

    colorMode(HSB,255);
    for(i=0; i<tracer.length(); i++){
	let frame = tracer.getFrame(i);
        stroke(frame.getColor(), frame.getSaturation(), frame.getBrightness());
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

    // drawing a playhead position indicator
    noFill();
    stroke(50);
    strokeWeight(4);
    playheadCoord = map(playhead,0,MAX_BARCODE_LENGTH,750,1150);
    if(playheadCoord>1150){
        playheadCoord = 1150;
    }
    rect(playheadCoord-6,698,6,54);

    //////////////////////////////////////////////CONTAINERS FOR EDITING BARCODES...

    //Reverser field and button
    noFill();
    stroke(200);
    strokeWeight(2);
    rect(750,100,400,50);

    fill(50);
    noStroke();
    ellipse(720,125,30,30);
    fill(200);
    textAlign(CENTER,CENTER);
    textSize(20);
    text("R",720,125);

    //stretcher field and buttons
    noFill();
    stroke(200);
    strokeWeight(2);
    rect(750,200,400,50);

    fill(50);
    noStroke();
    ellipse(720,212,20,20);
    ellipse(720,238,20,20);
    fill(200);
    textAlign(CENTER,CENTER);
    textSize(15);
    text("↑",720,212);
    text("↓",720,238);
}

function touchStarted() {
    // play button
    if(mouseX>950&&mouseX<1000&&mouseY>770&&mouseY<830){
	particlePos = PARTICLE_CENTER;
	pathstart = PARTICLE_CENTER;
	controlMode = PLAYBACKMODE;
	playhead = 0;
	drawPath = true;
	return;
    }

    // clicking on joystick activates JOYSTICK mode controls...
    if(dist(mouseX,mouseY,joystickPos.getX(),joystickPos.getY()) < 15){
        controlMode = JOYSTICKMODE;
        draggingJoystick = true;
    }

    //clicking on particle activates PARTICLE dragging controls...
    if(dist(mouseX,mouseY,particlePos.getX(),particlePos.getY()) < 15){
        controlMode = DRAGGINGMODE;
	prevMouseCoords = Array(SAMPLE_SIZE).fill(new Coord(mouseX, mouseY));
        draggingParticle = true;
    }

    //"eject"
    if(dist(mouseX,mouseY,1180,725)<15){
        spawnBarcode();
    }

    //dragging existing barcode...
    for (var i = 0; i < myBarcodes.length; i++) {
        if (myBarcodes[i].onClick()) {
	    if (editingStation==i) {
		editingStation = -1;
	    }
	    break;
	}
    }

    // clicking on the settings menu...
    menuClick();

    //////////////////////////////// BUTTONS for BARCODE EDITING

    //Reverse button
    if(dist(mouseX,mouseY,720,125)<15){
	if (editingStation >= 0) {
	    myBarcodes[editingStation].reverse();
	}
    }

    //Stetcher UP
    if(dist(mouseX,mouseY,720,212)<10){

    }

    //Stretcher DOWN
    if(dist(mouseX,mouseY,720,238)<10){

    }
}

function touchMoved() {

}

function touchEnded() {
    if(snapToZero) {
	joystickPos = JOYSTICK_CENTER;
    }

    draggingJoystick = false;
    draggingParticle = false;

    for (var i = 0; i < myBarcodes.length; i++) {
	let slot = myBarcodes[i].onRelease();
	if (slot==SLOT_EDITOR) {
	    editingStation = i;
	}
	if (slot==SLOT_TRACER) {
	    installBarcode(myBarcodes[i]);
	    if (editingStation > i) {
		editingStation--;
	    }
	    myBarcodes.splice(i,1);
	}
    }
}
