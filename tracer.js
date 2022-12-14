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
        super.installBarcode(barc);
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
        return true;
    }

    insidePlayhead(x, y) {
        // TODO
        return false;
    }
    
    onClick() {
        if (this.insidePlayhead(mouseX, mouseY)) {
            // TODO
        } else {
            super.onClick();
        }
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

    getCurrentFrameNumber() { return this.playhead; }

    getParticleCanvas() { return this.particleCanvas; }
    getJoystickCanvas() { return this.joystickCanvas; }
    
    getCurrentParticle() { return this.particlePos; }
    getCurrentParticlePx() { return this.particleCanvas.canvasToScreen(this.particlePos); }

    getStartingParticle() { return this.startingPos; }
    getStartingParticlePx() { return this.particleCanvas.canvasToScreen(this.startingPos); }
    
    getCurrentJoystick() { return this.joystickPos; }
    getCurrentJoystickPx() { return this.joystickCanvas.canvasToScreen(this.joystickPos); }

    // play back the next frame (interpreting it as specified when playback started)
    advance() {
        if (this.playing) {
            if (this.isComplete()) {
                this.stop();
                return;
            }
            let frame = this.getCurrentFrame();
            // frame treated as velocity for the particle (position for joystick)
            if (this.playbackType == PLAYBACK_VEL) {
                this.joystickPos = frame.getCoord();
                this.particlePos = frame.applyAsVelocity(this.particlePos);
            }
            // frame treated as position for the particle
            if (this.playbackType == PLAYBACK_POS) {
                this.joystickPos = frame.velocityComingFrom(this.particlePos).getCoord();
                this.particlePos = frame.getCoord();
            }
            this.playhead++;
            return true;
        }
        return false;
    }

    // if recording, add the given frame to the barcode
    // frame - frame to add
    // type - what type of data is being added
    //        used to update current particle/joystick positions,
    //        as well as starting position if we overflow and drop the oldest frame
    recordFrame(frame, type) {
        if (!(frame instanceof Frame)) {
            console.log(frame);
        }
        if (this.recording) {
            // can only record to FrameBarcodes
            if (!(this.barcode instanceof FrameBarcode)) {
                if (typeof this.barcode.freeze === "function") {
                    this.barcode = this.barcode.freeze();
                } else {
                    this.barcode = new FrameBarcode(this.displayX, this.displayY, []);
                }
            }
            let droppedFrame = this.barcode.addFrame(frame);
            switch (type) {
            case PLAYBACK_POS:
                this.joystickPos = frame.velocityComingFrom(this.particlePos).getCoord();
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
	    
            if (!droppedFrame) {
                this.playhead++;
            }
        }
    }

    // passes each pair of consecutive frames, up to the current playhead,
    // to the given callback procedure
    sendPathData(callback) {
        let present = this.playhead;
        let settings = [this.recording, this.playing, this.particlePos, this.joystickPos];
        this.start(this.playbackType);
        let oldf = this.getCurrentFrame();
        let newf = oldf;
        for (let i = 0; i < present; i++) {
            oldf = newf;
            this.advance();
            newf = this.getCurrentFrame();
            callback(oldf, newf);
        }
        this.recording = settings[0];
        this.playing = settings[1];
        
        // TODO: why don't these already match???
        this.particlePos = settings[2];
        this.joystickPos = settings[3];
    }
    
    // start a new replay
    // type - how to interpret the barcode data
    start(type) {
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
        }
        if (this.playbackType == PLAYBACK_POS) {
            this.particlePos = this.barcode.getLastFrame().getCoord();
        }
        this.joystickPos = new Coord(0,0);
        this.playbackType = PLAYBACK_OFF;
    }

    recordFromHere() {
        this.playing = false;
        this.playbackType = PLAYBACK_OFF;
        this.recording = true;
        this.barcode.crop(this.playhead);
    }
}
