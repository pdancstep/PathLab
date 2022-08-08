function setup() {
    createCanvas(1500,900);
    controlMode = JOYSTICKMODE;
}

function draw() {
    colorMode(RGB,255);
    background(indicator);

    //draw the environment...
    drawUI();

    //infer all coordinates based on present mode...
    setNewCoordinates(controlMode);

    //////////////////////////////  JOYSTICK
    //draw joystick dot...
    drawJoystickPosition();

    //if dragging in DRAGGINGMODE or JOYSTICKMODE, record to present timeline...
    recordFrame();

    //////////////////////////////  PARTICLE
    //draw particle path stored in tracer array...
    if(drawPath){
        drawParticlePath();
    }

    //draw particle velocity vector...
    if(drawVector){
        drawParticleVector();
    }
    
    //draw particle itself
    colorMode(RGB,255);

    fill(50);
    strokeWeight(2);
    stroke(225,225,220);
    ellipse(particleX, particleY, 15, 15);

    /////////////////////////////  TIMELINE
    //draw timeline/recording bar BACKGROUND
    rectMode(CORNER);
    fill(100);
    noStroke();
    rect(750,700,400,50);

    colorMode(HSB,255);
    for(i=0; i<tracer.length(); i++){
	let frame = tracer.getFrame(i);
        stroke(frame[2], frame[3], frame[4]);
        line(750+2*i,700,750+2*i,750);
    }

    //draw timeline/recordng bar OUTLINE
    noFill();
    stroke(200);
    rect(750,700,400,50);

    ////////////////////////////  BARCODES
    //draw barcodes on canvas
    for(const barc of myBarcodes){
        barc.update();
        barc.display();
    }
}


function touchStarted() {

    //mode changes:
    if(dist(mouseX,mouseY,35,45)<25){
        controlMode = DRAGGINGMODE;
	return;
    }

    if(dist(mouseX,mouseY,35,610)<25){
        controlMode = JOYSTICKMODE;
	return;
    }

    // play button
    if(dist(mouseX,mouseY,675,610)<25){
	particleX = PARTICLE_CENTER_X;
	particleY = PARTICLE_CENTER_Y;
    controlMode = PLAYBACKMODE;
	playhead = 0;
	drawPath = true;
	return;
    }


    //turn on dot dragging...

    if(controlMode==DRAGGINGMODE){
        if(dist(mouseX,mouseY,particleX,particleY)<15){
            dragging = true;
        }
    }

    if(controlMode==JOYSTICKMODE){
        if(dist(mouseX,mouseY,joystickX,joystickY)<15){
            dragging = true;
        }
    }

    if(mouseX>750&&mouseX<1150&&mouseY>700&&mouseY<750){
        myBarcodes.push(tracer.clone());
    }

    //dragging existing barcode...
    for(const barc of myBarcodes){
        barc.onClick();
    }






    // clicking on the settings menu...

    menuClick();





}

function touchMoved() {

}

function touchEnded(){

    if(snapToZero){
        joystickX = JOYSTICK_CENTER_X;
        joystickY = JOYSTICK_CENTER_Y;
    }

    dragging = false;

    for(const barc of myBarcodes){
        barc.dragging = false;
    }
}
