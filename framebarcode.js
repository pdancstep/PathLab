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

    // stretch a barcode of length len into one of length len*factor
    // uses cubic interpolation to create intermediate frames
    stretch(factor) {
        function P0(t) {
            return (2*t*t*t-3*t*t+1);
        }
        
        function M0(t) {
            return (t*t*t-2*t*t+t);
        }
        
        function P1(t) {
            return (-2*t*t*t + 3*t*t);
        }
        
        function M1(t) {
            return (t*t*t-t*t);
        }
        
        function makeInter(p0, p1, m0, m1, interval) {
            let f = function(t) {
                let tnorm = t/interval;
                let a = p0.scale(P0(tnorm));
                let b = p1.scale(P1(tnorm));
                let c = m0.scale(M0(tnorm));
                let d = m1.scale(M1(tnorm));
                return a.translate(b).translate(c).translate(d).toFrame();
            }
            return f;
        }
        
        // phase 1: compute interpolation function
        let p0 = this.getFrame(0).getCoord();
        let m0 = new Coord(0,0);
        let p1 = this.getFrame(1).getCoord();
        let m1 = this.getFrame(2).getCoord().subtract(p0).scale(1/2);
        
        let f = new Piecewise(0, 1, makeInter(p0,p1,m0,m1,this.length()));
        
        for (let i = 2; i < this.length()-1; i++) {
            p0 = p1;
            m0 = m1;
            p1 = this.getFrame(i).getCoord();
            m1 = this.getFrame(i+1).getCoord().subtract(p0).scale(1/2);
            
            f = f.combine(new Piecewise(i-1, i, makeInter(p0,p1,m0,m1,this.length())));
        }
        
        p0 = p1;
        m0 = m1;
        p1 = this.getLastFrame().getCoord();
        m1 = new Coord(0,0);
        
        f = f.combine(new Piecewise(this.length()-1,this.length(),
                                    makeInter(p0,p1,m0,m1,this.length())));
        
        // phase 2: sample interpolation function to compute new frames
        let newlength = floor(this.length() * factor);
        let samplingWidth = this.length()/newlength;
        
        let newframes = [];
        for (let i = 0; i < newlength; i++) {
            let fr = f.apply(samplingWidth*i);
            if (fr) {
                newframes.push(fr);
            } else {
                //console.log("error sampling at t=" + samplingWidth*i);
            }
        }
        
        this.frames = newframes;
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
	    let newcolor = (this.frames[i].getColor() + angle) % 256;
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
