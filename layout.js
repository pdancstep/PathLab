// coordinates of particle area
const PARTICLE_CENTER_X = 225;
const PARTICLE_CENTER_Y = 200;
const PARTICLE_AREA_SIZE = 375;
const PARTICLE_CENTER = new Coord(PARTICLE_CENTER_X, PARTICLE_CENTER_Y);
const PARTICLE_SCALE = 75;


// coordinates of joystick area
const JOYSTICK_CENTER_X = 225;
const JOYSTICK_CENTER_Y = 700;
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

// position of extra slots
const EXTRA_X = 1100;
const EXTRA_1_Y = 800;
const EXTRA_GAP = 50;

// position of main tracers
const TRACER_X = 40;
const TRACER_MARGIN = 20;

// default location to spawn barcodes into the editing area
const SPAWN_X = 750;
const SPAWN_Y = 800;

function presetSquare(idx) {
    let x = 1;
    let y = 1;
    if (idx<64) {
        x = map(idx, 0, 64, -1, 1);
    }
    else if (idx<128) {
        y = map(idx, 64, 128, 1, -1);
    }
    else if (idx<192) {
        y = -1;
        x = map(idx, 128, 192, 1, -1);
    }
    else if (idx<256) {
        x = -1;
        y = map(idx, 192, 256, -1, 1);
    }
    return coordToFrame(x, y);
}

// premade barcodes (solid directions & circle)
const PRESETS_X = [1213, 1163, 1263, 1213, 1100, 1100, 1100];
const PRESETS_Y = [115, 95, 95, 70, 25, 700, 750];
const PRESETS_GEN = [function(idx) { return new Frame(63.75, 128, 255); },
		     function(idx) { return new Frame(0, 128, 255); },
		     function(idx) { return new Frame(127.5, 128, 255); },
		     function(idx) { return new Frame(191.25, 128, 255); },
		     function(idx) { return new Frame((idx+128)%256, 128, 255); },
                     presetSquare,
                     function(idx) { return new Frame(0, 0, 255); }];
const BASE_DURATION = BARCODE_HEIGHT;
const PRESETS_DURATIONS = [BASE_DURATION, BASE_DURATION, BASE_DURATION, BASE_DURATION,
			   256, 256, 256];
