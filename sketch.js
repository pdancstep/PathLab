function setup() {
    createCanvas(1500,950);
    controlMode = JOYSTICKMODE;
    createPresetBarcodes();
    initializeTransformers();
}

function draw() {
    colorMode(RGB,255);
    background(indicator);

    drawUI();

    let velocityFrame = setNewCoordinates(controlMode);

    drawJoystickPosition(velocityFrame);
    if (drawJoystickPath) { drawJoystickHistory(); }
    if (drawPath) { drawParticlePath(); }
    if (drawVector) { drawParticleVector(velocityFrame); }
    
    drawParticle();
    drawBarcodes();
}

// for some reason touchStarted stopped getting called when I updated p5
// maybe there's a bug in its current version? anyway this works
function mousePressed() {
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

    // clicking on joystick activates JOYSTICK mode controls
    let joy = tracer.getCurrentJoystickPx();
    if(dist(mouseX, mouseY, joy.getX(), joy.getY()) < 15){
	if (!tracer.isComplete()) {
	    tracer.recordFromHere();
	}
        controlMode = JOYSTICKMODE;
        draggingJoystick = true;
    }

    //clicking on particle activates PARTICLE dragging controls
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

    // eject from tracer
    if(dist(mouseX, mouseY,
	    TRACER_X + BUTTON_SPACE + SLOT_WIDTH, TRACER_Y + BARCODE_HEIGHT/2) < 15) {
        spawnBarcode(tracer);
    }

    // TODO make this robust
    // eject from transformers
    if(dist(mouseX, mouseY,
	    500 + BUTTON_SPACE + SLOT_WIDTH, 200 + BARCODE_HEIGHT/2) < 15) {
        spawnBarcode(transform1);
    }
    if(dist(mouseX, mouseY,
	    500+ BUTTON_SPACE + SLOT_WIDTH, 300 + BARCODE_HEIGHT/2) < 15) {
        spawnBarcode(transform2);
    }

    // drag existing barcode
    for (var i = 0; i < freeBarcodes.length; i++) {
        freeBarcodes[i].onClick();
    }

    /* these areas have been removed for now
       TODO replace with click-handling for transformers
       (currently, eject button for placeholder transformers is handled above)
    // handle clicking on the settings menu
    menuClick();

    // handle clicking on buttons in the editing area
    editingClick();
    combinerClick();
    */
}

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
    }
}
