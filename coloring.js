// encoding of magnitude as brightness/saturation
//
// radius 0               = brightness 0, saturation 255
//                                     \/
//                               increases to
//                                     \/
// radius MAX_MAGNITUDE/2 = brightness 255, saturation 255
//                                                     \/
//                                               decreases to
//                                                     \/
// radius MAX_MAGNITUDE   = brightness 255, saturation 0

// 
const MAX_BRIGHTNESS = 255;
const MAX_MAGNITUDE = 200;

function coordToColor(x, y) {
    let magnitude = sqrt(y*y + x*x);
    let angle = atan2(y, x);

    let color = map(angle, -PI, PI, 0, 255);
    let intensity = map(magnitude, 0, MAX_MAGNITUDE, 0, MAX_BRIGHTNESS*2);
    let brightness = min(MAX_BRIGHTNESS, intensity);
    let saturation = min(MAX_BRIGHTNESS, (MAX_BRIGHTNESS*2) - intensity);
    
    return [color, brightness, saturation];
}

function coordToFrame(x, y) {
    let colors = coordToColor(x, y);
    return new Frame(colors[0],colors[1],colors[2]);
}

function colorToCoord(color, brightness, saturation) {
    let angle = map(color, 0, 255, -PI, PI);
    let intensity = brightness - saturation + MAX_BRIGHTNESS;
    let magnitude = map(intensity, 0, MAX_BRIGHTNESS*2, 0, MAX_MAGNITUDE);

    let x = magnitude * cos(angle);
    let y = magnitude * sin(angle);

    return new Coord(x,y);
}
