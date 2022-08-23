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

// location where barcodes initially spawn into the editing area
const SPAWN_X = 750;
const SPAWN_Y = 550;

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
}

function editingClick() {
    for (var i=0; i<editingStation.length; i++) {
	let x = EDITING_STATION_END_X[i] + BUTTON_SPACE;
	let y = (EDITING_STATION_Y[i] + EDITING_STATION_END_Y[i])/2;

	// reverse button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    if (editingStation[i] >=0) {
		myBarcodes[editingStation[i]].reverse();
	    }
	    break;
	}
	x += BUTTON_SPACE;

	// squash button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    if (editingStation[i] >= 0) {
		myBarcodes[editingStation[i]].squash();
	    }
	    break;
	}
	x += BUTTON_SPACE;

	// stretch button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    if (editingStation[i] >= 0) {
		myBarcodes[editingStation[i]].stretch();
	    }
	    break;
	}
	x += BUTTON_SPACE;

	// slow button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    if (editingStation[i] >= 0) {
		myBarcodes[editingStation[i]].darken();
	    }
	    break;
	}
	x += BUTTON_SPACE;

	// speed button
	if (dist(mouseX, mouseY, x, y) < BUTTON_SIZE/2) {
	    if (editingStation[i] >= 0) {
		myBarcodes[editingStation[i]].brighten();
	    }
	    break;
	}
    }
}
