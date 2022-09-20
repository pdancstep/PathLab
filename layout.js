// coordinates of particle area
const PARTICLE_CENTER_X = 225;
const PARTICLE_CENTER_Y = 225;
const PARTICLE_AREA_SIZE = 375;
const PARTICLE_CENTER = new Coord(PARTICLE_CENTER_X, PARTICLE_CENTER_Y);
const PARTICLE_SCALE = 75;


// coordinates of joystick area
const JOYSTICK_CENTER_X = 225;
const JOYSTICK_CENTER_Y = 675;
const JOYSTICK_AREA_SIZE = 375;
const JOYSTICK_CENTER = new Coord(JOYSTICK_CENTER_X, JOYSTICK_CENTER_Y);
const JOYSTICK_SCALE = 75;

// barcode display parameters
const BARCODE_HEIGHT = 50;
const FRAME_WIDTH = 2;

// buttons!
const BUTTON_SIZE = 30;
const BUTTON_TEXT_SIZE = 20;
const BUTTON_SPACE = 40; // space between centers of consecutive buttons on the same panel
const PLAY_BUTTON_SPACE = 55; // space between tracer and center of play/pause button

// size of text input area for transformers with a numeric argument
const TEXTFIELD_SIZE = 50;

// TODO these will probably get reorganized a bit when they join the Slot class hierarchy
var editingStation = [-1, -1, -1];
const EDITING_STATION_X = [650, 650, 650];
const EDITING_STATION_Y = [100, 220, 320];
const EDITING_STATION_END_X = [1150, 1150, 1150];
const EDITING_STATION_END_Y = [150, 270, 370];

const TRACER_X = 750;
const TRACER_Y = 700;
const TRACER_END_X = 1150;
const TRACER_END_Y = 750;

// location where barcodes initially spawn into the editing area
const SPAWN_X = 750;
const SPAWN_Y = 600;

// premade barcodes (solid directions & circle)
const PRESETS_X = [900, 850, 950, 900, 1100];
const PRESETS_Y = [520, 470, 470, 420, 420];
const PRESETS_GEN = [function (idx) { return new Frame(63.75, 128, 255); },
		     function (idx) { return new Frame(0, 128, 255); },
		     function (idx) { return new Frame(127.5, 128, 255); },
		     function (idx) { return new Frame(191.25, 128, 255); },
		     function (idx) { return new Frame(255-idx, 64, 255); }]
const BASE_DURATION = BARCODE_HEIGHT;
const PRESETS_DURATIONS = [BASE_DURATION, BASE_DURATION, BASE_DURATION, BASE_DURATION,
			   255];


