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

    // check that there are no gaps between components of the domain
    hasContinuousDomain() {
	for (let i=1; i < this.components.length; i++) {
	    if (this.stops[i-1] != this.starts[i]) {
		return false;
	    }
	}
	return true;
    }

    // add additional piecewise components
    // piece - Piecewise to be merged into this
    //         note that all its components will be removed
    // note if domains overlap, we favor this and drop overlapping parts of piece
    combine(piece) {
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
		// truncate piece[0] to only include the part after the end of this[i] 
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

    // for each component function p(x), replace it with p(f(x))
    compose(f) {
	for (let i=0; i < this.components.length; i++) {
	    let p = this.components[i];
	    this.components[i] = function(n) { return p(f(n)); }
	}
    }
    
    // for each component function p(x), replace with f(p(x))
    composeLeft(f) {
	for (let i=0; i < this.components.length; i++) {
	    let p = this.components[i];
	    this.components[i] = function(n) { return f(p(n)); }
	}
    }

    // extend the domain by using the nearest component
    extend(start, stop) {
	if (this.start() > start) {
	    this.starts[0] = start;
	}
	if (this.stop() < stop) {
	    this.stops[this.stops.length-1] = stop;
	}
    }
}

// given Piecewise functions p1(x) and p2(x) and a binary operation f(a,b),
// define the Piecewise function f(p1(x), p2(x))
function performBinaryOperation(p1, p2, f) {
    if (p1.start() != p2.start() || p1.stop() != p2.stop()) {
	console.log("Error: Tried to build a binary operation out of Piecewise functions with different domains.");
	return null;
    }
    if (!p1.hasContinuousDomain() || !p2.hasContinuousDomain()) {
	console.log("Error: Tried to build a binary operation using a Piecewise function with gaps in its domain.");
	return null;
    }
    let st = 0;
    let nd = min(p1.stops[i1], p2.stops[i2]);
    let i1 = 0;
    let i2 = 0;
    let f0 = function(x) { return f(p1.components[i1](x), p2.components[i2](x)); };
    let pf = new Piecewise(st, nd, f0, p1.errorval);

    while (nd < p1.stop()) {
	// next segment starts where the last one ended
	st = nd;

	// but figuring out where it ends requires moving to the next component
	// of one or both input functions
	if (nd == p1.stops[i1]) { i1++; };
	if (nd == p2.stops[i2]) { i2++; };	
	nd = min(p1.stops[i1], p2.stops[i2]);

	if (st < nd) {
	    let fn = function(x) { return f(p1.components[i1](x), p2.components[i2](x)); };
	    pf.combine(new Piecewise(st, nd, fn));
	} else {
	    console.log("Error: something weird happened while trying to build a binary operation out of Piecewise functions");
	    return null;
	}
    }

    return pf;
}
