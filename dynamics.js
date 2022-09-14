var prevMouseCoords = Array(SAMPLE_SIZE).fill(PARTICLE_CENTER);

var counter = 0;
// update particle and related values based on mouse
function particleDrag() {
    if(draggingParticle) {
	let mouse
	    = tracer.getParticleCanvas().screenToCanvas(new Coord(mouseX, mouseY));
	prevMouseCoords.push(mouse);
	prevMouseCoords.shift();
	
	let prevCoordSum = prevMouseCoords.reduce((a,b)=> a.translate(b),
						      new Coord(0,0));
	let prevCoordAvg = prevCoordSum.scale(1/prevMouseCoords.length);
        let dx = mouse.getX() - prevCoordAvg.getX();
	let dy = mouse.getY() - prevCoordAvg.getY();
	
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

function joystickLeftOn() {
    return (!snapToZero && !tracer.getCurrentJoystick().isOrigin());
}

// update joystick based on mouse
function joystickDrag() {
    if (draggingJoystick || joystickLeftOn()) {
	let mouse
	    = tracer.getJoystickCanvas().screenToCanvas(new Coord(mouseX, mouseY));
	tracer.recordFrame(mouse.toFrame(), PLAYBACK_VEL);
	return mouse.toFrame();
    } else {
	return coordToFrame(0,0);
    }
}

// update particle, joystick, and barcode according to current UI mode
// returns the color data (as a Frame) for the current particle velocity/joystick position
function setNewCoordinates(mode) {
    if(mode==DRAGGINGMODE) {
        return particleDrag();
    }
    else if (mode==JOYSTICKMODE) {
	return joystickDrag();
    }
    // update joystick & particle based on next recorded frame
    else if (mode==PLAYBACKMODE) {
	tracer.advance();
	return tracer.getCurrentFrame();
    }
}
