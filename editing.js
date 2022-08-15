//container for all barcode instances
var myBarcodes = [];

// location where barcodes initially spawn into the editing area
const SPAWN_X = 750;
const SPAWN_Y = 500;

function spawnBarcode() {
    myBarcodes.push(tracer.clone(SPAWN_X, SPAWN_Y));
}
