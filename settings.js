////////////////////////
// canvases and slots //
////////////////////////

const particleCanvas = new Canvas(PARTICLE_AREA_SIZE, PARTICLE_CENTER,
				  PARTICLE_SCALE, PARTICLE_STYLE);
const joystickCanvas = new Canvas(JOYSTICK_AREA_SIZE, JOYSTICK_CENTER,
				  JOYSTICK_SCALE, JOYSTICK_STYLE);
var ptracer;
var jtracer;

const STARTING_TRANSFORMERS = 3;
const MAX_TRANSFORMERS = 10;
var presets = [];
var transformers = [];
var addTransformerButton;
var freeBarcodes = [];

///////////////////////
// Tuning Parameters //
///////////////////////

// number of frames for speed 1 to produce displacement 1
const TIME_UNIT = 25;

// relation of mouse movement speed to vector magnitude of joystick
const DRAG_SCALING = 1/Math.sqrt(TIME_UNIT);

// scaling constant used in Fourier transform
const DISP_SCALING = 1/10;

// how many frames back we look when calculating velocity of mouse movement
const SAMPLE_SIZE = 10;

// radius at which a point is represented by a color frame that is totally white
const MAX_MAGNITUDE = 4;

// frequency of frames that are visually displayed for a barcode
const BARCODE_DISPLAY_RESOLUTION = 2;

// max frames before a barcode overflows (deleting old frames when adding new ones)
const MAX_BARCODE_LENGTH = 375;

////////////
// derived quantities

const SLOT_WIDTH = MAX_BARCODE_LENGTH * FRAME_WIDTH / BARCODE_DISPLAY_RESOLUTION;
const PARTICLE_TRACER_Y = PARTICLE_CENTER_Y + (PARTICLE_AREA_SIZE/2) + TRACER_MARGIN;
const JOYSTICK_TRACER_Y = JOYSTICK_CENTER_Y + (JOYSTICK_AREA_SIZE/2) + TRACER_MARGIN;

const PLAY_BUTTON_CENTER_X = TRACER_X + SLOT_WIDTH/2;
const PPLAY_BUTTON_CENTER_Y = PARTICLE_TRACER_Y + BARCODE_HEIGHT + PLAY_BUTTON_SPACE;
const JPLAY_BUTTON_CENTER_Y = JOYSTICK_TRACER_Y + BARCODE_HEIGHT + PLAY_BUTTON_SPACE;

const EJECT_BUTTON_CENTER_X = TRACER_X + BUTTON_SPACE + SLOT_WIDTH;
