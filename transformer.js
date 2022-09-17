const TR_NONE = 0;
const TR_REVERSE = 1;
const TR_STRETCH = 2;
const TR_BRIGHTEN = 3;
const TR_ROTATE = 4;
const TR_ADD = 5;
const TR_MULTIPLY = 6;
const TR_CONCAT = 7;

class Transformer {
    constructor(parent, x, y, argx, argy) {
	super(x, y);
	this.parent = parent;
	this.mode = TR_NONE;
	this.argument = null;
	this.argumentX = argx;
	this.argumentY = argy;
    }

    newNumericArgument(val = '1') {
	let textfield = createInput(val);
	textfield.size(TEXTFIELD_SIZE);
	textfield.position(this.argumentX, this.argumentY);
	return textfield;
    }

    newBarcodeArgument() {
	return new Slot(this.argumentX, this.argumentY);
    }
    
    modeNone() {
	this.mode = TR_NONE;
	this.argument = null;
    }
    
    modeReverse() {
	this.mode = TR_REVERSE;
	this.argument = null;
    }
    
    modeStretch(arg = this.newNumericArgument()) { 
	this.mode = TR_STRETCH;
	this.argument = arg;
    }

    modeBrighten(arg = this.newNumericArgument()) {
	this.mode = TR_BRIGHTEN;
	this.argument = arg;
    }

    modeRotate(arg = this.newNumericArgument('0')) {
	this.mode = TR_ROTATE;
	this.argument = arg;
    }

    modeAdd(arg = newBarcodeArgument()) {
	this.mode = TR_ADD;
	this.argument = arg;
    }

    modeMultiply(arg = newBarcodeArgument()) {
	this.mode = TR_MULTIPLY;
	this.argument = arg;
    }

    modeConcat(arg = newBarcodeArgument()) {
	this.mode = TR_CONCAT;
	this.argument = arg;
    }

    getArgument() { return this.argument; }
    
    update() {
	let base = this.barcode;
	if (this.parent)
	{
	    base = this.parent.copyData(this.displayX, this.displayY);
	}

	switch (this.mode) {
	case TR_NONE:
	    this.barcode = base;
	    break;
	    
	case TR_REVERSE:
	    this.barcode = base.reverse();
	    break;
	    
	case TR_STRETCH:
	    let val = Number(this.arg.value());
	    if (val > 1) {
		// TODO
	    } else if (val < 1) {
		let factor = round(1/val);
		this.barcode.squash(factor);
	    } else {
		this.barcode = base;
	    }
	    break;
	    
	case TR_BRIGHTEN:
	    let val = Number(this.arg.value());
	    if (val > 0) {
		this.barcode.brighten(val);
	    } else {
		this.barcode = base;
	    }
	    break;
	    
	case TR_ROTATE:
	    let val = Number(this.arg.value());
	    if (val > 0) { val = val % 360; }
	    else if (val < 0) {	val = (val % 360) + 360; }
	    else { val = 0; }
	    this.barcode = base.rotate(map(val, 0, 360, 0, 255));
	    break;
	    
	case TR_ADD:
	    let barc = this.arg.barcode;
	    this.barcode = base.framewiseAdd(barc, this.displayX, this.displayY);
	    break;
	    
	case TR_MULTIPLY:
	    let barc = this.arg.barcode;
	    this.barcode = base.framewiseMultiply(barc, this.displayX, this.displayY);
	    break;
	    
	case TR_CONCAT:
	    let barc = this.arg.barcode;
	    this.barcode = base.concat(barc);
	    break;

	default:
	    this.barcode = base;
	    break;
	}
    }
}
