// barcode defined by an equation
// xPos, yPos - position of the barcode on the screen
// [start, stop) - set of indices on which this segment is defined
//                 should be between 0 and MAX_BARCODE_LENGTH
// eqn - function or Piecewise that takes a number and returns a frame
class FormulaBarcode extends Barcode {
    constructor(xPos, yPos, start, stop, eqn) {
	super(xPos, yPos);

	this.start = start;
	this.stop = stop;
	if (eqn instanceof Piecewise) {
	    this.eqn = eqn.extend(start,stop).contract(start,stop);
	} else {
	    this.eqn = new Piecewise(start, stop, eqn);
	}
    }

    clone(x = this.x, y = this.y) {
	return new FormulaBarcode(x, y, this.start, this.stop, this.eqn);
    }

    display() {
	strokeWeight(FRAME_WIDTH);
        for(i=0; i < this.stop; i+= BARCODE_DISPLAY_RESOLUTION){
	    if (i < this.start) {
		stroke(0);
	    } else {
		let frame = this.eqn.apply(i);
		if (frame) {
		    stroke(frame.getColor(), frame.getSaturation(), frame.getBrightness());
		}
	    }
	    line(this.x + i*FRAME_WIDTH/BARCODE_DISPLAY_RESOLUTION, this.y,
		 this.x + i*FRAME_WIDTH/BARCODE_DISPLAY_RESOLUTION, this.y+BARCODE_HEIGHT);
        }
    }

    getFrame(idx) {
	if (idx < this.start || idx >= this.stop) {
	    return super.getFrame(idx);
	} else {
	    return this.eqn.apply(idx);
	}
    }

    getLastFrame() {
	if (this.start >=0 && this.stop > 0) {
	    return this.eqn.apply(this.stop - 1);
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
	let s = this.stop;
	this.eqn = this.eqn.compose(function(x) { return s - x; },
				    function(x) { return s - x; });
    }

    // squash a barcode of length len to one of length len/factor
    // factor should be > 1
    squash(factor) {
	this.start = ceil(this.start / factor);
	this.stop = floor(this.stop / factor);
	this.eqn = this.eqn.compose(function(x) { return x * factor; },
				    function(x) { return x / factor; });
    }

    // stretch a barcode of length len to one of length len*factor
    // factor should be > 1
    stretch(factor) {
	this.start = ceil(this.start * factor);
	this.stop = floor(this.stop * factor);
	this.eqn = this.eqn.compose(function(x) { return x / factor; },
				    function(x) { return x * factor; });
	this.crop();
    }

    darken(factor) {
	let fn = function(fr) { return fr.manuallyScaleIntensity(1/factor); };
	this.eqn = this.eqn.composeLeft(fn);
    }

    brighten(factor) {
	let fn = function(fr) { return fr.manuallyScaleIntensity(factor); }
	this.eqn = this.eqn.composeLeft(fn);
    }

    extend(start, stop) {
	this.start = start;
	this.stop = stop;
	this.eqn = this.eqn.extend(start,stop);
    }

    // convert to frame-based barcode
    freeze(x = this.x, y = this.y) {
	let data = [];
	for (let i = 0; i < this.stop; i++) {
	    data.push(this.getFrame(i));
	}
	return new FrameBarcode(x, y, data);
    }

    // precondition: both barcodes must start at 0
    // to concatenate barcodes that already have non-overlapping domains,
    // use framewiseAdd
    concat(barc) {
	if (barc instanceof FormulaBarcode) {
	    let shiftAmt = this.stop;
	    let shift = barc.eqn.compose(function (x) { return x - shiftAmt; },
					 function (x) { return x + shiftAmt; });
	    this.eqn = this.eqn.combine(shift);
	    this.stop = this.stop + barc.stop;
	    this.crop();
	    return this;
	} else if (barc instanceof FrameBarcode) {
	    let result = this.freeze().concat(barc);
	    result.crop();
	    return result;
	} else {
	    return this;
	}
    }

    framewiseAdd(barc, x, y) {
	if (barc instanceof FrameBarcode) {
	    return barc.framewiseAdd(this, x, y);
	} else if (barc instanceof FormulaBarcode) {
	    let newstart = max(this.start, barc.start);
	    let newstop = min(this.stop, barc.stop);
	    let f = this.eqn.contract(newstart,newstop);
	    let g = barc.eqn.contract(newstart,newstop);
	    let neweqn = function(i) { return f.apply(i).addAsCoords(g.apply(i)); };

	    return new FormulaBarcode(x, y, newstart, newstop, neweqn);
	} else {
	    return this;
	}
    }

    framewiseMultiply(barc, x, y) {
	if (barc instanceof FrameBarcode) {
	    return barc.framewiseMultiply(this, x, y);
	} else if (barc instanceof FormulaBarcode) {
	    let newstart = max(this.start, barc.start);
	    let newstop = min(this.stop, barc.stop);
	    let f = this.eqn.contract(newstart,newstop);
	    let g = barc.eqn.contract(newstart,newstop);
	    // note: we could use either multiply() or multiplyAsCoords() here
	    let neweqn = function(i) { return f.apply(i).multiply(g.apply(i)); };

	    return new FormulaBarcode(x, y, newstart, newstop, neweqn);
	} else {
	    return this;
	}
    }
}
