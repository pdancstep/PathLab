function setup() {
    createCanvas(1500,950);
    controlMode = JOYSTICKMODE;

    // create preset barcodes
    for (let b=0; b < PRESETS_GEN.length; b++) {
	let barc = new FormulaBarcode(PRESETS_X[b], PRESETS_Y[b],
				      0, PRESETS_DURATIONS[b],
				      PRESETS_GEN[b]);
	freeBarcodes.push(barc);
    }

    // initialize transformers
    let y = TRANSFORMER_1_Y;
    let t = new Slot(TRANSFORMER_X, y);
    transformers.push(t);
    for (let i=1; i<NUM_TRANSFORMERS; i++) {
	y = y + BARCODE_HEIGHT + TRANSFORMER_GAP;
	t = new Transformer(t, TRANSFORMER_X, y, TRANSFORMER_ARG_X, y);
	transformers.push(t);
    }
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

    // use eject button to spawn from tracer
    if (dist(mouseX, mouseY,
	    TRACER_X + BUTTON_SPACE + SLOT_WIDTH, TRACER_Y + BARCODE_HEIGHT/2) < 15) {
        spawnBarcode(tracer);
    }

    // click on tracer
    tracer.onClick();
    
    // click on transformers
    for (const t of transformers) {
	let drag = t.onClick();
	if (drag) { break; }
    }
    
    // click on free barcode
    for (const b of freeBarcodes) {
        let drag = b.onClick();
	if (drag) { break; }
    }

    /* these areas have been removed for now
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
