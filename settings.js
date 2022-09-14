////////////////////////
// canvases and slots //
////////////////////////

const particleCanvas = new Canvas(PARTICLE_TOPLEFT, PARTICLE_CENTER,
				  PARTICLE_SCALE, PARTICLE_STYLE);
const joystickCanvas = new Canvas(JOYSTICK_TOPLEFT, JOYSTICK_CENTER,
				  JOYSTICK_SCALE, JOYSTICK_STYLE);
var tracer = new Tracer(TRACER_X, TRACER_Y, particleCanvas, joystickCanvas);

///////////////////////
// Tuning Parameters //
///////////////////////

// number of frames for speed 1 to produce displacement 1
const TIME_UNIT = 20;

// relation of mouse movement speed to vector magnitude of joystick
const DRAG_SCALING = .01; // was 4.45 before calculation changed

// how many frames back we look when calculating velocity of mouse movement
const SAMPLE_SIZE = 10;

// radius at which a point is represented by a color frame that is totally white
const MAX_MAGNITUDE = 4;

// frequency of frames that are visually displayed for a barcode
const BARCODE_DISPLAY_RESOLUTION = 2;

// max frames before a barcode overflows (deleting old frames when adding new ones)
const MAX_BARCODE_LENGTH = 510;

////////////
// derived quantities

const SLOT_WIDTH = MAX_BARCODE_LENGTH * FRAME_WIDTH / BARCODE_DISPLAY_RESOLUTION;

// play/pause button
const PLAY_BUTTON_CENTER_X = TRACER_X + SLOT_WIDTH/2;
const PLAY_BUTTON_CENTER_Y = TRACER_Y + BARCODE_HEIGHT + PLAY_BUTTON_SPACE;

