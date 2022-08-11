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

    scale(factor) {
	return new Coord(this.x * factor, this.y * factor);
    }

    isOrigin() {
	return (this.x == 0 && this.y == 0);
    }
}
