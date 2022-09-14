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
