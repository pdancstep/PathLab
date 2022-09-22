var freeBarcodes = [];

function spawnBarcode(source) {
    freeBarcodes.push(source.eject(SPAWN_X, SPAWN_Y));
}

// TODO remove (replace with slot.inside(x,y))
/*
function coordInTracer(x, y) {
    return (TRACER_X < x && x < TRACER_END_X &&
	    TRACER_Y < y && y < TRACER_END_Y);
}

// TODO remove (replace with slot.inside(x,y))
function coordInEditor(x, y) {
    for (var i=0; i < editingStation.length; i++) {
	if (EDITING_STATION_X[i] < x && x < EDITING_STATION_END_X[i] &&
	    EDITING_STATION_Y[i] < y && y < EDITING_STATION_END_Y[i]) {
	    return i;
	}
    }
    return -2;
}
*/

function drawButton(x, y, label) {
    fill(50);
    noStroke();
    ellipse(x, y, BUTTON_SIZE, BUTTON_SIZE);
    fill(200);
    textAlign(CENTER,CENTER);
    textSize(BUTTON_TEXT_SIZE);
    text(label, x, y);
}

function drawButtonPanel(station) {
    let x = EDITING_STATION_END_X[station] + BUTTON_SPACE;
    let y = (EDITING_STATION_Y[station] + EDITING_STATION_END_Y[station])/2;

    drawButton(x, y, "R"); // reverse button
    x += BUTTON_SPACE;
    drawButton(x, y, "<"); // squash button
    x += BUTTON_SPACE;
    drawButton(x, y, ">"); // stretch button
    x += BUTTON_SPACE;
    drawButton(x, y, "-"); // slow button
    x += BUTTON_SPACE;
    drawButton(x, y, "+"); // speed button
    x += BUTTON_SPACE;
    drawButton(x, y, "@"); // rotate button
    x += BUTTON_SPACE;
    if (station > 0) {
	drawButton(x, y, "^");  // append to previous station button
    }
}

function drawCombinerPanel() {
    let x = (EDITING_STATION_X[0] + EDITING_STATION_END_X[0])/2 - .5*BUTTON_SPACE;
    let y = EDITING_STATION_END_Y[0] + 30;

    drawButton(x, y, "+");
    x += BUTTON_SPACE;
    drawButton(x, y, "*");
}

function editingClick() {
    for (var i=0; i<editingStation.length; i++) {
	let idx = editingStation[i];
	if (idx < 0) { continue; }
	
	let x = EDITING_STATION_END_X[i] + BUTTON_SPACE;
	let y = (EDITING_STATION_Y[i] + EDITING_STATION_END_Y[i])/2;

	// reverse button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    freeBarcodes[idx].reverse();
	    break;
	}
	x += BUTTON_SPACE;

	// squash button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    freeBarcodes[idx].squash(2);
	    break;
	}
	x += BUTTON_SPACE;

	// stretch button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    freeBarcodes[idx].stretch(1);
	    break;
	}
	x += BUTTON_SPACE;

	// slow button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    freeBarcodes[idx].darken(2);
	    break;
	}
	x += BUTTON_SPACE;

	// speed button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    freeBarcodes[idx].brighten(2);
	    break;
	}
	x += BUTTON_SPACE;

	// rotate button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    freeBarcodes[idx].rotate(32);
	    break;
	}
	x += BUTTON_SPACE;

	// append to previous station button
	if (i>0 && dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    let otherbarc = editingStation[i-1];
	    if (otherbarc >= 0) { // both barcodes exist
		freeBarcodes[otherbarc].concat(freeBarcodes[idx]);
	    } else {
		// barcode is being "appended" to an empty station, so we make a copy
		let newx = EDITING_STATION_X[i-1];
		let newy = EDITING_STATION_Y[i-1];
		let newbarc = freeBarcodes[idx].clone(newx, newy);
		editingStation[i-1] = freeBarcodes.length;
		freeBarcodes.push(newbarc);
	    }
	}
    }
}

function combinerClick() {
    let x = (EDITING_STATION_X[0] + EDITING_STATION_END_X[0])/2 - .5*BUTTON_SPACE;
    let y = EDITING_STATION_END_Y[0] + 30;

    // add-barcodes button
    if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	// first two stations must be occupied, third must not be
	if (editingStation[0] < 0 || editingStation[1] < 0 ||
	    editingStation[2] >= 0)
	{
	    return;
	}

	let a1 = freeBarcodes[editingStation[0]];
	let a2 = freeBarcodes[editingStation[1]];
	let sum = a1.framewiseAdd(a2, EDITING_STATION_X[2], EDITING_STATION_Y[2]);
	
	editingStation[2] = freeBarcodes.length;
	freeBarcodes.push(sum);
    }
    x += BUTTON_SPACE;

    // multiply-barcodes button
    if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	// first two stations must be occupied, third must not be
	if (editingStation[0] < 0 || editingStation[1] < 0 ||
	    editingStation[2] >= 0)
	{
	    return;
	}

	let f1 = freeBarcodes[editingStation[0]];
	let f2 = freeBarcodes[editingStation[1]];
	let prod = f1.framewiseMultiply(f2, EDITING_STATION_X[2], EDITING_STATION_Y[2]);
	
	editingStation[2] = freeBarcodes.length;
	freeBarcodes.push(prod);
    }
}

function createPresetBarcodes() {
    for (let b=0; b < PRESETS_GEN.length; b++) {
	let frames = [];
	for (let i=0; i < PRESETS_DURATIONS[b]; i++) {
	    frames.push(PRESETS_GEN[b](i));
	}
	freeBarcodes.push(new Barcode(PRESETS_X[b], PRESETS_Y[b], frames));
    }
}
