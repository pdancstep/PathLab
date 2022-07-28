 

class Barcode {
    
    constructor(xPos,yPos) {

        //position
        this.x = xPos;
        this.y = yPos;


        this.myVals = tracer.map((x)=>x);

        //interactivity attributes...
        this.dragging = true;

        //dragging variables...
        this.offsetX = 0;
        this.offsetY = 0;

    }




    onClick(){
        if (mouseX>this.x&&mouseX<this.x+(this.myVals.length*2)&&mouseY>this.y&&mouseY<this.y+50) {
            this.offsetX = this.x-mouseX;
            this.offsetY = this.y-mouseY;
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




            for(i=0;i<this.myVals.length;i++){
                stroke(this.myVals[i][2],this.myVals[i][3],this.myVals[i][4]);
                line(this.x+2*i,this.y,this.x+2*i,this.y+20);
            }


    }





}


