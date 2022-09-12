const MAX_BARCODE_LENGTH = 510;
const BARCODE_DISPLAY_RESOLUTION = 2;

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
	return new Barcode(x, y, this.frames);
    }

    // release mouse - returns slot we ended up in
    // TODO remove this functionality from this class
    // it should now be handled by Slot.onRelease()
    onRelease() {
	let slot = -2;
	if (this.dragging) {
	    let n = coordInEditor(mouseX, mouseY);
	    if (n >= 0 && editingStation[n] < 0) {
		this.x = EDITING_STATION_X[n];
		this.y = EDITING_STATION_Y[n];
		slot = n;
	    }
	    if (coordInTracer(mouseX, mouseY)) {
		slot = -1;
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
        for(i=0; i<this.frames.length/BARCODE_DISPLAY_RESOLUTION; i++){
            stroke(this.frames[i*BARCODE_DISPLAY_RESOLUTION].getColor(),
		   this.frames[i*BARCODE_DISPLAY_RESOLUTION].getSaturation(),
		   this.frames[i*BARCODE_DISPLAY_RESOLUTION].getBrightness());
            line(this.x + i*FRAME_WIDTH, this.y,
		 this.x + i*FRAME_WIDTH, this.y + BARCODE_HEIGHT);
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

    // returns the coordinate for the displacement vector from applying
    // this portion of the barcode as velocities
    displacement(start = 0, end = this.frames.length) {
	let pos = new Coord(0,0);
	for (let i = start; i < end; i++) {
	    pos = this.frames[i].applyAsVelocity(pos);
	}
	return pos;
    }
    
    // methods for editing frame data
    crop(len = MAX_BARCODE_LENGTH) {
	if (this.frames.length > len) {
	    this.frames = this.frames.slice(0, len);
	}
    }
    
    reverse() {
	this.frames.reverse();
    }

    // squash a barcode of length len to one of length len/factor
    // factor must be an integer > 1
    squash(factor) {
	for (var i = 0; i < this.frames.length-1; i+=factor-1) {
	    this.frames.splice(i, 1);
	}
    }

    // stretch a barcode of length len to one of length len + len/rate
    // (i.e. duplicate every rate'th frame)
    // rate must be an integer > 0
    stretch(rate) {
	for (var i = 0; i < this.frames.length; i+=rate+1) {
	    this.frames.splice(i, 0, this.frames[i]);
	}
	this.crop();
    }

    darken(factor) {
	for (var i = 0; i < this.frames.length; i++) {
	    this.frames[i] = this.frames[i].manuallyScaleIntensity(1/factor);
	}
    }

    brighten(factor) {
	for (var i = 0; i < this.frames.length; i++) {
	    this.frames[i] = this.frames[i].manuallyScaleIntensity(factor);
	}
    }

    // add the given angle to the color value of each frame
    // angle should be on the 0-255 scale, NOT degrees or radians
    rotate(angle) {
	for (var i = 0; i < this.frames.length; i++) {
	    let newcolor = (this.frames[i].getColor() + angle) % 255;
	    this.frames[i] = new Frame(newcolor,
				       this.frames[i].getBrightness(),
				       this.frames[i].getSaturation());
	}
    }

    concat(barc) {
	this.frames = this.frames.concat(barc.frames);
	this.crop();
    }

    framewiseAdd(barc, x, y) {
	let length = min(this.frames.length, barc.frames.length);
	let me = this.frames.slice(0, length);
	let you = barc.frames.slice(0, length);
	let sum = me.map(function(f,i) { return f.addAsCoords(you[i]); });
	
	return new Barcode(x, y, sum);
    }

    framewiseMultiply(barc, x, y) {
	let length = min(this.frames.length, barc.frames.length);
	let me = this.frames.slice(0, length);
	let you = barc.frames.slice(0, length);

	// note: we could use either multiply() or multiplyAsCoords() here
	let prod = me.map(function(f,i) { return f.multiply(you[i]); });
	
	return new Barcode(x, y, prod);
    }
}
