class Frame {
    constructor(color, brightness, saturation) {
	this.color = color;
	this.brightness = brightness;
	this.saturation = saturation;
	this.coord = colorToCoord(color, brightness, saturation);
    }

    getColor() { return this.color; }
    getBrightness() { return this.brightness; }
    getSaturation() { return this.saturation; }
    getCoord() { return this.coord; }

    applyAsVelocity(coord) {
	let scaled_velocity = this.coord.scale(JOYSTICK_SCALING);
	return coord.translate(scaled_velocity);
    }

    // scale brightness & saturation without looking at the coordinates,
    // just the color values
    manuallyScaleIntensity(factor) {
	// ignore invalid scale factor
	if (factor <=0) { return this; }
	
	let intensity = this.brightness - this.saturation + MAX_BRIGHTNESS;
	intensity = min(intensity * factor, MAX_BRIGHTNESS*2);
	return new Frame(this.color,
			 min(MAX_BRIGHTNESS, intensity),
			 min(MAX_BRIGHTNESS, (MAX_BRIGHTNESS*2) - intensity));
    }

    addAsCoords(frame) {
	return this.coord.translate(frame.getCoord()).toFrame();
    }

    multiplyAsCoords(frame) {
	return this.coord.multiply(frame.getCoord()).toFrame();
    }

    multiply(frame) {
	let myintensity = this.brightness - this.saturation + MAX_BRIGHTNESS;
	let yourintensity = frame.brightness - frame.saturation + MAX_BRIGHTNESS;
	// TODO put this scaling constant declaration somewhere more useful. also,
	// double-check that it (and the prodintensity calculation) are actually correct
	const INTENSITY_PER_UNIT = MAX_BRIGHTNESS / 2;
	let prodintensity = myintensity * yourintensity / INTENSITY_PER_UNIT;
	let prodbrightness = min(MAX_BRIGHTNESS, prodintensity);
	let prodsaturation = min(MAX_BRIGHTNESS, (MAX_BRIGHTNESS*2) - prodintensity);
	
	return new Frame((this.color + frame.getColor() + 128) % 256,
			 prodbrightness, prodsaturation);
    }
}

class Coord {
    constructor(x,y) {
	this.x = x;
	this.y = y;
    }

    getX() { return this.x; }
    getY() { return this.y; }

    translate(vector) {
	return new Coord(this.x + vector.getX(), this.y + vector.getY());
    }

    subtract(vector) {
	return new Coord(this.x - vector.getX(), this.y - vector.getY());
    }

    scale(factor) {
	return new Coord(this.x * factor, this.y * factor);
    }

    multiply(vector) {
	let mymagn = sqrt(this.x*this.x + this.y*this.y);
	let myangle = atan2(this.y, this.x);
	let yourmagn = sqrt(vector.getX()*vector.getX() + vector.getY()*vector.getY());
	let yourangle = atan2(vector.getY(), vector.getX());

	let prodmagn = mymagn * yourmagn;
	let prodangle = myangle + yourangle;

	return new Coord(prodmagn * cos(prodangle), prodmagn * sin(prodangle));
    }

    toFrame() {
	return coordToFrame(this.x, this.y);
    }

    isOrigin() {
	return (this.x == 0 && this.y == 0);
    }

    equals(vector) {
	return (this.x==vector.getX() && this.y==vector.getY());
    }
}
