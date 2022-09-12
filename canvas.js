const PARTICLE_STYLE = 0;
const JOYSTICK_STYLE = 1;

// coordinate system for drawing
class Canvas {
    constructor(topleft, center, scale, displaytype) {
	this.topleft = topleft;
	this.center = center;
	this.scale = scale;
	// TODO display options
	this.displayType = displaytype;
    }

    display() {
	// TODO draw axes and stuff based on display options
    }

    getCenter() {
	return this.center;
    }
    
    // given a coordinate in the canvas's coordinate system,
    // return the coordinate of the corresponding pixel in the p5 coordinate system
    canvasToScreen(coord) {
	return coord.scale(this.scale).conjugate().translate(this.center);
    }

    // given a coordinate of a pixel in the p5 coordinate system,
    // return the coordinate of the corresponding point in the canvas's coordinate system
    screenToCanvas(coord) {
	return coord.subtract(this.center).conjugate().scale(1/this.scale);
    }
}
