var prevMouseXs = Array(SAMPLE_SIZE).fill(PARTICLE_CENTER_X);
var prevMouseYs = Array(SAMPLE_SIZE).fill(PARTICLE_CENTER_Y);

var tracer = new Barcode(0,0, []);
// const tracerAlpha = 255;

//timeline and playback variables
var playhead = 0; // index of the current frame for playback

// update particle, joystick, and barcode according to current UI mode
function setNewCoordinates(mode) {
    // update particle and related values based on mouse
    if(mode==DRAGGINGMODE) {
        if(dragging) {
	    prevMouseXs.push(mouseX);
	    prevMouseXs.shift();
	    prevMouseYs.push(mouseY);
	    prevMouseYs.shift();
            particleX = mouseX;
            particleY = mouseY;
	    
            let pAvgX = arrayMean(prevMouseXs);
	    let pAvgY = arrayMean(prevMouseYs);
	    
	    // magnitude the joystick needs to be at
            myMagnitude = sqrt((mouseY-pAvgY)*(mouseY-pAvgY)+(mouseX-pAvgX)*(mouseX-pAvgX));
	    
            joystickX = JOYSTICK_CENTER_X
		+ DRAG_SCALING*myMagnitude*cos(atan2(mouseY-pAvgY,mouseX-pAvgX));
            joystickY = JOYSTICK_CENTER_Y
		+ DRAG_SCALING*myMagnitude*sin(atan2(mouseY-pAvgY,mouseX-pAvgX));
	    let colorInfo = coordToColor(joystickX - JOYSTICK_CENTER_X,
					 joystickY - JOYSTICK_CENTER_Y);
	    myColor = colorInfo[0];
	    myBrightness = colorInfo[1];
	    mySaturation = colorInfo[2];
        }
    }
    
    // update joystick based on mouse
    else if (mode==JOYSTICKMODE) {
        if(dragging){
            joystickX = mouseX;
            joystickY = mouseY;
	    
	    let colorInfo = coordToColor(mouseX - JOYSTICK_CENTER_X,
					 mouseY - JOYSTICK_CENTER_Y);
	    myColor = colorInfo[0];
	    myBrightness = colorInfo[1];
	    mySaturation = colorInfo[2];
        }
    }
    
    // update joystick based on next recorded frame
    else if (mode==PLAYBACKMODE) {
	let frame = tracer.getFrame(playhead);
	if (frame==null)
	{
	    // stop playback
	    playhead = -1;
	    return;
	}
	myColor = frame[2];
	myBrightness = frame[3];
	mySaturation = frame[4];
	
	let coords = colorToCoord(myColor, myBrightness, mySaturation);
	joystickX = coords[0] + JOYSTICK_CENTER_X;
	joystickY = coords[1] + JOYSTICK_CENTER_Y;
	
	playhead++;
    }
    
    // update particle based on updates to joystick
    if (controlMode != DRAGGINGMODE)
    {
        particleX += JOYSTICK_SCALING * (joystickX - JOYSTICK_CENTER_X);
        particleY += JOYSTICK_SCALING * (joystickY - JOYSTICK_CENTER_Y);
    }
}

function recordFrame() {
    if (dragging){
        tracer.addFrame([particleX,particleY,myColor,mySaturation,myBrightness]);
    }
}

function arrayMean(ar) {
    let sum = ar.reduce(function(a,b) { return a+b; }, 0);
    return sum/ar.length;
}
