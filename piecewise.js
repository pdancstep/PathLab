class Piecewise {
    constructor(start, stop, formula, errorval = null) {
	this.starts = [start];
	this.stops = [stop];
	this.components = [formula];
	this.errorval = errorval;
    }

    apply(n) {
	for (let i=0; i<this.components.length; i++) {
	    if (n <= this.starts[i]) {
		return this.errorval;
	    }
	    if (n < this.stops[i]) {
		return this.components[i](n);
	    }
	}
	return this.errorval;
    }
    
    start() {
	return this.starts[0];
    }

    stop() {
	return this.stops[this.stops.length-1];
    }

    // add additional piecewise components
    // piece - Piecewise to be merged into this
    //         note that all its components will be removed
    // conf - how to handle conflicts (segments with overlapping domains)
    //        by default, favors this and drops overlapping parts of piece
    combine(piece, conf = function () {}) {
	for (let i=0; i<this.components.length; i++) {
	    if (piece.components.length == 0) {
		// no components left to merge
		break;
	    }
	    if (this.stops[i] <= piece.starts[0]) {
		// this[i] is entirely before piece[0], nothing to do
	    } else if (piece.stops[0] <= this.starts[i]) {
		// piece[0] is entirely before this[i]
		this.starts.splice(i, 0, piece.starts.shift());
		this.stops.splice(i, 0, piece.stops.shift());
		this.components.splice(i, 0, piece.components.shift());
		i++; // not strictly necessary; avoids reprocessing the just-added element
	    } else {
		// pieces overlap

		// if new piece starts first. add a segment before this[i] 
		if (piece.starts[0] < this.starts[i]) {
		    this.starts.splice(i, 0, piece.starts[0]);
		    this.stops.splice(i, 0, this.starts[i]);
		    this.components.splice(i, 0, piece.components[0]);
		    piece.starts[0] = this.starts[i];
		}

		// handle overlapping segment
		// TODO make this configurable
		// for now just truncate piece[0] to the part after the end of this[i] 
		piece.starts[0] = this.stops[i];
		
		// if there's nothing actually left to this component, delete it
		if (piece.stops[0] >= piece.starts[0]) {
		    piece.starts.shift();
		    piece.stops.shift();
		    piece.components.shift();
		}
	    }
	}
	// merge whatever remains after we pass the existing domain
	this.starts = this.starts.concat(piece.starts);
	this.stops = this.stops.concat(piece.stops);
	this.components = this.components.concat(piece.components);
    }
}
