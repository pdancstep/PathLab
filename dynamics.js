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
var tracer = new Barcode(0,0, []);

//timeline and playback variables
var playhead = 0; // index of the current frame for playback

// update particle, joystick, and barcode according to current UI mode
// returns the color data (as a Frame) for the current particle velocity/joystick position
function setNewCoordinates(mode) {
    // update particle and related values based on mouse
    if(mode==DRAGGINGMODE) {
        if(draggingParticle) {
	    prevMouseCoords.push(new Coord(mouseX, mouseY));
	    prevMouseCoords.shift();
	    particleX = mouseX;
            particleY = mouseY;
	    
	    let prevCoordSum = prevMouseCoords.reduce((a,b)=> a.translate(b),
						      new Coord(0,0));
	    let prevCoordAvg = prevCoordSum.scale(1/prevMouseCoords.length);
            let dx = mouseX - prevCoordAvg.getX();
	    let dy = mouseY - prevCoordAvg.getY();
	    
	    // magnitude the joystick needs to be at
            let magnitude = sqrt(dy*dy + dx*dx);
	    
            joystickX = JOYSTICK_CENTER_X + DRAG_SCALING * magnitude * cos(atan2(dy, dx));
            joystickY = JOYSTICK_CENTER_Y + DRAG_SCALING * magnitude * sin(atan2(dy, dx));
	    
	    return coordToFrame(joystickX - JOYSTICK_CENTER_X,
				joystickY - JOYSTICK_CENTER_Y);
        } else {
	    return coordToFrame(0,0);
	}
    }
    
    // update joystick based on mouse
    else if (mode==JOYSTICKMODE) {
        if (draggingJoystick) {
            joystickX = mouseX;
            joystickY = mouseY;
	}
	
	let colorInfo = coordToFrame(joystickX - JOYSTICK_CENTER_X,
				     joystickY - JOYSTICK_CENTER_Y);
	let newParticle = colorInfo.applyAsVelocity(new Coord(particleX, particleY));
	particleX = newParticle.getX();
	particleY = newParticle.getY();
	return colorInfo;
    }
    
    // update joystick based on next recorded frame
    else if (mode==PLAYBACKMODE) {
	let frame = null;
	
	if (playhead < tracer.length()) {
	    frame = tracer.getFrame(playhead);
	    playhead++;
	    
	    joystickX = frame.getCoord().getX() + JOYSTICK_CENTER_X;
	    joystickY = frame.getCoord().getY() + JOYSTICK_CENTER_Y;
	    let newParticle = frame.applyAsVelocity(new Coord(particleX, particleY));
	    particleX = newParticle.getX();
	    particleY = newParticle.getY();
	    
	    return frame;
	} else {
	    // stop playback
	    playhead = tracer.length();
	    frame = tracer.getLastFrame();
	    if (frame==null) {
		return coordToFrame(joystickX - JOYSTICK_CENTER_X,
				    joystickY - JOYSTICK_CENTER_Y);
	    } else {
		return frame;
	    }
	}
    }
}

function recordFrame(colorInfo) {
    if (draggingJoystick||draggingParticle){
	let droppedFrame = tracer.addFrame(colorInfo);
	if (droppedFrame) {
	    pathstart = droppedFrame.applyAsVelocity(pathstart);
	} else {
	    playhead++;
	}
    }
}

function installBarcode(barcode) {
    tracer = barcode;
    playhead = barcode.length();
}
