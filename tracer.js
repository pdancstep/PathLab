const PLAYBACK_OFF = 0;
const PLAYBACK_POS = 1;
const PLAYBACK_VEL = 2;

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
	this.playbackType = PLAYBACK_OFF;
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
	this.playbackType = PLAYBACK_OFF;
	this.recording = true;
    }

    clear() {
	super.clear();
	this.startingPos = new Coord(0,0);
	this.particlePos = this.startingPos;
	this.joystickPos = new Coord(0,0);
	this.playhead = 0;
	this.playing = false;
	this.playbackType = PLAYBACK_OFF;
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
    advance() {
	if (this.isComplete()) {
	    this.stop();
	}
	// frame treated as velocity for the particle (position for joystick)
	if (this.playing) {
	    let frame = this.getCurrentFrame();
	    if (this.playbackType == PLAYBACK_VEL) {
		this.joystickPos = frame.getCoord();
		this.particlePos = frame.applyAsVelocity(this.particlePos);
	    }
	    // frame treated as position for the particle
	    if (this.playbackType == PLAYBACK_POS) {
		this.joystickPos = frame.getCoord().subtract(this.particlePos) * TIME_UNIT;
		this.particlePos = frame.getCoord();
	    }
	    this.playhead++;
	}
    }

    // if recording, add the given frame to the barcode
    // colorInfo - frame to add
    // type - what type of data is being added
    //        used to update current particle/joystick positions,
    //        as well as starting position if we overflow and drop the oldest frame
    recordFrame(frame, type) {
	if (this.recording) {
	    let droppedFrame = this.barcode.addFrame(frame);
	    switch (type) {
	    case PLAYBACK_POS:
		this.joystickPos = frame.getCoord().subtract(this.particlePos) * TIME_UNIT;
		this.particlePos = frame.getCoord();
		if (droppedFrame) {
		    this.startingPos = droppedFrame.getCoord();
		}
		break;
	    case PLAYBACK_VEL:
		this.joystickPos = frame.getCoord();
		this.particlePos = frame.applyAsVelocity(this.particlePos);
		if (droppedFrame) {
		    this.startingPos = droppedFrame.applyAsVelocity(this.startingPos);
		}
		break;
	    case PLAYBACK_OFF:
		if (droppedFrame) {}
	    default:
	    }
	} else {
	    this.playhead++;
	}
    }

    // start a new replay
    // type - how to interpret the barcode data (defaults to particle velocity)
    start(type = PLAYBACK_VEL) {
	this.recording = false;
	this.playing = true;
	this.playbackType = type;
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
	if (this.playbackType == PLAYBACK_VEL) {
	    this.particlePos = this.startingPos.translate(this.barcode.displacement());
	    // joystick could also be reasonably set to the coords of the last frame here,
	    // but this requires recording to be off when we stop playback
	    this.joystickPos = new Coord(0,0);
	}
	if (this.playbackType == PLAYBACK_POS) {
	    this.particlePos = this.barcode.getLastFrame().coord();
	    // if we were to do the equivalent of leaving the joystick on its last-frame
	    // value, as described above, we'd need to calculate the displacement between
	    // the final 2 frames here
	    this.joystickPos = new Coord(0,0);
	}
	this.playbackType = PLAYBACK_OFF;


    }

    recordFromHere() {
	this.playing = false;
	this.playbackType = PLAYBACK_OFF;
	this.recording = true;
	this.barcode.crop(this.playhead);
    }
}
