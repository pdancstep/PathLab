// barcode defined by an equation
// xPos, yPos - position of the barcode on the screen
// [start, stop) - set of indices on which this segment is defined
//                 should be between 0 and MAX_BARCODE_LENGTH
// eqn - procedure that takes a number and returns a frame
class Segment extends BarcodeBase {
    constructor(xPos, yPos, start, stop, eqn) {
	super(xPos, yPos);

	this.start = start;
	this.stop = stop;
	this.eqn = eqn;
    }

    clone(x, y) {
	return new Segment(x, y, this.start, this.stop, this.eqn);
    }

    display() {
	strokeWeight(FRAME_WIDTH);
        for(i=0; i < this.stop; i+= BARCODE_DISPLAY_RESOLUTION){
	    if (i < this.start) {
		stroke(0);
	    } else {
		let frame = this.eqn(i);
		stroke(frame.getColor(), frame.getSaturation(), frame.getBrightness());
	    }
	    line(this.x + i*FRAME_WIDTH, this.y,
		 this.x + i*FRAME_WIDTH, this.y + BARCODE_HEIGHT);
        }
    }

    getFrame(idx) {
	if (idx < this.start || idx >= this.stop) {
	    return super.getFrame(idx);
	} else {
	    return this.eqn(idx);
	}
    }

    getLastFrame() {
	if (this.start >=0 && this.stop > 0) {
	    return this.eqn(this.stop - 1);
	}
    }

    length() {
	return this.stop;
    }

    crop(len = MAX_BARCODE_LENGTH) {
	if (this.stop > len) {
	    this.stop = len;
	    this.start = min(this.start, len);
	}
    }

    reverse() {
	let f = this.eqn;
	let s = this.stop
	this.eqn = function(i) { return f(s - i); };
    }

    // squash a barcode of length len to one of length len/factor
    // factor should be > 1
    squash(factor) {
	this.start = ceil(this.start / factor);
	this.stop = floor(this.stop / factor);
	let f = this.eqn;
	this.eqn = function(i) { return f(i * factor); };
    }

    // stretch a barcode of length len to one of length len*factor
    // factor should be > 1
    stretch(factor) {
	this.start = ceil(this.start * factor);
	this.stop = floor(this.stop * factor);
	let f = this.eqn;
	this.eqn = function(i) { return f(i / factor); }
    }

    darken(factor) {
	let f = this.eqn;
	this.eqn = function(i) { return f(i).manuallyScaleIntensity(1/factor); };
    }

    brighten(factor) {
	let f = this.eqn;
	this.eqn = function(i) { return f(i).manuallyScaleIntensity(factor); };
    }

    extend(start, stop) {
	this.start = start;
	this.stop = stop;
    }

    // convert to frame-based barcode
    freeze(x = this.x, y = this.y) {
	let data = [];
	for (let i = 0; i < this.stop; i++) {
	    data.push(this.getFrame(i));
	}
	return new Barcode(x, y, data);
    }

    concat(barc) {
	return this.freeze.concat(barc);
    }
    
    framewiseAdd(barc, x, y) {
	if (barc instanceof Barcode) {
	    return barc.framewiseAdd(this, x, y);
	} else if (barc instanceof Segment) {
	    let newstart = max(this.start, barc.start);
	    let newstop = min(this.stop, barc.stop);
	    let f = this.eqn;
	    let g = barc.eqn;
	    let neweqn = function(i) { return f(i).addAsCoords(g(i)); };

	    return new Segment(x, y, newstart, newstop, neweqn);
	}
    }

    framewiseMultiply(barc, x, y) {
	if (barc instanceof Barcode) {
	    return barc.framewiseMultiply(this, x, y);
	} else if (barc instanceof Segment) {
	    let newstart = max(this.start, barc.start);
	    let newstop = min(this.stop, barc.stop);
	    let f = this.eqn;
	    let g = barc.eqn;
	    // note: we could use either multiply() or multiplyAsCoords() here
	    let neweqn = function(i) { return f(i).multiply(g(i)); };

	    return new Segment(x, y, newstart, newstop, neweqn);
	}
    }
}
