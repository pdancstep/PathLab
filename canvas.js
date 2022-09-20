const PARTICLE_STYLE = 0;
const JOYSTICK_STYLE = 1;

// coordinate system for drawing
class Canvas {
    constructor(width, center, scale, displaytype) {
	this.radius = width/2;
	this.center = center;
	this.scale = scale;
	// TODO display options
	this.displayType = displaytype;
    }

    display() {
        colorMode(RGB,255);
        if (this.displayType==PARTICLE_STYLE) { fill(225,225,220); }
	else if (this.displayType==JOYSTICK_STYLE) { fill(50); }

	noStroke();
        rectMode(CENTER);

        rect(this.center.getX(), this.center.getY(), this.radius*2, this.radius*2);

        //stage coordinate system
        noFill();
        strokeWeight(2);
        if(this.displayType==PARTICLE_STYLE) { stroke(150); }
	else if (this.displayType==JOYSTICK_STYLE) { stroke(225,225,220); }

	line(this.center.getX(), this.center.getY() - this.radius,
	     this.center.getX(), this.center.getY() + this.radius);
	line(this.center.getX() - this.radius, this.center.getY(),
	     this.center.getX() + this.radius, this.center.getY());
        ellipse(this.center.getX(), this.center.getY(), this.scale*2, this.scale*2);

	// draw color lines
        if (this.displayType==JOYSTICK_STYLE) {
            colorMode(HSB,255);

            push();
            translate(this.center.getX(), this.center.getY());

            if (useBrightness) {
                noFill();
                for (let i=0; i<25; i++){
                    for (let j=0; j<64; j++){
                        if ((15*i) < MAX_BRIGHTNESS) {
                            stroke(4*j, MAX_BRIGHTNESS, 15*i);
                        } else {
                            stroke(4*j, MAX_BRIGHTNESS*2 - (15*i), 15*i);
                        }
                        arc(0, 0, 10*i, 10*i, PI + j*TWO_PI/64, PI + (j+1)*TWO_PI/64);
                    }
                }
            }

            // note that y values are inverted here: we're centered according to the
            // joystick coordinate system, but still using screen coordinates, so +y is down

            //neg. x-axis
            stroke(0,255,255);
            line(0,0, -this.radius,0);
            
            //quad 3 diagonal
            stroke(32,255,255);
            line(0,0, -this.radius,this.radius);

            //neg. y-axis
            stroke(64,255,255);
            line(0,0, 0, this.radius);
            
            //quad 4 diagonal
            stroke(96,255,255);
            line(0,0, this.radius,this.radius);
            
            //pos. x-axis
            stroke(128,255,255);
            line(0,0, this.radius,0);
            
            //quad 1 diagonal
            stroke(160,255,255);
            line(0,0, this.radius,-this.radius);
            
            //pos y-axis
            stroke(192,255,255);
            line(0,0, 0,-this.radius);
            
            //quad 2 diagonal
            stroke(224,255,255);
            line(0,0, -this.radius,-this.radius);
            
            pop();
        }
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
