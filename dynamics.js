var prevMouseCoords = Array(SAMPLE_SIZE).fill(PARTICLE_CENTER);

// update particle and related values based on mouse
function particleDrag() {
    if (draggingParticle) {
	let mouse
	    = ptracer.getParticleCanvas().screenToCanvas(new Coord(mouseX, mouseY));
	prevMouseCoords.push(mouse);
	prevMouseCoords.shift();
	
	let prevCoordSum = prevMouseCoords.reduce((a,b)=> a.translate(b),
						      new Coord(0,0));
	let prevCoordAvg = prevCoordSum.scale(1/prevMouseCoords.length);
        let dx = mouse.getX() - prevCoordAvg.getX();
	let dy = mouse.getY() - prevCoordAvg.getY();

        let colorInfo = coordToFrame(dx * TIME_UNIT * DRAG_SCALING,
                                     dy * TIME_UNIT * DRAG_SCALING);
        
//	why are we doing this calculation twice?
//	// magnitude the joystick needs to be at
//        let magnitude = sqrt(dy*dy + dx*dx) * TIME_UNIT * DRAG_SCALING;
	
//	let colorInfo = coordToFrame(magnitude * cos(atan2(dy, dx)),
//				     magnitude * sin(atan2(dy, dx)));
        ptracer.recordFrame(mouse.toFrame(), PLAYBACK_POS);
        jtracer.recordFrame(colorInfo, PLAYBACK_VEL);
    }
}

function joystickLeftOn() {
    return (!snapToZero && !jtracer.getCurrentJoystick().isOrigin());
}

// update joystick based on mouse
function joystickDrag() {
    if (draggingJoystick || joystickLeftOn()) {
	let mouse
	    = jtracer.getJoystickCanvas().screenToCanvas(new Coord(mouseX, mouseY));
        let part = mouse.toFrame().applyAsVelocity(ptracer.getCurrentParticle());
        ptracer.recordFrame(part.toFrame(), PLAYBACK_POS);
	jtracer.recordFrame(mouse.toFrame(), PLAYBACK_VEL);
    }
}

// update particle, joystick, and barcode according to current UI mode
// returns the color data (as a Frame) for the current particle velocity/joystick position
function setNewCoordinates(mode) {
    if (mode==RECORDMODE) {
        particleDrag();
        joystickDrag();
    } else if (mode==PARTICLEMODE) {
        let fr_before = ptracer.getCurrentFrame();
        if (ptracer.advance()) {
            let fr_after = ptracer.getCurrentFrame();
            let v = fr_after.getCoord().subtract(fr_before.getCoord()).scale(TIME_UNIT);
            jtracer.recordFrame(v.toFrame(), PLAYBACK_VEL);
        }
    } else if (mode==JOYSTICKMODE) {
        let fr_before = jtracer.getCurrentFrame();
        if (jtracer.advance()) {
            let fr_after = jtracer.getCurrentFrame();
            let fr_p = fr_after.applyAsVelocity(ptracer.getCurrentFrame().getCoord());
            ptracer.recordFrame(fr_p.toFrame(), PLAYBACK_POS);
        }
    }
}

// handle clicking on one of the play/pause buttons
// return true if we processed any type of click
function playButtonClick() {
    // particle tracer play button
    if (dist(mouseX, mouseY, PLAY_BUTTON_CENTER_X, PPLAY_BUTTON_CENTER_Y) < 20) {
        if (controlMode==JOYSTICKMODE) {
            if (jtracer.isComplete()) {
                jtracer.clear();
            } else {
                console.log("Warning: switching modes mid-playback not yet supported");
                return true;
            }
        }
	if (ptracer.isPlaying()) { // already playing, so we're clicking pause
	    ptracer.pause();
	} else {
	    if (ptracer.isComplete()) { // at the end, so we're starting a new playback
                jtracer.clear();
		ptracer.start(PLAYBACK_POS);
	    } else { // we're paused, so resume
		ptracer.resume();
	    }
	    controlMode = PARTICLEMODE;
	    drawPath = true;
	}
	return true;
    }
    // joystick tracer play button
    else if (dist(mouseX, mouseY, PLAY_BUTTON_CENTER_X, JPLAY_BUTTON_CENTER_Y) < 20) {
        if (controlMode==PARTICLEMODE) {
            if (ptracer.isComplete()) {
                ptracer.clear();
            } else {
                console.log("Warning: switching modes mid-playback not yet supported");
                return true;
            }
        }
        if (jtracer.isPlaying()) { // already playing, so we're clicking pause
	    jtracer.pause();
	} else {
	    if (jtracer.isComplete()) { // at the end, so we're starting a new playback
                ptracer.clear();
                jtracer.start(PLAYBACK_VEL);
	    } else { // we're paused, so resume
		jtracer.resume();
	    }
	    controlMode = JOYSTICKMODE;
	    drawPath = true;
	}
        return true;
    }
    return false;
}

function debugTracerData(freq, ) {
    if (!(ptracer.recording && jtracer.recording) &&
        (ptracer.playhead % freq==1 || jtracer.playhead % freq==1)) {
        /* console.log("Particle Tracer, Frame " + ptracer.playhead + ": P=("
              + ptracer.particlePos.getX().toPrecision(3) + ","
              + ptracer.particlePos.getY().toPrecision(3) + ") J=("
              + ptracer.joystickPos.getX().toPrecision(3) + ","
              + ptracer.joystickPos.getY().toPrecision(3) + ")");
              console.log("Joystick Tracer, Frame " + jtracer.playhead + ": P=("
              + jtracer.particlePos.getX().toPrecision(3) + ","
              + jtracer.particlePos.getY().toPrecision(3) + ") J=("
              + jtracer.joystickPos.getX().toPrecision(3) + ","
              + jtracer.joystickPos.getY().toPrecision(3) + ")");
        */
        console.log("Frame " + ptracer.playhead + ": dP=("
                    + (ptracer.particlePos.getX()-jtracer.particlePos.getX()).toPrecision(3)
                    + ","
                    + (ptracer.particlePos.getY()-jtracer.particlePos.getY()).toPrecision(3)
                    + ") dJ=("
                    + (ptracer.joystickPos.getX()-jtracer.joystickPos.getX()).toPrecision(3)
                    + ","
                    + (ptracer.joystickPos.getY()-jtracer.joystickPos.getY()).toPrecision(3)
                    + ")");
    }
}
