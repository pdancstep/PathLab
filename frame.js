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

    // apply this coordinate as a velocity to the argument
    // for a duration of 1 p5 frame (display frame)
    // return the coordinate of the result (NOT a Frame/color)
    applyAsVelocity(coord) {
	let scaled_velocity = this.coord.scale(1/TIME_UNIT);
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

	let intensityPerUnit = (MAX_BRIGHTNESS * 2) / MAX_MAGNITUDE;
	let prodintensity = myintensity * yourintensity / intensityPerUnit;
	let prodbrightness = min(MAX_BRIGHTNESS, prodintensity);
	let prodsaturation = min(MAX_BRIGHTNESS, (MAX_BRIGHTNESS*2) - prodintensity);
	
	return new Frame((this.color + frame.getColor() + 128) % 256,
			 prodbrightness, prodsaturation);
    }
}

function addFrames(f1, f2) {
    return f1.addAsCoords(f2);
}

function multFrames(f1, f2) {
    // note: we could use either multiply() or multiplyAsCoords() here
    return f1.multiply(f2);
}
