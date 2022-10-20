class Piecewise {
    constructor(start, stop, formula, errorval = null) {
	this.starts = [start];
	this.stops = [stop];
	this.components = [formula];
	this.errorval = errorval;
    }

    apply(n) {
	for (let i=0; i<this.components.length; i++) {
	    if (n < this.starts[i]) {
		return this.errorval;
	    }
	    if (n < this.stops[i]) {
		return this.components[i](n);
	    }
	}
	return this.errorval;
    }
    
    getStart() {
	return this.starts[0];
    }

    getStop() {
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

    copy() {
	let pw = new Piecewise(null, null, null, this.errorval);
	pw.starts = this.starts.slice();
	pw.stops = this.stops.slice();
	pw.components = this.components.slice();
	return pw;
    }

    // return component lists to canonical form
    sort() {
	// remove any empty components
	for (let i=0; i<this.components.length; i++) {
	    if (this.starts[i]==this.stops[i]) {
		this.starts.splice(i,1);
		this.stops.splice(i,1);
		this.components.splice(i,1);
		i--; // reset index so we don't skip a component
	    }
	}
	// flip any backwards components
	for (let i=0; i<this.components.length; i++) {
	    if (this.starts[i] > this.stops[i]) {
		let temp = this.starts[i];
		this.starts[i] = this.stops[i];
		this.stops[i] = temp;
	    }
	}

	// put the components in order
	let zip = []; 
	for (let i=0; i<this.components.length; i++) {
	    zip.push([this.starts[i],this.stops[i],this.components[i]]);
	}
	zip.sort(function(a, b) { return a[0] - b[0]; });
	for (let i=0; i<this.components.length; i++) {
	    this.starts[i] = zip[i][0];
	    this.stops[i] = zip[i][1];
	    this.components[i] = zip[i][2];
	}
    }

    // add additional piecewise components
    // piece - Piecewise to be merged into this
    //         note that all its components will be removed
    // note if domains overlap, we favor this and drop overlapping parts of piece
    combine(piece) {
	let base = this.copy();
	for (let i=0; i<base.components.length; i++) {
	    if (piece.components.length == 0) {
		// no components left to merge
		break;
	    }
	    if (base.stops[i] <= piece.starts[0]) {
		// this[i] is entirely before piece[0], nothing to do
	    } else if (piece.stops[0] <= base.starts[i]) {
		// piece[0] is entirely before this[i]
		base.starts.splice(i, 0, piece.starts.shift());
		base.stops.splice(i, 0, piece.stops.shift());
		base.components.splice(i, 0, piece.components.shift());
		i++; // not strictly necessary; avoids reprocessing the just-added element
	    } else {
		// pieces overlap

		// if new piece starts first. add a segment before this[i] 
		if (piece.starts[0] < base.starts[i]) {
		    base.starts.splice(i, 0, piece.starts[0]);
		    base.stops.splice(i, 0, base.starts[i]);
		    base.components.splice(i, 0, piece.components[0]);
		    piece.starts[0] = base.starts[i];
		}

		// handle overlapping segment
		// truncate piece[0] to only include the part after the end of this[i] 
		piece.starts[0] = base.stops[i];
		
		// if there's nothing actually left to this component, delete it
		if (piece.stops[0] >= piece.starts[0]) {
		    piece.starts.shift();
		    piece.stops.shift();
		    piece.components.shift();
		}
	    }
	}
	// merge whatever remains after we pass the existing domain
	base.starts = base.starts.concat(piece.starts);
	base.stops = base.stops.concat(piece.stops);
	base.components = base.components.concat(piece.components);
	return base;
    }

    // for each component function p(x), replace it with p(f(x))
    // f is expected to map an interval to an interval
    // in general, needs the inverse of f to correctly update the domain
    compose(f, finv) {
	let base = this.copy();
	for (let i=0; i < base.components.length; i++) {
	    let p = base.components[i];
	    base.components[i] = function(n) { return p(f(n)); }
	    base.starts[i] = finv(base.starts[i]);
	    base.stops[i] = finv(base.stops[i]);
	}
	base.sort();
	return base;
    }
    
    // for each component function p(x), replace with f(p(x))
    composeLeft(f) {
	let base = this.copy();
	for (let i=0; i < base.components.length; i++) {
	    let p = base.components[i];
	    base.components[i] = function(n) { return f(p(n)); }
	}
	return base;
    }

    // extend the domain by using the nearest component
    extend(start, stop) {
	let base = this.copy();
	if (base.getStart() > start) {
	    base.starts[0] = start;
	}
	if (base.getStop() < stop) {
	    base.stops[base.stops.length-1] = stop;
	}
	return base;
    }

    // reduce the domain to the given interval
    contract(start, stop) {
	let base = this.copy();

	// remove any components completely outside the new domain
	while (base.components.length > 0 && base.stops[0] < start) {
	    base.starts.shift();
	    base.stops.shift();
	    base.components.shift();
	}
	while (base.components.length > 0 &&
	       base.starts[base.starts.length-1] > stop) {
	    base.starts.pop();
	    base.stops.pop();
	    base.components.pop();
	}

	// truncate first and last remaining component to new domain
	if (base.components.length > 0 && base.starts[0] < start) {
	    base.starts[0] = start;
	}
	if (base.components.length > 0 && base.stops[base.stops.length-1] > stop) {
	    base.stops[base.stops.length-1] = stop;
	}
	
	return base;
    }
}

// given Piecewise functions p1(x) and p2(x) and a binary operation f(a,b),
// define the Piecewise function f(p1(x), p2(x))
function performBinaryOperation(p1, p2, f) {
    if (p1.getStart() != p2.getStart() || p1.getStop() != p2.getStop()) {
	console.log("Error: Tried to build a binary operation out of Piecewise functions with different domains.");
	return null;
    }
    if (!p1.hasContinuousDomain() || !p2.hasContinuousDomain()) {
	console.log("Error: Tried to build a binary operation using a Piecewise function with gaps in its domain.");
	return null;
    }
    let i1 = 0;
    let i2 = 0;
    let st = 0;
    let nd = min(p1.stops[i1], p2.stops[i2]);
    let f0 = function(x) { return f(p1.components[i1](x), p2.components[i2](x)); };
    let pf = new Piecewise(st, nd, f0, p1.errorval);

    while (nd < p1.getStop()) {
	// next segment starts where the last one ended
	st = nd;

	// but figuring out where it ends requires moving to the next component
	// of one or both input functions
	if (nd == p1.stops[i1]) { i1++; };
	if (nd == p2.stops[i2]) { i2++; };	
	nd = min(p1.stops[i1], p2.stops[i2]);

	if (st < nd) {
	    let fn = function(x) { return f(p1.components[i1](x), p2.components[i2](x)); };
	    pf = pf.combine(new Piecewise(st, nd, fn));
	} else {
	    console.log("Error: something weird happened while trying to build a binary operation out of Piecewise functions");
	    return null;
	}
    }

    return pf;
}
