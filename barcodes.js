// base class for barcode hierarchy. does not actually contain any data
class BarcodeBase {
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
	return new BarcodeBase(x, y);
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

// barcode with specific frame data
class Barcode extends BarcodeBase {
    constructor(xPos,yPos,data) {
	super(xPos, yPos);
        this.frames = data.map((x)=>x);
    }

    clone(x, y) {
	return new Barcode(x, y, this.frames);
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

    // TODO replace this method with a method that does the actual intuitive thing
    // where length len becomes length len times the argument given to the method
    // Paul please use your math powers
    
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
	if (barc instanceof Segment) {
	    this.frames = this.frames.concat(barc.freeze().frames);
	} else if (barc instanceof Barcode) {
	    this.frames = this.frames.concat(barc.frames);
	}
	this.crop();
    }

    framewiseAdd(barc, x, y) {
	let length = min(this.frames.length, barc.frames.length);
	let me = this.frames.slice(0, length);
	let you = barc.clone(0,0);
	you.crop(length);
	let sum = me.map(function(f,i) { return f.addAsCoords(you.getFrame(i)); });
	
	return new Barcode(x, y, sum);
    }

    framewiseMultiply(barc, x, y) {
	let length = min(this.frames.length, barc.frames.length);
	let me = this.frames.slice(0, length);
	let you = barc.clone(0,0);
	you.crop(length);

	// note: we could use either multiply() or multiplyAsCoords() here
	let prod = me.map(function(f,i) { return f.multiply(you.getFrame(i)); });
	
	return new Barcode(x, y, prod);
    }
}
