// basic container for a barcode
class Slot {
    constructor(x, y) {
	this.barcode = new Barcode(x, y);
	this.displayX = x;
	this.displayY = y;
        this.displayType = 0;
    }

    display(background = 150) {
	fill(background);
	stroke(200);
        if (this.displayType==0) {
            strokeWeight(FRAME_WIDTH);
	    rect(this.displayX, this.displayY, SLOT_WIDTH, BARCODE_HEIGHT);
        } else {
            strokeWeight(FRAME_WIDTH*2);
            rect(this.displayX, this.displayY,
                 this.barcode.length()*FRAME_WIDTH/BARCODE_DISPLAY_RESOLUTION,
                 BARCODE_HEIGHT);
        }
        this.barcode.display();
    }

    presetStyle() {
        this.displayType = 1;
    }

    inside(x, y) {
	return (this.displayX < x && x < this.displayX + SLOT_WIDTH &&
		this.displayY < y && y < this.displayY + BARCODE_HEIGHT);
    }
    
    // clone the barcode held in this slot and put the new one at given coordinates
    eject(x, y) {
	return this.barcode.clone(x, y);
    }

    // replace currently-held barcode with an empty barcode
    clear() {
        // wait why did I have it do an empty FrameBarcode and not a base barcode?
	this.barcode = new FrameBarcode(this.displayX, this.displayY, []);
    }

    onClick() {
	let copy = this.eject(this.displayX, this.displayY);
	if (copy.onClick()) {
	    freeBarcodes.push(copy);
	}
    }
    
    installBarcode(barc) {
	this.barcode = barc.clone(this.displayX, this.displayY);
	return true;
    }
    
    copyData(x, y) {
	return this.barcode.clone(x, y);
    }
}

function spawnBarcode(source, location = new Coord(SPAWN_X, SPAWN_Y)) {
    freeBarcodes.push(source.eject(location.getX(), location.getY()));
}
