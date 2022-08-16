var myBarcodes = [];

var editingStation = -1;
const EDITING_STATION_X = 750;
const EDITING_STATION_Y = 100;
const EDITING_STATION_END_X = 1150;
const EDITING_STATION_END_Y = 150;

const TRACER_X = 750;
const TRACER_Y = 700;
const TRACER_END_X = 1150;
const TRACER_END_Y = 750;

// location where barcodes initially spawn into the editing area
const SPAWN_X = 750;
const SPAWN_Y = 500;

function spawnBarcode() {
    myBarcodes.push(tracer.clone(SPAWN_X, SPAWN_Y));
}

const NO_SLOT = -1;
const SLOT_TRACER = 0;
const SLOT_EDITOR = 1;

function coordInTracer(x, y) {
    return (TRACER_X < x && x < TRACER_END_X &&
	    TRACER_Y < y && y < TRACER_END_Y);
}

function coordInEditor(x, y) {
    return (EDITING_STATION_X < x && x < EDITING_STATION_END_X &&
	    EDITING_STATION_Y < y && y < EDITING_STATION_END_Y);
}
