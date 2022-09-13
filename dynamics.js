////////////////////////
// canvases and slots //
////////////////////////

const particleCanvas = new Canvas(PARTICLE_TOPLEFT, PARTICLE_CENTER,
				  PARTICLE_SCALE, PARTICLE_STYLE);
const joystickCanvas = new Canvas(JOYSTICK_TOPLEFT, JOYSTICK_CENTER,
				  JOYSTICK_SCALE, JOYSTICK_STYLE);
var tracer = new Tracer(TRACER_X, TRACER_Y, particleCanvas, joystickCanvas);

/////////
// Tuning Parameters
/////////

// number of frames for speed 1 to produce displacement 1
const TIME_UNIT = 20;

// relation of mouse movement speed to vector magnitude of joystick
const DRAG_SCALING = 4.45;

// how many frames back we look when calculating velocity of mouse movement
const SAMPLE_SIZE = 10;

// radius at which a point is represented by a color frame that is totally white
const MAX_MAGNITUDE = 4;

///////////////////

var prevMouseCoords = Array(SAMPLE_SIZE).fill(PARTICLE_CENTER);

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
	tracer.advance();
	particlePos = tracer.getCurrentParticlePx();
	joystickPos = tracer.getCurrentJoystickPx();
	return tracer.getCurrentFrame();
    }
}

function recordFrame(colorInfo) {
    if (draggingParticle || !joystickPos.equals(JOYSTICK_CENTER)) {
	tracer.recordFrame(colorInfo, SHIFT_JOYSTICK);
    }
}

function installBarcode(barcode) {
    tracer.installBarcode(barcode);
    particlePos = PARTICLE_CENTER;
    joystickPos = JOYSTICK_CENTER;
}
