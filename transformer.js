const TR_NONE = 0;
const TR_REVERSE = 1;
const TR_STRETCH = 2;
const TR_BRIGHTEN = 3;
const TR_ROTATE = 4;
const TR_ADD = 5;
const TR_MULTIPLY = 6;
const TR_CONCAT = 7;
const TR_CYCLE = 8;

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
	this.dropdown = createSelect();
	this.dropdown.option("No change");
	this.dropdown.option("Reverse");
	this.dropdown.option("Stretch");
	this.dropdown.option("Brighten");
	this.dropdown.option("Rotate");
	this.dropdown.option("Add Frames");
	this.dropdown.option("Mult Frames");
	this.dropdown.option("Concatenate");
	this.dropdown.option("Repeat");
	this.dropdown.position(this.argumentX - DROPDOWN_OVERHANG, this.argumentY);
    }

    updateMode() {
	switch (this.dropdown.value()) {
	case "No change":
	    this.modeNone();
	    return TR_NONE;
	case "Reverse":
	    this.modeReverse();
	    return TR_REVERSE;
	case "Stretch":
	    if (this.mode != TR_STRETCH) {
		this.modeStretch();
	    }
	    return TR_STRETCH;
	case "Brighten":
	    if (this.mode != TR_BRIGHTEN) {
		this.modeBrighten();
	    }
	    return TR_BRIGHTEN;
	case "Rotate":
	    if (this.mode != TR_ROTATE) {
		this.modeRotate();
	    }
	    return TR_ROTATE;
	case "Add Frames":
	    if (this.mode != TR_ADD) {
		this.modeAdd();
	    }
	    return TR_ADD;
	case "Mult Frames":
	    if (this.mode != TR_MULTIPLY) {
		this.modeMultiply();
	    }
	    return TR_MULTIPLY;
	case "Concatenate":
	    if (this.mode != TR_CONCAT) {
		this.modeConcat();
	    }
	    return TR_CONCAT;
	case "Repeat":
	    if (this.mode != TR_CYCLE) {
		this.modeCycle();
	    }
	    return TR_CYCLE;
	default:
	    return -1;
	}
    }
    
    newNumericArgument(val) {
	this.box.value(val);
	return this.box;
    }

    newBarcodeArgument() {
	if (this.argument instanceof Slot) {
	    return this.argument;
	} else {
	    return new Slot(this.argumentX, this.argumentY);
	}
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

    onClick() {
	if (this.argument instanceof Slot) {
	    this.argument.onClick();
	}
	super.onClick();
    }
    
    spawnBarcode(location = new Coord(SPAWN_X, SPAWN_Y)) {
	freeBarcodes.push(this.eject(location.getX(), location.getY()));
    }
    
    display() {
	this.update();
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

    modeCycle(arg = 1) {
	let argbox = this.newNumericArgument(arg);
	this.mode = TR_CYCLE;
	this.argument = argbox;
    }

    getArgument() { return this.argument; }
    
    update() {
	this.updateMode();
	let base = this.parent.copyData(this.displayX, this.displayY);

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
		base.stretch(amt);
	    } else if (amt < 1) {
		base.squash(1/amt);
	    }
	    this.barcode = base;
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
	    else if (deg < 0) {	deg = (deg % 360) + 360; }
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
	    this.barcode = base.concat(barc);
	    break;
	    
	case TR_CYCLE:
	    let iter = round(Number(this.argument.value()));
	    if (base instanceof FormulaBarcode) {
		base = base.freeze();
	    }
	    if (iter > 1) {
		base.squash(iter);
	    }
	    let seq = base.clone();
	    for(let i=1; i<iter; i++){
		base = base.concat(seq);
	    }
	    this.barcode = base;
	    break;
	    
	default:
	    this.barcode = base;
	    break;
	}
    }
}
