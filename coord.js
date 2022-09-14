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

    conjugate() {
	return new Coord(this.x, -this.y);
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
