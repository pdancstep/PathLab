// basic container for a barcode
class Slot {
    constructor(x, y) {
	this.barcode = new Barcode(x, y, []);
	this.displayX = x;
	this.displayY = y;
    }

    display() {
	this.barcode.display();
	noFill();
	stroke(200);
	rect(this.displayX, this.displayY, SLOT_WIDTH, BARCODE_HEIGHT);
	this.drawButtons();
    }

    drawButtons() {} // basic slot has no buttons; subclasses should override this

    inside(x, y) {
	return (this.displayX < x && x < this.displayX + SLOT_WIDTH &&
		this.displayY < y && y < this.displayY + BARCODE_HEIGHT);
    }
    
    // check if we're dropping a barcode on this slot.
    // put it in the slot if appropriate
    onRelease() {
	// TODO
    }

    // clone the barcode held in this slot and put the new one at given coordinates
    eject(x, y) {
	return this.barcode.clone(x, y);
    }

    // replace currently-held barcode with an empty barcode
    clear() {
	this.barcode = new Barcode(this.displayX, this.displayY, []);
    }

    copyData(x, y) {
	return this.barcode.clone(x, y);
    }
}
