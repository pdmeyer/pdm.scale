// example of using the Scale class

const { Scale } = require("pdm.scale.lib.js");
	
let scale = null;
	
// set a scale by providing an object with `scale_intervals` and `root_note`
function setscale(dictionary, dictname) {
	const d = new Dict(dictname);
	const scale_obj = JSON.parse(d.stringify());
	post('Got a new scale:', JSON.stringify(scale_obj),'\n');
	
	scale = new Scale(scale_obj);
}

// fit a note to the scale
function fit(note) {
	
	// if no scale is set, throw an error
	if(scale === null) {
		error("Error calling fit(). No scale defined\n");
	}
	
	//fit the note to the scale
	const fitted = scale.fitPitch(note)
	post('Fitting note',note,'to scale. Result:',fitted,'\n');
	outlet(0, 'fit', fitted);
}

//transpose in scale degrees
function transpose(note, amt) {
	// if no scale is set, throw an error
	if(scale === null) {
		error("Error calling fit(). No scale defined\n");
	}
	
	// by default, if a scale is set and enabled, we will transpose by scale degrees
	// if you want to use semitones instead, you can use transposeSemitones()
	const xposed = scale.transpose(note, amt);
	post('Transposing note',note,'by',amt,'scale degrees. Result:',xposed,'\n');
	outlet(0, 'transpose', xposed);
}

function get_valid_notes() {
	// if no scale is set, throw an error
	if(scale === null) {
		error("Error calling get_valid_notes(). No scale defined\n");
	}
	
	const valid_notes = scale.valid_notes;
	outlet(0, 'valid_notes', valid_notes);
}

