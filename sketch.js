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

    //if dragging in DRAGGINGMODE or JOYSTICKMODE, record to present timeline
    if (controlMode != PLAYBACKMODE) {
	recordFrame(velocityFrame);
    }

    //draw particle path stored in tracer array
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

    // draw the editing and playback areas
    drawBarcodes();
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
	    let myslot = editingStation.indexOf(i);
	    if (myslot >= 0) {
		editingStation[myslot] = -1;
	    }
	    break;
	}
    }

    // handle clicking on the settings menu
    menuClick();

    // handle clicking on buttons in the editing area
    editingClick();
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
	if (slot >= 0) {
	    editingStation[slot] = i;
	}
	if (slot==SLOT_TRACER) {
	    installBarcode(myBarcodes[i]);
	    for (var j = 0; j < editingStation.length; j++) {
		if (editingStation[j] > i) {
		    editingStation[j]--;
		}
	    }
	    myBarcodes.splice(i,1);
	}
    }
}
