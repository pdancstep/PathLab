var myBarcodes = [];

var editingStation = [-1, -1, -1];
const EDITING_STATION_X = [750, 750, 750];
const EDITING_STATION_Y = [100, 200, 300];
const EDITING_STATION_END_X = [1150, 1150, 1150];
const EDITING_STATION_END_Y = [150, 250, 350];

const TRACER_X = 750;
const TRACER_Y = 700;
const TRACER_END_X = 1150;
const TRACER_END_Y = 750;

const PRESETS_X = [900, 850, 950, 900, 1100];
const PRESETS_Y = [400, 450, 450, 500, 400];
const PRESETS_GEN = [function (idx) { return new Frame( 64, 128, 255); },
		     function (idx) { return new Frame(  0, 128, 255); },
		     function (idx) { return new Frame(128, 128, 255); },
		     function (idx) { return new Frame(192, 128, 255); },
		     function (idx) { return new Frame(idx,  64, 255); }]
const BASE_DURATION = MAX_BARCODE_LENGTH / 8;
const PRESETS_DURATIONS = [BASE_DURATION, BASE_DURATION, BASE_DURATION, BASE_DURATION,
			  255];

// location where barcodes initially spawn into the editing area
const SPAWN_X = 750;
const SPAWN_Y = 600;

function spawnBarcode() {
    myBarcodes.push(tracer.clone(SPAWN_X, SPAWN_Y));
}

const NO_SLOT = -2;
const SLOT_TRACER = -1;

function coordInTracer(x, y) {
    return (TRACER_X < x && x < TRACER_END_X &&
	    TRACER_Y < y && y < TRACER_END_Y);
}

function coordInEditor(x, y) {
    for (var i=0; i < editingStation.length; i++) {
	if (EDITING_STATION_X[i] < x && x < EDITING_STATION_END_X[i] &&
	    EDITING_STATION_Y[i] < y && y < EDITING_STATION_END_Y[i]) {
	    return i;
	}
    }
    return NO_SLOT;
}

// buttons!
const BUTTON_SIZE = 30;
const BUTTON_TEXT_SIZE = 20;
const BUTTON_SPACE = 40; // space between centers of consecutive buttons on the same panel

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

function editingClick() {
    for (var i=0; i<editingStation.length; i++) {
	let idx = editingStation[i];
	if (idx < 0) { continue; }
	
	let x = EDITING_STATION_END_X[i] + BUTTON_SPACE;
	let y = (EDITING_STATION_Y[i] + EDITING_STATION_END_Y[i])/2;

	// reverse button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    myBarcodes[idx].reverse();
	    break;
	}
	x += BUTTON_SPACE;

	// squash button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    myBarcodes[idx].squash(2);
	    break;
	}
	x += BUTTON_SPACE;

	// stretch button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    myBarcodes[idx].stretch(1);
	    break;
	}
	x += BUTTON_SPACE;

	// slow button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    myBarcodes[idx].darken(2);
	    break;
	}
	x += BUTTON_SPACE;

	// speed button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    myBarcodes[idx].brighten(2);
	    break;
	}
	x += BUTTON_SPACE;

	// rotate button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    myBarcodes[idx].rotate(32);
	    break;
	}
	x += BUTTON_SPACE;

	// append to previous station button
	if (i>0 && dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    let otherbarc = editingStation[i-1];
	    if (otherbarc >= 0) { // both barcodes exist
		myBarcodes[otherbarc].concat(myBarcodes[idx]);
	    } else {
		// barcode is being "appended" to an empty station, so we make a copy
		let newx = EDITING_STATION_X[i-1];
		let newy = EDITING_STATION_Y[i-1];
		let newbarc = myBarcodes[idx].clone(newx, newy);
		editingStation[i-1] = myBarcodes.length;
		myBarcodes.push(newbarc);
	    }
	}
    }
}

function createPresetBarcodes() {
    for (let b=0; b < PRESETS_GEN.length; b++) {
	let frames = [];
	for (let i=0; i < PRESETS_DURATIONS[b]; i++) {
	    frames.push(PRESETS_GEN[b](i));
	}
	myBarcodes.push(new Barcode(PRESETS_X[b], PRESETS_Y[b], frames));
    }
}
