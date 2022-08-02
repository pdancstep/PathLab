class Barcode {
    constructor(xPos,yPos) {
	// fields for moving the barcode itself around the canvas
        //position
        this.x = xPos;
        this.y = yPos;
        this.dragging = true;
        this.offsetX = 0; // position relative to xPos where barcode was grabbed
        this.offsetY = 0; // position relative to yPos where barcode was grabbed

	// fields for handling the data in the barcode
        this.myVals = tracer.map((x)=>x);
    }

    // methods for moving barcodes around the canvas
    onClick(){
        if (mouseX>this.x && mouseX<this.x + (this.myVals.length*FRAME_WIDTH) &&
	    mouseY>this.y && mouseY<this.y + BARCODE_HEIGHT) {
            this.offsetX = this.x - mouseX;
            this.offsetY = this.y - mouseY;
            this.dragging = true;
        }
    }

    // release mouse
    onRelease() {
        this.dragging = false;
    }

    update() {
        if (this.dragging){
            this.x = mouseX + this.offsetX;
            this.y = mouseY + this.offsetY;
        }  
    }

    display() {
	strokeWeight(FRAME_WIDTH);
        for(i=0; i<this.myVals.length; i++){
            stroke(this.myVals[i][2],this.myVals[i][3],this.myVals[i][4]);
            line(this.x + 2*i, this.y, this.x + 2*i, this.y + BARCODE_HEIGHT);
        }
    }

    // methods for playback
    getFrame(index) {
        if (0 <= index && index < this.myVals.length) {
	    return this.myVals[index];
	} else {
	    return null;
	}
    }
}
