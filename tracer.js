// basic container for a barcode
class Slot {
    constructor(x, y) {
	this.barcode = new Barcode(x, y, []);
	this.displayX = x;
	this.displayY = y;
    }

    display() {
	noFill();
	stroke(200);
	rect(this.displayX, this.displayY, SLOT_WIDTH, BARCODE_HEIGHT);
	this.drawButtons();
    }

    drawButtons() {} // basic slot has no buttons; subclasses should override this
}

// frame to use if a tracer with an empty barcode is asked for its current frame
const DEFAULT_FRAME = coordToFrame(joystickPos.getX() - JOYSTICK_CENTER_X,
				   joystickPos.getY() - JOYSTICK_CENTER_Y);

// when recording a new frame to this tracer that overflows the maximum barcode length,
// how should we modify the starting position?
const SHIFT_NONE = 0; // don't touch it
const SHIFT_PARTICLE = 1; // move it to the position of the dropped (oldest) frame
const SHIFT_JOYSTICK = 2; // move it by an amount equal to the dropped (oldest) frame.

// slot that can record and play back a barcode to a particular joystick and particle canvas
class Tracer extends Slot {
    constructor(x, y, part, joy) {
	super(x, y);
	this.particleCanvas = part;
	this.joystickCanvas = joy;
	this.startingPos = part.getCenter();
	this.particlePos = this.startingPos;
	this.joystickPos = joy.getCenter();
	this.playhead = 0;
	this.playing = false;
	this.recording = true;
    }

    // insert a barcode into this tracer
    installBarcode(barc, start = this.part.getCenter()) {
	this.barcode = barc.clone(x, y);
	this.startingPos = start;
	this.playhead = barc.length();
	this.particlePos = this.startingPos.translate(barc.displacement());
	// joystick could also be reasonably set to barc.getLastFrame().getCoord() here,
	// but this requires recording to be off when we initially install a barcode.
	// another alternative would be to default to playback mode, paused at frame 0
	this.joystickPos = this.joystickCanvas.getCenter();
	this.playing = false;
	this.recording = true
    }

    // clone the barcode held in this tracer and put the new one at given coordinates
    eject(x, y) {
	return this.barcode.clone(x, y);
    }

    // replace 
    clear() {
	this.barcode = new Barcode(this.displayX, this.displayY, []);
	this.startingPos = this.particleCanvas.getCenter();
	this.particlePos = this.startingPos;
	this.joystickPos = this.joystickCanvas.getCenter();
	this.playhead = 0;
	this.playing = false;
	this.recording = true;
    }

    length() {
	return this.barcode.length();
    }

    // is the playhead at the end of the barcode?
    isComplete() {
	return (this.playhead >= this.barcode.length());
    }
    
    getCurrentFrame() {
	let frame = null;
	if (this.isComplete()) {
	    frame = this.barcode.getLastFrame();
	} else {
	    frame = this.barcode.getFrame(this.playhead);
	}
	if (frame) { return frame; }
	else { return DEFAULT_FRAME; }
    }

    // play back the next frame, treating it as a velocity for the particle
    // (and a position for the joystick)
    advanceJoystick() {
	if (this.isComplete()) { return; }
	if (this.playing) {
	    let frame = this.getCurrentFrame();
	    this.joystickPos = frame.getCoord();
	    this.particlePos = frame.applyAsVelocity(this.particlePos);
	    this.playhead++;
	}
    }

    // play back the next frame, treating it as a position for the particle
    // (set the joystick to the displacement the particle undergoes for this frame)
    advanceParticle() {
	if (this.isComplete()) { return; }
	if (this.playing) {
	    let newpos = this.getCurrentFrame().getCoord();
	    this.joystickPos = newpos.subtract(this.particlePos);
	    this.particlePos = newpos;
	}
    }

    // if recording, add the given frame
    recordVelocity(colorInfo, shift) {
	if (this.recording) {
	    let droppedFrame = this.barcode.addFrame(colorInfo);
	    if (droppedFrame) {
		switch (shift) {
		case SHIFT_PARTICLE:
		    this.startingPos = droppedFrame.getCoord();
		    break;
		case SHIFT_JOYSTICK:
		    this.startingPos = droppedFrame.applyAsVelocity(this.startingPos);
		    break;
		case SHIFT_NONE:
		default:
		}
	    } else {
		this.playhead++;
	    }
	}
    }
    
    start() {
	this.recording = false;
	this.playing = true;
	this.playhead = 0;
    }

    pause() {
	this.playing = false;
    }

    resume() {
	this.playing = true;
    }

    stop() {
	this.playing = false;
	this.recording = true;
	this.playhead = this.barcode.length();
    }
}
