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
        if(this.displayType==PARTICLE_STYLE){
            colorMode(RGB,255);
            fill(225,225,220);
            noStroke();
            rectMode(CENTER);

            rect(PARTICLE_CENTER_X,PARTICLE_CENTER_Y,PARTICLE_AREA_SIZE,PARTICLE_AREA_SIZE);

            //stage coordinate system
            noFill();
            stroke(150);
            strokeWeight(2);
            line(PARTICLE_CENTER_X,PARTICLE_CENTER_Y-(PARTICLE_AREA_SIZE/2),
             PARTICLE_CENTER_X,PARTICLE_CENTER_Y+(PARTICLE_AREA_SIZE/2));
            line(PARTICLE_CENTER_X-(PARTICLE_AREA_SIZE/2),PARTICLE_CENTER_Y,
             PARTICLE_CENTER_X+(PARTICLE_AREA_SIZE/2),PARTICLE_CENTER_Y);
            ellipse(PARTICLE_CENTER_X,PARTICLE_CENTER_Y,2*PARTICLE_SCALE,2*PARTICLE_SCALE);

        }else if(this.displayType==JOYSTICK_STYLE){
            //draw joystick canvas...
            fill(50);
            noStroke();
            rectMode(CENTER);
            rect(JOYSTICK_CENTER_X,JOYSTICK_CENTER_Y,JOYSTICK_AREA_SIZE,JOYSTICK_AREA_SIZE);

            noFill();
            stroke(225,225,220);
            ellipse(JOYSTICK_CENTER_X,JOYSTICK_CENTER_Y,2*JOYSTICK_SCALE,2*JOYSTICK_SCALE);

            colorMode(HSB,255);
/*
            if (useBrightness){
                noFill();
                for (i=0;i<25;i++){
                    for (j=0;j<64;j++){
                        if ((15*i)<255){
                            stroke(4*j,255,15*i);
                        } else {
                            stroke(4*j,500-(15*i),15*i);
                        }
                        arc(JOYSTICK_CENTER_X, JOYSTICK_CENTER_Y,
                    10*i, 10*i, PI + j*TWO_PI/64, PI + (j+1)*TWO_PI/64);
                    }
                }
            }
*/
            push();
            translate(JOYSTICK_CENTER_X,JOYSTICK_CENTER_Y);

            // note that y values are inverted here: we're centered according to the
            // joystick coordinate system, but still using screen coordinates, so +y is down

            //neg. x-axis
            stroke(0,255,255);
            line(0,0,-JOYSTICK_AREA_SIZE/2,0);
            
            //quad 3 diagonal
            stroke(32,255,255);
            line(0,0,-JOYSTICK_AREA_SIZE/2,JOYSTICK_AREA_SIZE/2);  

            //neg. y-axis
            stroke(64,255,255);
            line(0,0,0,JOYSTICK_AREA_SIZE/2);
            
            //quad 4 diagonal
            stroke(96,255,255);
            line(0,0,JOYSTICK_AREA_SIZE/2,JOYSTICK_AREA_SIZE/2);
            
            //pos. x-axis
            stroke(128,255,255);
            line(0,0,JOYSTICK_AREA_SIZE/2,0);
            
            //quad 1 diagonal
            stroke(160,255,255);
            line(0,0,JOYSTICK_AREA_SIZE/2,-JOYSTICK_AREA_SIZE/2);
            
            //pos y-axis
            stroke(192,255,255);
            line(0,0,0,-JOYSTICK_AREA_SIZE/2);
            
            //quad 2 diagonal
            stroke(224,255,255);
            line(0,0,-JOYSTICK_AREA_SIZE/2,-JOYSTICK_AREA_SIZE/2);    
            
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
