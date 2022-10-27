class FrameBarcode extends Barcode {
    constructor(xPos,yPos,data) {
	super(xPos, yPos);
        this.frames = data.map((x)=>x);
    }

    clone(x, y) {
	return new FrameBarcode(x, y, this.frames);
    }

    display() {
	strokeWeight(FRAME_WIDTH);
        for(i=0; i<this.frames.length; i+= BARCODE_DISPLAY_RESOLUTION){
            stroke(this.frames[i].getColor(),
		   this.frames[i].getSaturation(),
		   this.frames[i].getBrightness());
            line(this.x + i*FRAME_WIDTH/BARCODE_DISPLAY_RESOLUTION, this.y,
		 this.x + i*FRAME_WIDTH/BARCODE_DISPLAY_RESOLUTION, this.y+BARCODE_HEIGHT);
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
	    return coordToFrame(0,0);
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
    // factor must be > 1
    squash(factor) {
	let f = round(factor);
	for (var i = 1; i < this.frames.length; i++) {
	    this.frames.splice(i, f-1);
	}
    }

    // TODO replace this with something that tries to figure out better intermediate values
    // Paul please use your math powers
    // stretch a barcode of length len into one of length len*factor
    // by copying each frame (factor-1) times
    stretch(factor) {
	for (var i = 0; i < this.frames.length; i+=factor) {
            for (var j = 1; j < factor; j++) {
                this.frames.splice(i, 0, this.frames[i]);
            }
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
	if (barc instanceof FormulaBarcode) {
	    this.frames = this.frames.concat(barc.freeze().frames);
	} else if (barc instanceof FrameBarcode) {
	    this.frames = this.frames.concat(barc.frames);
	}
	this.crop();
	return this;
    }

    framewiseAdd(barc, x, y) {
	if (barc instanceof FormulaBarcode || barc instanceof FrameBarcode) {
	    let length = min(this.length(), barc.length());
	    let me = this.frames.slice(0, length);
	    let sum = me.map(function(f,i) { return f.addAsCoords(barc.getFrame(i)); });

	    return new FrameBarcode(x, y, sum);
	} else {
	    return this;
	}
    }

    framewiseMultiply(barc, x, y) {
	if (barc instanceof FormulaBarcode || barc instanceof FrameBarcode) {
	    let length = min(this.length(), barc.length());
	    let me = this.frames.slice(0, length);
	    
	    // note: we could use either multiply() or multiplyAsCoords() here
	    let prod = me.map(function(f,i) { return f.multiply(barc.getFrame(i)); });
	    
	    return new FrameBarcode(x, y, prod);
	} else {
	    return this;
	}
    }
}
