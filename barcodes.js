const MAX_BARCODE_LENGTH = 200;

class Barcode {
    constructor(xPos,yPos,data) {
	// fields for moving the barcode itself around the canvas
        //position
        this.x = xPos;
        this.y = yPos;
        this.dragging = false;
        this.offsetX = 0; // position relative to xPos where barcode was grabbed
        this.offsetY = 0; // position relative to yPos where barcode was grabbed

	// fields for handling the data in the barcode
        this.frames = data.map((x)=>x);
    }

    // methods for moving barcodes around the canvas
    onClick(){
        if (this.x < mouseX && mouseX < this.x + (this.frames.length*FRAME_WIDTH) &&
	    this.y < mouseY && mouseY < this.y + BARCODE_HEIGHT) {
            this.offsetX = this.x - mouseX;
            this.offsetY = this.y - mouseY;
            this.dragging = true;
	    return true;
        } else {
	    return false;
	}
    }

    clone(x, y) {
	return new Barcode(x, y, this.frames);
    }

    // release mouse - returns slot we ended up in
    onRelease() {
	let slot = NO_SLOT;
	if (this.dragging) {
	    if (editingStation<0 && coordInEditor(mouseX, mouseY)) {
		this.x = EDITING_STATION_X;
		this.y = EDITING_STATION_Y;
		slot = SLOT_EDITOR;
	    }
	    if (coordInTracer(mouseX, mouseY)) {
		slot = SLOT_TRACER;
	    }
	}
        this.dragging = false;
	return slot;
    }

    update() {
        if (this.dragging){
            this.x = mouseX + this.offsetX;
            this.y = mouseY + this.offsetY;
        }  
    }

    display() {
	strokeWeight(FRAME_WIDTH);
        for(i=0; i<this.frames.length; i++){
            stroke(this.frames[i].getColor(),
		   this.frames[i].getSaturation(),
		   this.frames[i].getBrightness());
            line(this.x + 2*i, this.y, this.x + 2*i, this.y + BARCODE_HEIGHT);
        }
    }

    // methods for recording and playback
    addFrame(fr) {
	this.frames.push(fr);
	// if full, remove oldest frame
	if (this.frames.length > MAX_BARCODE_LENGTH) {
	    return this.frames.shift();
	}
	else {
	    return null;
	}
    }
    
    getFrame(index) {
        if (0 <= index && index < this.frames.length) {
	    return this.frames[index];
	} else {
	    return null;
	}
    }

    getLastFrame() {
	if (this.frames.length > 0) {
	    return this.frames[this.frames.length-1];
	} else {
	    return null;
	}
    }

    isFull() {
	return (this.frames.length >= MAX_BARCODE_LENGTH);
    }

    length() {
	return this.frames.length;
    }

    // methods for editing frame data
    reverse() {
	this.frames.reverse();
    }
}
