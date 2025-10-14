/*
 * pdm.scale.js
 * by Philip Meyer, 2025
*/

/**
 * Scale class for musical scale operations and pitch fitting
 * 
 * Provides functionality for:
 * - Fitting pitches to musical scales
 * - Transposing notes by scale degrees or semitones
 * - Checking if notes are in scale
 * - Calculating transposition distances
 * 
 * @example
 * // Create a major scale
 * const majorScale = new Scale({
 *     "scale_mode": 1, 
 *     "root_note": 0,
 *     "scale_intervals": [0, 2, 4, 5, 7, 9, 11],
 *     "scale_name": "Major"
 * });
 * 
 * // Fit a note to the scale
 * const fittedNote = majorScale.fitPitch(61); // Returns 60 (C)
 * 
 * // Transpose by scale degrees
 * const transposed = majorScale.transpose(60, 2); // Transpose C up 2 scale degrees
 */
class Scale {
    /** @private */
    #active_note = null;
    /** @private */
    #length = 7;
    /** @private */
    #valid_notes = [];
    /** @private */
    #scale_mode = true;
    /** @private */
    #scale_intervals = [0, 2, 4, 5, 7, 9, 11];
    /** @private */
    #root_note = 0;
    /** @private */
    #auto_round = false;
    /** @private */
    #round_direction = 0;
    /** @private */
    #round_mode = 'down'; // down, up, nearest, smart
    /** @private */
    #steps_per_octave = 12;
    
    /**
     * Creates a new Scale instance
     * @param {Object} [scale_obj] - Scale configuration object
     * @param {number} [scale_obj.scale_mode=1] - Scale mode (1 = enabled, 0 = disabled)
     * @param {number[]} [scale_obj.scale_intervals=[0,2,4,5,7,9,11]] - Array of semitone intervals
     * @param {number} [scale_obj.root_note=0] - Root note (0-11, where 0 = C)
     * @param {string} [scale_obj.scale_name] - Name of the scale (optional)
     */
    constructor(scale_obj) {
        if(typeof scale_obj === 'object') {
            this.setParams(scale_obj);
        }
    }

    /**
     * Calculates and updates the scale length based on current scale mode
     * @private
     */
    #calculateLength() {
        this.#length = this.#scale_mode !== 0 ? this.#scale_intervals.length : this.steps_per_octave;
    }

    /**
     * Gets the current scale length
     * @returns {number} The number of notes in the scale (or 12 if scale mode is disabled)
     */
    get length() {
        return this.#length;
    }

    get valid_notes() {
        if(this.#valid_notes.length === 0) {
            this.#valid_notes = this.getAllValidNotes();
        }
        return this.#valid_notes;
    }

    /**
     * Gets the current scale mode
     * @returns {boolean} True if scale mode is enabled, false otherwise
     */
    get scale_mode() {
        return this.#scale_mode;
    }

    /**
     * Gets the current scale intervals
     * @returns {number[]} Array of semitone intervals defining the scale
     */
    get scale_intervals() {
        return this.#scale_intervals;
    }

    /**
     * Gets the current root note
     * @returns {number} Root note (0-11, where 0 = C)
     */
    get root_note() {
        return this.#root_note;
    }

    /**
     * Gets the current auto-round setting
     * @returns {boolean} True if auto-round is enabled, false otherwise
     */
    get auto_round() {
        return this.#auto_round;
    }

    /**
     * Gets the current round direction
     * @returns {boolean} True if rounding up, false if rounding down
     */
    get round_direction() {
        return this.#round_direction;
    }

    /**
     * Sets the scale intervals array
     * @param {number[]} intervals - Array of semitone intervals (0-11)
     * @throws {Error} If intervals is not an array of integers
     */
    set scale_intervals(intervals) {
        if(!Array.isArray(intervals)) {
            error("scale_intervals must be an array", this.constructor.name, '\n');
            return;
        }
        intervals.forEach(interval => {
            if(typeof interval !== 'number' || !Number.isInteger(interval)) {
                error("scale_intervals must be an array of integers", this.constructor.name, '\n');
                return;
            }
        });
        this.#scale_intervals = intervals;
        this.#calculateLength();
    }

    /**
     * Sets the root note of the scale
     * @param {number} note - Root note (0-11, where 0 = C)
     * @throws {Error} If note is not an integer
     */
    set root_note(note) {
        if(typeof note !== 'number' || !Number.isInteger(note)) {
            error("root_note must be an integer", this.constructor.name, '\n');
            return;
        }
        this.#root_note = note % this.steps_per_octave;
    }

    /**
     * Sets the scale mode (enabled/disabled)
     * @param {number|boolean} mode - Scale mode (1/true = enabled, 0/false = disabled)
     */
    set scale_mode(mode) {
        this.#scale_mode = !!mode;
    }

    /**
     * Sets the auto-round behavior
     * @param {number|boolean} round - Auto-round enabled (1/true) or disabled (0/false)
     */
    set auto_round(round) {
        this.#auto_round = !!round;
    }

    get steps_per_octave() {
        return this.#steps_per_octave;
    }

    set steps_per_octave(steps) {
        if(typeof steps !== 'number' || !Number.isInteger(steps) || steps < 1) {
            error("steps_per_octave must be an integer greater than 0", this.constructor.name, '\n');
            return;
        }
        this.#steps_per_octave = steps;
    }

    /**
     * Sets the round direction for pitch fitting
     * @param {string} direction - Round direction (down, up)
     * @throws {Error} If direction is not a number
     */
    set round_direction(direction) {
        if(typeof direction !== 'number') {
            error("round_direction must be a number", this.constructor.name, '\n');
            return;
        }
        this.#round_direction = direction === 'up';
    }

    /**
     * Gets the current round mode
     * @returns {string} Round mode (down, up, nearest, smart)
     */
    get round_mode() {
        return this.#round_mode;
    }

    /**
     * Sets the round mode for pitch fitting
     * @param {number} mode - Round mode (0=down, 1=up, 2=nearest, 3=smart)
     * @throws {Error} If mode is not a valid number
     */
    set round_mode(mode) {
        if(typeof mode !== 'string' || !['down', 'up', 'nearest', 'smart'].includes(mode)) {
            error("round_mode must be a number between 0 and 3", this.constructor.name, '\n');
            return;
        }
        this.#round_mode = mode;
    }
    
    /**
     * Sets multiple scale parameters from a configuration object
     * @param {Object} scale_obj - Scale configuration object
     * @param {number} scale_obj.scale_mode - Scale mode (1 = enabled, 0 = disabled)
     * @param {number[]} scale_obj.scale_intervals - Array of semitone intervals
     * @param {number} scale_obj.root_note - Root note (0-11)
     * @throws {Error} If required properties are missing from scale_obj
     */
    setParams(scale_obj) {
        const properties = ["scale_mode", "scale_intervals", "root_note"];
        for(let i = 0; i < properties.length; i++) {
            const property = properties[i];
            if(!scale_obj.hasOwnProperty(property)) {
                error("Invalid scale object. Missing property", property,'\n');
            } 
            this[property] = scale_obj[property];
        }
        this.#calculateLength();
    }
    
    /**
     * Checks if a note is in the current scale
     * @param {number} note - MIDI note number (0-127)
     * @returns {boolean} True if the note is in scale, false otherwise
     */
    isInScale(note) {
        const fitted = this.fitPitch(note);
        return fitted === note;
    }
    
    /**
     * Gets the difference between a note and its fitted version
     * @param {number} note - MIDI note number (0-127)
     * @param {number} [previousNote] - Previous note for context
     * @param {number} [roundMode] - Round mode for fitting
     * @returns {number} The difference (fitted note - original note)
     */
    getFitDifference(note, previousNote, roundMode) {
        const fitted = this.fitPitch(note, previousNote, roundMode);
        return fitted - note;
    }

    /**
     * Gets the scale degree of a note
     * @param {number} note - MIDI note number (0-127)
     * @returns {number} The scale degree index (0-based)
     */
    getScaleDegree(note) {
        const chromatic = note % this.steps_per_octave;
        const intervalFromRoot = Scale.wrap(chromatic - this.#root_note, 0, this.steps_per_octave);
        return this.#scale_intervals.indexOf(intervalFromRoot);
    }
    
    /**
     * Fits a MIDI note to the current scale
     * 
     * This is the core method that takes any MIDI note and adjusts it to fit within
     * the current scale. If scale mode is disabled, returns the input note unchanged.
     * 
     * @param {number|null} inputNote - MIDI note number (0-127) or null
     * @param {number} [previousNote] - Previous note for context in smart rounding
     * @param {number} [roundMode] - Round mode override (0=down, 1=up, 2=nearest, 3=smart)
     * @returns {number} The fitted MIDI note number
     * @example
     * // Fit note 61 (C#) to C major scale
     * const scale = new Scale({scale_mode: 1, root_note: 0, scale_intervals: [0,2,4,5,7,9,11]});
     * const fitted = scale.fitPitch(61); // Returns 60 (C)
     */
    fitPitch(inputNote, previousNote, roundMode) { 
        if(inputNote === null) {
            inputNote = 60;
            error(jsarguments[0], this.constructor.name, 'fitPitch: inputNote is null. Using note 60 instead.\n');
        }
        inputNote = Math.min(Math.max(Math.floor(inputNote), 0), 127);
        
        // Use provided round mode or instance default
        const rm = typeof roundMode !== 'undefined' ? Math.floor(roundMode) : this.#round_mode;
        
        // Handle auto-round logic
        if(this.#active_note && this.#auto_round) {   
            this.#round_direction = (inputNote - this.#active_note) === 1;
        }
        
        if(this.#scale_mode === 0) {
            this.#active_note = inputNote;
            return inputNote;
        }
    
        const chromatic = inputNote % this.steps_per_octave;
        
        // Check if note is already at root
        if(chromatic === this.#root_note) {
            this.#active_note = inputNote;
            return inputNote;
        }

        const intervalFromRoot = Scale.wrap(chromatic - this.#root_note, 0, this.steps_per_octave);
        const length = this.#scale_intervals.length;

        for(let i = 1; i < length; i++) {
            const scale_interval = this.#scale_intervals[i];

            // Check if note is already in scale
            if(scale_interval == intervalFromRoot) {
                this.#active_note = inputNote;
                return inputNote;
            }
            
            // If note isn't in scale, apply rounding logic
            if(scale_interval > intervalFromRoot) {
                let fitted_scale_deg, fitted_scale_interval;
                
                // Round down
                if(rm === 'down') {
                    fitted_scale_deg = i - 1;
                    fitted_scale_interval = this.#scale_intervals[fitted_scale_deg];
                // Round up
                } else if(rm == 'up') {
                    fitted_scale_deg = i;
                    fitted_scale_interval = this.#scale_intervals[fitted_scale_deg];
                // Round to nearest note
                } else if(rm == 'nearest') {
                    const previous_interval = this.#scale_intervals[i - 1];
                    const prev_distance = Math.abs(previous_interval - intervalFromRoot);
                    const curr_distance = Math.abs(scale_interval - intervalFromRoot);
                    fitted_scale_interval = prev_distance <= curr_distance ? previous_interval : scale_interval;
                    fitted_scale_deg = prev_distance <= curr_distance ? i - 1 : i;
                // Smart - round up if input is 1 semitone above previous note
                } else if(rm == 'smart') {
                    const prevNote = typeof previousNote !== 'undefined' ? previousNote : this.#active_note;
                    fitted_scale_deg = prevNote != null && (inputNote - prevNote) === 1 ? i : i - 1;
                    fitted_scale_interval = this.#scale_intervals[fitted_scale_deg];
                } else {
                    return null;
                }

                const fit_diff = fitted_scale_interval - intervalFromRoot;
                const fitted_note = inputNote + fit_diff;
                this.#active_note = fitted_note;
                return fitted_note;
            }
        }

        // Handle case where note is between last and first scale degrees
        const first = 0;
        const last = length - 1;
        let fitted_scale_deg, fitted_scale_interval;
        
        // Round down
        if(rm === 'down') {
            fitted_scale_deg = last;
        // Round up
        } else if(rm === 'up') {
            fitted_scale_deg = first;
        // Round to nearest note
        } else if(rm === 'nearest') {
            const first_interval = this.#scale_intervals[first] + this.steps_per_octave;
            const last_interval = this.#scale_intervals[last];
            const prev_distance = Math.abs(last_interval - intervalFromRoot);
            const curr_distance = Math.abs(first_interval - intervalFromRoot);
            fitted_scale_deg = prev_distance <= curr_distance ? last : first;
        // Smart - round up if input is 1 semitone above previous note
        } else if(rm === 'smart') {
            const prevNote = typeof previousNote !== 'undefined' ? previousNote : this.#active_note;
            fitted_scale_deg = prevNote != null && (inputNote - prevNote) === 1 ? first : last;
        } else {
            error('Invalid round mode', this.constructor.name, '\n');
            return null;
        }

        fitted_scale_interval = this.#scale_intervals[fitted_scale_deg];
        const fit_diff = fitted_scale_interval - intervalFromRoot;
        const fitted_note = inputNote + fit_diff;
        this.#active_note = fitted_note;
        return fitted_note;
    }

    fit(note) {
        return this.fitPitch(note);
    }
    
    /**
     * Transposes a note by a specified amount
     * 
     * The transposition method depends on the scale mode:
     * - If scale_mode is enabled: transposes by scale degrees
     * - If scale_mode is disabled: transposes by semitones
     * 
     * @param {number} [note] - MIDI note number (0-127). If not provided, uses active_note or 60
     * @param {number} [amt] - Transposition amount. If not provided, uses note as amount
     * @returns {number} The transposed MIDI note number
     * @example
     * // Transpose C (60) up 2 scale degrees in major scale
     * const scale = new Scale({scale_mode: 1, root_note: 0, scale_intervals: [0,2,4,5,7,9,11]});
     * const transposed = scale.transpose(60, 2); // Returns 64 (E)
     */
    transpose(note, amt) {
        if(typeof amt === 'undefined') {
            amt = 0;
        }

        //if scale_mode, then transpose by scale degree, else transpose by semitones
        if(this.#scale_mode) {
            return this.transposeDegrees(note, amt);
        } else {
            return this.transposeSemitones(note, amt)
        }
    }
    
    /**
     * Transposes a note by semitones (chromatic transposition)
     * @param {number} [note] - MIDI note number (0-127). If not provided, uses active_note or 60
     * @param {number} [amt] - Number of semitones to transpose. If not provided, uses note as amount
     * @returns {number} The transposed MIDI note number
     */
    transposeSemitones(note, amt) {
        if(typeof amt === 'undefined') {
            amt = 0;
        }
        this.#active_note = Math.floor(note) + Math.floor(amt);
        return this.#active_note;
    }
    
    /**
     * Transposes a note by scale degrees (diatonic transposition)
     * @param {number} [note] - MIDI note number (0-127). If not provided, uses active_note or 60
     * @param {number} [amt] - Number of scale degrees to transpose. If not provided, uses note as amount
     * @param {number} [previousNote] - Previous note for context in fitting
     * @param {number} [roundMode] - Round mode for fitting
     * @returns {number} The transposed MIDI note number
     * @example
     * // Transpose C (60) up 2 degrees in C major scale
     * const scale = new Scale({scale_mode: 1, root_note: 0, scale_intervals: [0,2,4,5,7,9,11]});
     * const transposed = scale.transposeDegrees(60, 2); // Returns 64 (E)
     */
    transposeDegrees(note, amt, previousNote, roundMode) {
        if(typeof amt === 'undefined') {
            amt = 0;
        }
        
        // First fit the input note to the scale
        const ftd = this.fitPitch(note, previousNote, roundMode);
        const fitted_deg = this.getScaleDegree(ftd);
        
        // Convert amt to integer and clamp to prevent out-of-bounds transposition
        const amt_ = Math.max(0 - ftd, Math.min(127 - ftd, Math.floor(amt)));
        
        // If the amount is 0, return the fitted note
        if(amt_ === 0) {
            return ftd;
        }
        const scale_length = this.#scale_intervals.length;
    
        // Calculate the interval for transposition
        const xpose_deg = Scale.wrap(fitted_deg + amt_, 0, scale_length);
        
        const fitted_step = this.#scale_intervals[fitted_deg];
        const xpose_step = this.#scale_intervals[xpose_deg];
        const relative_step = xpose_step - fitted_step;
        const xpose_octaves = Math.floor((fitted_deg + amt_) / scale_length);
        const xpose_amt = relative_step + (xpose_octaves * this.steps_per_octave);
        const xposed = ftd + xpose_amt;
        
        
        this.#active_note = xposed;
        return xposed;
    }
    
    /**
     * Calculates the transposition distance between two notes
     * @param {number} start - Starting MIDI note number
     * @param {number} end - Ending MIDI note number
     * @returns {Object} Object containing distance, start, and end properties
     * @returns {number} returns.distance - The transposition distance
     * @returns {number} returns.start - The fitted starting note
     * @returns {number} returns.end - The fitted ending note
     */
    getTransposeDistance(start, end) { 
        if(!this.#scale_mode) {
            return {
                distance: end - start,
                start: start,
                end: start
            }
        } else {
            let inverted = false;
            if(start > end) {
                const temp = start;
                start = end;
                end = temp;
                inverted = true;
            }
        start = this.fitPitch(start);
        end = this.fitPitch(end);
            for(let i = end - start; i >= 0; i--) {
                const transposed = this.transposeDegrees(start, i);
                if(transposed === end) {
                    const d = inverted ? -i : i;
                    return {
                        distance: d,
                        start: start,
                        end: end,
                    }
                }
            }
        }
    }
    
    /**
     * Gets all MIDI notes that are valid in the current scale
     * @returns {number[]} Array of MIDI note numbers (0-127) that are in scale
     * @example
     * // Get all valid notes in C major scale
     * const scale = new Scale({scale_mode: 1, root_note: 0, scale_intervals: [0,2,4,5,7,9,11]});
     * const validNotes = scale.getAllValidNotes(); // Returns [0,2,4,5,7,9,11,12,14,16,17,19,21,23,...]
     */
    getAllValidNotes() {
        let notes = [];
        for(let i = 0; i < 128; i++) {
            const fitted = this.fitPitch(i);
            if(fitted === i) {
                notes.push(i);
            }
        }
        return notes;
    }

    /**
     * @param {number} note - MIDI note number
     * @returns {boolean} True if the note is in scale
     */
    isInTune(note) {
        return this.isInScale(note);
    }

    /**
     * Wraps a value within a specified range (modulo operation)
     * @param {number} value - The value to wrap
     * @param {number} min - The minimum value of the range
     * @param {number} max - The maximum value of the range
     * @returns {number} The wrapped value within the range
     * @example
     * Scale.wrap(13, 0, 12); // Returns 1
     * Scale.wrap(-1, 0, 12); // Returns 11
     */
    static wrap(value, min, max) {
        const range = max - min;
        return (((value - min) % range) + range) % range + min;
    }
}


if(typeof exports != 'undefined') {
    exports.Scale = Scale;
}