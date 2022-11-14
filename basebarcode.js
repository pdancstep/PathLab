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
        if (this.inside(mouseX, mouseY)) {
            this.offsetX = this.x - mouseX;
            this.offsetY = this.y - mouseY;
            this.dragging = true;
	    return true;
        } else {
	    return false;
	}
    }

    inside(x, y) {
	let w = this.length() * FRAME_WIDTH / BARCODE_DISPLAY_RESOLUTION;
	return (this.x < x && x < this.x + w &&
		this.y < y && y < this.y + BARCODE_HEIGHT);
    }

    isBeingDragged() {
	return this.dragging;
    }
    
    clone(x, y) {
	return new Barcode(x, y);
    }

    onRelease() {
	if (this.dragging) {
	    this.dragging = false;
	    for (let i=0; i<transformers.length; i++) {
		if (transformers[i].inside(mouseX, mouseY)) {
		    return transformers[i].installBarcode(this);
		}
	    }
            for (let i=0; i<bonusSlots.length; i++) {
		if (bonusSlots[i].inside(mouseX, mouseY)) {
		    return bonusSlots[i].installBarcode(this);
		}
	    }
            if (ptracer.inside(mouseX, mouseY)) {
                return ptracer.installBarcode(this);
            } else if (jtracer.inside(mouseX, mouseY)) {
                return jtracer.installBarcode(this);
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
    }

    getFrame(idx) {
	return coordToFrame(0,0);
    }

    getLastFrame() {
	return coordToFrame(0,0);
    }

    length() {
	return 0;
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

    // placeholder methods for transformations (define in subclasses)
    reverse() {}
    squash(factor) {}
    stretch(factor) {}
    darken(factor) {}
    brighten(factor) {}
    rotate(angle) {}
    concat(barc) { return this; }
    framewiseAdd(barc, x, y) { return this; }
    framewiseMultiply(barc, x, y) {return this; }
}
