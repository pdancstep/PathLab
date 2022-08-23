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
