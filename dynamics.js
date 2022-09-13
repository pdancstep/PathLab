////////////////////////
// canvases and slots //
////////////////////////

const particleCanvas = new Canvas(PARTICLE_TOPLEFT, PARTICLE_CENTER,
				  PARTICLE_SCALE, PARTICLE_STYLE);
const joystickCanvas = new Canvas(JOYSTICK_TOPLEFT, JOYSTICK_CENTER,
				  JOYSTICK_SCALE, JOYSTICK_STYLE);
var tracer = new Tracer(TRACER_X, TRACER_Y, particleCanvas, joystickCanvas);

///////////////////////
// Tuning Parameters //
///////////////////////

// number of frames for speed 1 to produce displacement 1
const TIME_UNIT = 20;

// relation of mouse movement speed to vector magnitude of joystick
const DRAG_SCALING = .01; // was 4.45 before calculation changed

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
	    let mouse
		= tracer.getParticleCanvas().screenToCanvas(new Coord(mouseX, mouseY));
	    prevMouseCoords.push(mouse);
	    prevMouseCoords.shift();
	    
	    let prevCoordSum = prevMouseCoords.reduce((a,b)=> a.translate(b),
						      new Coord(0,0));
	    let prevCoordAvg = prevCoordSum.scale(1/prevMouseCoords.length);
            let dx = mouseX - prevCoordAvg.getX();
	    let dy = mouseY - prevCoordAvg.getY();
	    
	    // magnitude the joystick needs to be at
            let magnitude = sqrt(dy*dy + dx*dx) * TIME_UNIT * DRAG_SCALING;
	    
	    let colorInfo = coordToFrame(magnitude * cos(atan2(dy, dx)),
					 magnitude * sin(atan2(dy, dx)));
	    tracer.recordFrame(colorInfo, PLAYBACK_VEL);
	    return colorInfo;
        } else {
	    return coordToFrame(0,0);
	}
    }
    
    // update joystick based on mouse
    else if (mode==JOYSTICKMODE) {
        if (draggingJoystick || !tracer.getCurrentJoystick().isOrigin()) {
	    let colorInfo = coordToFrame(mouseX, mouseY);
	    tracer.recordFrame(colorInfo, PLAYBACK_VEL);
	    return colorInfo;
	} else {
	    return coordToFrame(0,0);
	}
    }
    
    // update joystick based on next recorded frame
    else if (mode==PLAYBACKMODE) {
	tracer.advance();
	return tracer.getCurrentFrame();
    }
}
