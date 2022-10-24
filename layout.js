// coordinates of particle area
const PARTICLE_CENTER_X = 225;
const PARTICLE_CENTER_Y = 200;
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
const BARCODE_HEIGHT = 25;
const FRAME_WIDTH = 2;

// buttons!
const BUTTON_SIZE = 30;
const BUTTON_TEXT_SIZE = 20;
const BUTTON_SPACE = 40; // space between centers of consecutive buttons on the same panel
const PLAY_BUTTON_SPACE = 30; // space between tracer and center of play/pause button

// size of text input area for transformers with a numeric argument
const TEXTFIELD_SIZE = 50;

// position of transformer slots
const TRANSFORMER_X = 600;
const TRANSFORMER_ARG_X = 1000;
const TRANSFORMER_1_Y = 100;
const TRANSFORMER_GAP = 30;
const DROPDOWN_OVERHANG = 130;

// position of main tracers
const TRACER_X = 40;
const TRACER_MARGIN = 20;

// location where barcodes initially spawn into the editing area
const SPAWN_X = 750;
const SPAWN_Y = 800;

// premade barcodes (solid directions & circle)
const PRESETS_X = [550, 500, 600, 550, 1100];
const PRESETS_Y = [850, 800, 800, 750, 800];
const PRESETS_GEN = [function(idx) { return new Frame(63.75, 128, 255); },
		     function(idx) { return new Frame(0, 128, 255); },
		     function(idx) { return new Frame(127.5, 128, 255); },
		     function(idx) { return new Frame(191.25, 128, 255); },
		     function(idx) { return new Frame(255-idx, 64, 255); }]
const BASE_DURATION = BARCODE_HEIGHT;
const PRESETS_DURATIONS = [BASE_DURATION, BASE_DURATION, BASE_DURATION, BASE_DURATION,
			   255];
