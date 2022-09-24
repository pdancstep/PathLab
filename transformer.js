const TR_NONE = 0;
const TR_REVERSE = 1;
const TR_STRETCH = 2;
const TR_BRIGHTEN = 3;
const TR_ROTATE = 4;
const TR_ADD = 5;
const TR_MULTIPLY = 6;
const TR_CONCAT = 7;

class Transformer extends Slot {
    constructor(parent, x, y, argx, argy) {
	super(x, y);
	this.parent = parent;
	this.mode = TR_NONE;
	this.argument = null;
	this.argumentX = argx;
	this.argumentY = argy;
	this.box = createInput('');
	this.box.size(TEXTFIELD_SIZE);
	this.box.position(this.argumentX, this.argumentY);
    }

    newNumericArgument(val) {
	this.box.attribute("value", val);
	return this.box;
    }

    newBarcodeArgument() {
	return new Slot(this.argumentX, this.argumentY);
    }

    inside(x, y) {
	if (this.argument instanceof Slot) {
	    return (super.inside(x, y) || this.argument.inside(x, y));
	} else {
	    return super.inside(x, y);
	}
    }
    
    installBarcode(barc) {
	if (this.argument instanceof Slot && this.argument.inside(mouseX, mouseY)) {
	    return this.argument.installBarcode(barc);
	} else if (!this.parent) {
	    return super.installBarcode(barc);
	}
	return false;
    }

    display() {
	super.display();
	this.box.hide();
	if (this.argument instanceof Slot) {
	    this.argument.display();
	} else if (this.argument) {
	    this.argument.show();
	}
    }
    
    modeNone() {
	this.mode = TR_NONE;
	this.argument = null;
    }
    
    modeReverse() {
	this.mode = TR_REVERSE;
	this.argument = null;
    }
    
    modeStretch(arg = 1) {
	let argbox = this.newNumericArgument(arg);
	this.mode = TR_STRETCH;
	this.argument = argbox;
    }

    modeBrighten(arg = 1) {
	let argbox = this.newNumericArgument(arg);
	this.mode = TR_BRIGHTEN;
	this.argument = argbox;
    }

    modeRotate(arg = 0) {
	let argbox = this.newNumericArgument(arg);
	this.mode = TR_ROTATE;
	this.argument = argbox;
    }

    modeAdd(arg = this.newBarcodeArgument()) {
	this.mode = TR_ADD;
	this.argument = arg;
    }

    modeMultiply(arg = this.newBarcodeArgument()) {
	this.mode = TR_MULTIPLY;
	this.argument = arg;
    }

    modeConcat(arg = this.newBarcodeArgument()) {
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
	    base.reverse();
	    this.barcode = base;
	    break;
	    
	case TR_STRETCH:
	    let amt = Number(this.argument.value());
	    if (amt > 1) {
		// TODO
	    } else if (amt < 1) {
		let factor = round(1/amt);
		base.squash(factor);
		this.barcode = base;
	    } else {
		this.barcode = base;
	    }
	    break;
	    
	case TR_BRIGHTEN:
	    let val = Number(this.argument.value());
	    if (val > 0) {
		base.brighten(val);
	    }
	    this.barcode = base;
	    break;
	    
	case TR_ROTATE:
	    let deg = Number(this.argument.value());
	    if (deg > 0) { deg = deg % 360; }
	    else if (val < 0) {	deg = (deg % 360) + 360; }
	    else { deg = 0; }
	    base.rotate(map(deg, 0, 360, 0, 255));
	    this.barcode = base;
	    break;
	    
	case TR_ADD:
	    let addend = this.argument.barcode;
	    this.barcode = base.framewiseAdd(addend, this.displayX, this.displayY);
	    break;
	    
	case TR_MULTIPLY:
	    let factor = this.argument.barcode;
	    this.barcode = base.framewiseMultiply(factor, this.displayX, this.displayY);
	    break;
	    
	case TR_CONCAT:
	    let barc = this.argument.barcode;
	    base.concat(barc);
	    this.barcode = base;
	    break;

	default:
	    this.barcode = base;
	    break;
	}
    }
}
