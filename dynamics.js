/////////
// Tuning Parameters
/////////

// relation of vector magnitude displayed in joystick area to color intensity
const JOYSTICK_SCALING = 0.05;

// relation of mouse movement speed to vector magnitude of joystick
const DRAG_SCALING = 4.45;

// how many frames back we look when calculating velocity of mouse movement
const SAMPLE_SIZE = 10;

///////////////////

var pathstart = PARTICLE_CENTER;

var prevMouseCoords = Array(SAMPLE_SIZE).fill(PARTICLE_CENTER);

// active barcode
var tracer = new Barcode(TRACER_X, TRACER_Y, []);

// timeline and playback variables
// when not playing, should equal tracer.length()
var playhead = 0; // index of the current frame for playback

// update particle, joystick, and barcode according to current UI mode
// returns the color data (as a Frame) for the current particle velocity/joystick position
function setNewCoordinates(mode) {
    // update particle and related values based on mouse
    if(mode==DRAGGINGMODE) {
        if(draggingParticle) {
	    let mouse = new Coord(mouseX, mouseY);
	    prevMouseCoords.push(mouse);
	    prevMouseCoords.shift();
	    particlePos = mouse;
	    
	    let prevCoordSum = prevMouseCoords.reduce((a,b)=> a.translate(b),
						      new Coord(0,0));
	    let prevCoordAvg = prevCoordSum.scale(1/prevMouseCoords.length);
            let dx = mouseX - prevCoordAvg.getX();
	    let dy = mouseY - prevCoordAvg.getY();
	    
	    // magnitude the joystick needs to be at
            let magnitude = sqrt(dy*dy + dx*dx);
	    
            let jx = DRAG_SCALING * magnitude * cos(atan2(dy, dx));
            let jy = DRAG_SCALING * magnitude * sin(atan2(dy, dx));

	    joystickPos = new Coord(jx + JOYSTICK_CENTER_X, jy + JOYSTICK_CENTER_Y);

	    return coordToFrame(jx, jy);
        } else {
	    return coordToFrame(0,0);
	}
    }
    
    // update joystick based on mouse
    else if (mode==JOYSTICKMODE) {
        if (draggingJoystick) {
	    joystickPos = new Coord(mouseX, mouseY);
	}
	
	let colorInfo = coordToFrame(joystickPos.getX() - JOYSTICK_CENTER_X,
				     joystickPos.getY() - JOYSTICK_CENTER_Y);
	particlePos = colorInfo.applyAsVelocity(particlePos);
	return colorInfo;
    }
    
    // update joystick based on next recorded frame
    else if (mode==PLAYBACKMODE) {
	let frame = null;
	
	if (playhead < tracer.length()) {
	    frame = tracer.getFrame(playhead);
	    playhead++;

	    joystickPos = frame.getCoord().translate(JOYSTICK_CENTER);
	    
	    particlePos = frame.applyAsVelocity(particlePos);
	    return frame;
	} else {
	    // stop playback
	    playhead = tracer.length();
	    frame = tracer.getLastFrame();
	    if (frame==null) {
		// this case should only be reached if the barcode being played is empty
		// not quite sure I still understand why we are returning this value here;
		// the other reasonable-seeming candidate is coordToFrame(0,0)
		return coordToFrame(joystickPos.getX() - JOYSTICK_CENTER_X,
				    joystickPos.getY() - JOYSTICK_CENTER_Y);
	    } else {
		return frame;
	    }
	}
    }
}

function recordFrame(colorInfo) {
    if (draggingParticle || !joystickPos.equals(JOYSTICK_CENTER)){
	let droppedFrame = tracer.addFrame(colorInfo);
	if (droppedFrame) {
	    pathstart = droppedFrame.applyAsVelocity(pathstart);
	} else {
	    playhead++;
	}
    }
}

function installBarcode(barcode) {
    tracer = barcode.clone(TRACER_X, TRACER_Y);
    playhead = tracer.length();
    particlePos = PARTICLE_CENTER;
}
