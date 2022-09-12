// basic container for a barcode
class Slot {
    constructor(x, y) {
	this.barcode = new Barcode(x, y, []);
	this.displayX = x;
	this.displayY = y;
    }

    display() {
	this.barcode.display();
	noFill();
	stroke(200);
	rect(this.displayX, this.displayY, SLOT_WIDTH, BARCODE_HEIGHT);
	this.drawButtons();
    }

    drawButtons() {} // basic slot has no buttons; subclasses should override this

    inside(x, y) {
	return (this.displayX < x && x < this.displayX + SLOT_WIDTH &&
		this.displayY < y && y < this.displayY + BARCODE_HEIGHT);
    }
    
    // check if we're dropping a barcode on this slot.
    // put it in the slot if appropriate
    onRelease() {
	// TODO
    }

    // clone the barcode held in this slot and put the new one at given coordinates
    eject(x, y) {
	return this.barcode.clone(x, y);
    }

    // replace currently-held barcode with an empty barcode
    clear() {
	this.barcode = new Barcode(this.displayX, this.displayY, []);
    }
}

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
	this.startingPos = new Coord(0,0);   // using particleCanvas coord system
	this.particlePos = this.startingPos; // using particleCanvas coord system
	this.joystickPos = new Coord(0,0);   // using joystickCanvas coord system
	this.playhead = 0;
	this.playing = false;
	this.recording = true;
    }

    // insert a barcode into this tracer
    installBarcode(barc, start = new Coord(0,0)) {
	this.barcode = barc.clone(this.displayX, this.displayY);
	this.startingPos = start;
	this.playhead = barc.length();
	this.particlePos = start.translate(barc.displacement());
	// joystick could also be reasonably set to barc.getLastFrame().getCoord() here,
	// but this requires recording to be off when we initially install a barcode.
	// another alternative would be to default to playback mode, paused at frame 0
	this.joystickPos = new Coord(0,0);
	this.playing = false;
	this.recording = true;
    }

    clear() {
	super.clear();
	this.startingPos = new Coord(0,0);
	this.particlePos = this.startingPos;
	this.joystickPos = new Coord(0,0);
	this.playhead = 0;
	this.playing = false;
	this.recording = true;
    }

    length() {
	return this.barcode.length();
    }

    isPlaying() {
	return this.playing;
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
	else { return coordToFrame(0,0); } // ?
    }

    getCurrentFrameNumber() {
	return this.playhead;
    }
    
    getCurrentParticle() {
	return this.particlePos;
    }

    getCurrentParticlePx() {
	return this.particleCanvas.canvasToScreen(this.particlePos);
    }

    getCurrentJoystick() {
	return this.joystickPos;
    }

    getCurrentJoystickPx() {
	return this.joystickCanvas.canvasToScreen(this.joystickPos);
    }

    // play back the next frame, treating it as a velocity for the particle
    // (and a position for the joystick)
    advanceJoystick() {
	if (this.isComplete()) {
	    this.stop();
	}
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
	if (this.isComplete()) {
	    this.stop();
	}
	if (this.playing) {
	    let newpos = this.getCurrentFrame().getCoord();
	    this.joystickPos = newpos.subtract(this.particlePos) * TIME_UNIT;
	    this.particlePos = newpos;
	    this.playhead++;
	}
    }

    // if recording, add the given frame to the barcode
    // colorInfo - frame to add
    // shift - how to move the starting point if barcode was already at maximum length
    recordFrame(colorInfo, shift) {
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
	this.particlePos = this.startingPos;
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
	// TODO this is assuming barcode is velocity! need to handle both types
	this.particlePos = this.startingPos.translate(this.barcode.displacement());
	// joystick could also be reasonably set to the coords of the last frame here,
	// but this requires recording to be off when we stop playback
	this.joystickPos = new Coord(0,0);
    }

    recordFromHere() {
	this.playing = false;
	this.recording = true;
	this.barcode.crop(this.playhead);
    }
}
