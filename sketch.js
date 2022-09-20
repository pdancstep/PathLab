function setup() {
    createCanvas(1500,950);
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

    //draw particle path stored in tracer array
    if(drawPath){
        drawParticlePath();
    }

    //draw particle velocity vector...
    if(drawVector){
        drawParticleVector(velocityFrame);
    }
    
    //draw particle itself
    drawParticle();

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
		tracer.start(PLAYBACK_VEL);
	    } else { // we're paused, so resume
		tracer.resume();
	    }
	    controlMode = PLAYBACKMODE;
	    drawPath = true;
	    return;
	}
    }

    // clicking on joystick activates JOYSTICK mode controls...
    let joy = tracer.getCurrentJoystickPx();
    if(dist(mouseX, mouseY, joy.getX(), joy.getY()) < 15){
	if (!tracer.isComplete()) {
	    tracer.recordFromHere();
	}
        controlMode = JOYSTICKMODE;
        draggingJoystick = true;
    }

    //clicking on particle activates PARTICLE dragging controls...
    let part = tracer.getCurrentParticlePx();
    if(dist(mouseX, mouseY, part.getX(), part.getY()) < 15){
	if (!tracer.isComplete()) {
	    tracer.recordFromHere();
	}
        controlMode = DRAGGINGMODE;
	let mouse
	    = tracer.getParticleCanvas().screenToCanvas(new Coord(mouseX, mouseY));
	prevMouseCoords = Array(SAMPLE_SIZE).fill(mouse);
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
    if ((draggingJoystick && snapToZero) || draggingParticle) {
	tracer.stop();
    }

    draggingJoystick = false;
    draggingParticle = false;

    for (var i = 0; i < freeBarcodes.length; i++) {
	let slot = freeBarcodes[i].onRelease();
	if (slot) {
	    freeBarcodes.splice(i,1);
	}
/*	if (slot >= 0) {
	    editingStation[slot] = i;
	}
	if (slot==-1) {
	    tracer.installBarcode(freeBarcodes[i]);
	    for (var j = 0; j < editingStation.length; j++) {
		if (editingStation[j] > i) {
		    editingStation[j]--;
		}
	    }
	    freeBarcodes.splice(i,1);
	} */
    }
}
