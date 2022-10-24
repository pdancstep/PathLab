function setup() {
    createCanvas(1500,1000);
    controlMode = RECORDMODE;

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
    addTransformerButton = createButton("Add Transformer");
    addTransformerButton.position(TRANSFORMER_X, y + BARCODE_HEIGHT + TRANSFORMER_GAP);
    addTransformerButton.mousePressed(addTransformer);
    for (let i=1; i < STARTING_TRANSFORMERS; i++) {
        addTransformer();
    }

    // initialize tracers
    ptracer = new Tracer(TRACER_X, PARTICLE_TRACER_Y, particleCanvas, joystickCanvas);
    jtracer = new Tracer(TRACER_X, JOYSTICK_TRACER_Y, particleCanvas, joystickCanvas);
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
    if (playButtonClick()) { return; }

    // clicking on joystick activates JOYSTICK mode controls
    let joy = jtracer.getCurrentJoystickPx();
    if(dist(mouseX, mouseY, joy.getX(), joy.getY()) < 15){
        if (!ptracer.isComplete()) {
            ptracer.recordFromHere();
        }
	if (!jtracer.isComplete()) {
            jtracer.recordFromHere();
        }
        controlMode = RECORDMODE;
        draggingJoystick = true;
    }

    //clicking on particle activates PARTICLE dragging controls
    let part = ptracer.getCurrentParticlePx();
    if(dist(mouseX, mouseY, part.getX(), part.getY()) < 15){
	if (!ptracer.isComplete()) {
	    ptracer.recordFromHere();
	}
        if (!jtracer.isComplete()) {
            jtracer.recordFromHere();
        }
        controlMode = RECORDMODE;
	let mouse
	    = ptracer.getParticleCanvas().screenToCanvas(new Coord(mouseX, mouseY));
	prevMouseCoords = Array(SAMPLE_SIZE).fill(mouse);
        draggingParticle = true;
    }

    // use eject buttons to spawn from tracer
    if (dist(mouseX, mouseY,
             EJECT_BUTTON_CENTER_X, PARTICLE_TRACER_Y + BARCODE_HEIGHT/2) < 15) {
        spawnBarcode(ptracer);
    }
    if (dist(mouseX, mouseY,
             EJECT_BUTTON_CENTER_X, JOYSTICK_TRACER_Y + BARCODE_HEIGHT/2) < 15) {
        spawnBarcode(jtracer);
    }

    // click on tracer
    ptracer.onClick();
    jtracer.onClick();
    
    // click on transformers
    for (const t of transformers) {
	t.onClick();
    }
    
    // click on free barcode
    for (const b of freeBarcodes) {
        let drag = b.onClick();
	if (drag) { break; } // only pick up one free barcode at a time
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
	ptracer.stop();
        jtracer.stop();
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

function addTransformer() {
    let y = addTransformerButton.position().y + BARCODE_HEIGHT;
    let t = transformers[transformers.length-1];
    let t2 = new Transformer(t, TRANSFORMER_X, y, TRANSFORMER_ARG_X, y - TRANSFORMER_GAP);
    transformers.push(t2);
    addTransformerButton.position(TRANSFORMER_X, y + TRANSFORMER_GAP*2);
    if (transformers.length >= MAX_TRANSFORMERS) {
        addTransformerButton.hide();
    }
}
