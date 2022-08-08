/////////
// Tuning Parameters
/////////

// relation of vector magnitude displayed in joystick area to color intensity
const JOYSTICK_SCALING = 0.05;

// relation of mouse movement speed to vector magnitude of joystick
const DRAG_SCALING = 3;

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
function setNewCoordinates(mode) {
    // update particle and related values based on mouse
    if(mode==DRAGGINGMODE) {
        if(dragging) {
	    prevMouseCoords.push(new Coord(mouseX, mouseY));
	    prevMouseCoords.shift();
	    particleX = mouseX;
            particleY = mouseY;
	    
	    // TODO: refactor mean calculation for Coord array instead of pair of arrays
            let pAvgX = arrayMean(prevMouseXs);
	    let pAvgY = arrayMean(prevMouseYs);
	    
	    // magnitude the joystick needs to be at
            myMagnitude = sqrt((mouseY-pAvgY)*(mouseY-pAvgY)+(mouseX-pAvgX)*(mouseX-pAvgX));
	    
            joystickX = JOYSTICK_CENTER_X
		+ DRAG_SCALING*myMagnitude*cos(atan2(mouseY-pAvgY,mouseX-pAvgX));
            joystickY = JOYSTICK_CENTER_Y
		+ DRAG_SCALING*myMagnitude*sin(atan2(mouseY-pAvgY,mouseX-pAvgX));
	    let colorInfo = coordToFrame(joystickX - JOYSTICK_CENTER_X,
					 joystickY - JOYSTICK_CENTER_Y);
	    myColor = colorInfo.getColor();
	    myBrightness = colorInfo.getBrightness();
	    mySaturation = colorInfo.getSaturation();
        }
    }
    
    // update joystick based on mouse
    else if (mode==JOYSTICKMODE) {
        if(dragging){
            joystickX = mouseX;
            joystickY = mouseY;
	    
	    let colorInfo = coordToFrame(mouseX - JOYSTICK_CENTER_X,
					 mouseY - JOYSTICK_CENTER_Y);
	    myColor = colorInfo.getColor();
	    myBrightness = colorInfo.getBrightness();
	    mySaturation = colorInfo.getSaturation();
        }
    }
    
    // update joystick based on next recorded frame
    else if (mode==PLAYBACKMODE) {
	let frame = null;
	if (playhead < tracer.length()) {
	    frame = tracer.getFrame(playhead);
	} else {
	    // stop playback
	    playhead = tracer.length();
	    return;
	}
	myColor = frame.getColor();
	myBrightness = frame.getBrightness();
	mySaturation = frame.getSaturation();
	
	let coords = colorToCoord(myColor, myBrightness, mySaturation);
	joystickX = coords.getX() + JOYSTICK_CENTER_X;
	joystickY = coords.getY() + JOYSTICK_CENTER_Y;
	
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
	let droppedFrame = tracer.addFrame(new Frame(myColor,mySaturation,myBrightness));
	playhead++;
	if (droppedFrame) {
	    pathstart = droppedFrame.applyAsVelocity(pathstart);
	}
    }
}

function installBarcode(barcode) {
    tracer = barcode;
    playhead = barcode.length();
}

function arrayMean(ar) {
    let sum = ar.reduce(function(a,b) { return a+b; }, 0);
    return sum/ar.length;
}
