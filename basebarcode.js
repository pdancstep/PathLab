// base class for barcode hierarchy. does not actually contain any data
class Barcode {
    constructor(xPos, yPos) {
        this.x = xPos;
        this.y = yPos;
        this.dragging = false;
        this.offsetX = 0; // position relative to xPos where barcode was grabbed
        this.offsetY = 0; // position relative to yPos where barcode was grabbed
    }

    // methods for moving barcodes around the canvas
    onClick(){
	let w = this.frames.length * FRAME_WIDTH / BARCODE_DISPLAY_RESOLUTION;
        if (this.x < mouseX && mouseX < this.x + w &&
	    this.y < mouseY && mouseY < this.y + BARCODE_HEIGHT) {
            this.offsetX = this.x - mouseX;
            this.offsetY = this.y - mouseY;
            this.dragging = true;
	    return true;
        } else {
	    return false;
	}
    }

    isBeingDragged() {
	return this.dragging;
    }

    clone(x, y) {
	return new Barcode(x, y);
    }

    // TODO this is still hardcoded to the particular slot setup.
    // should generalize and let sketch.js handle this
    onRelease() {
	if (this.dragging) {
	    this.dragging = false;
	    if (transform1.inside(mouseX, mouseY)) {
		return transform1.installBarcode(this);
	    } else if (transform2.inside(mouseX, mouseY)) {
		return transform2.installBarcode(this);
	    } else if (tracer.inside(mouseX, mouseY)) {
		return tracer.installBarcode(this);
	    }
	}
	return false;
    }

    update() {
        if (this.dragging){
            this.x = mouseX + this.offsetX;
            this.y = mouseY + this.offsetY;
        }  
    }

    display() {
	fill(0);
	rect(this.x, this.y, SLOT_WIDTH, BARCODE_HEIGHT);
    }

    getFrame(idx) {
	return coordToFrame(0,0);
    }

    getLastFrame() {
	return coordToFrame(0,0);
    }

    // returns the coordinate for the displacement vector from applying
    // this portion of the barcode as velocities
    displacement(start = 0, end = this.length()) {
	let pos = new Coord(0,0);
	for (let i = start; i < end; i++) {
	    pos = this.getFrame(i).applyAsVelocity(pos);
	}
	return pos;
    }
}
