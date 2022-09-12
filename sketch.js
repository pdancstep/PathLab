function setup() {
    createCanvas(1500,900);
    controlMode = JOYSTICKMODE;
    createPresetBarcodes();
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

    if (drawJoystickPath) {
	drawJoystickHistory();
    }

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
    if (dist(mouseX, mouseY, PLAY_BUTTON_CENTER_X, PLAY_BUTTON_CENTER_Y) < 30) {
	if (tracer.isPlaying()) { // already playing, so we're clicking pause
	    tracer.pause();
	} else {
	    if (tracer.isComplete()) { // at the end, so we're starting a new playback
		tracer.start();
		controlMode = PLAYBACKMODE;
		particlePos = PARTICLE_CENTER;
	    } else { // we're paused, so resume
		tracer.resume();
		controlMode = PLAYBACKMODE;
	    }
	    drawPath = true;
	    return;
	}
    }

    // clicking on joystick activates JOYSTICK mode controls...
    if(dist(mouseX,mouseY,joystickPos.getX(),joystickPos.getY()) < 15){
	if (controlMode == PLAYBACKMODE) {
	    tracer.recordFromHere();
	}
        controlMode = JOYSTICKMODE;
        draggingJoystick = true;
    }

    //clicking on particle activates PARTICLE dragging controls...
    if(dist(mouseX,mouseY,particlePos.getX(),particlePos.getY()) < 15){
	if (controlMode == PLAYBACKMODE) {
	    tracer.recordFromHere();
	}
        controlMode = DRAGGINGMODE;
	prevMouseCoords = Array(SAMPLE_SIZE).fill(new Coord(mouseX, mouseY));
        draggingParticle = true;
    }

    //"eject"
    if(dist(mouseX, mouseY,
	    TRACER_X + BUTTON_SPACE + SLOT_WIDTH, TRACER_Y + BARCODE_HEIGHT/2) < 15) {
        spawnBarcode(tracer);
    }

    //dragging existing barcode...
    for (var i = 0; i < freeBarcodes.length; i++) {
        if (freeBarcodes[i].onClick()) {
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
    combinerClick();
}

function touchMoved() {

}

// TODO refactor for Slot class
function touchEnded() {
    if(snapToZero) {
	joystickPos = JOYSTICK_CENTER;
    }

    draggingJoystick = false;
    draggingParticle = false;

    for (var i = 0; i < freeBarcodes.length; i++) {
	let slot = freeBarcodes[i].onRelease();
	if (slot >= 0) {
	    editingStation[slot] = i;
	}
	if (slot==-1) {
	    installBarcode(freeBarcodes[i]);
	    for (var j = 0; j < editingStation.length; j++) {
		if (editingStation[j] > i) {
		    editingStation[j]--;
		}
	    }
	    freeBarcodes.splice(i,1);
	}
    }
}
