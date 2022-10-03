// basic container for a barcode
class Slot {
    constructor(x, y) {
	this.barcode = new Barcode(x, y);
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

    // TODO make eject button part of basic slot?
    drawButtons() {} // basic slot has no buttons; subclasses should override this

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
	this.barcode = new FrameBarcode(this.displayX, this.displayY, []);
    }

    installBarcode(barc) {
	this.barcode = barc.clone(this.displayX, this.displayY);
	return true;
    }
    
    copyData(x, y) {
	return this.barcode.clone(x, y);
    }
}
