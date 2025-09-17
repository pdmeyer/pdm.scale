# pdm.scale.lib.js API Reference

A JavaScript library for musical scale operations and pitch fitting in Max/MSP environments.

## Overview

The `Scale` class provides functionality for working with 12 tone equal temperament scales, including pitch fitting, transposition, and scale validation.

## Table of Contents

- [Class: Scale](#class-scale)
- [Constructor](#constructor)
- [Properties](#properties)
- [Methods](#methods)
- [Static Methods](#static-methods)
- [Examples](#examples)

## Class: Scale

The main class for scale operations and pitch fitting.

### Constructor

#### `new Scale(scale_obj)`

Creates a new Scale instance.

**Parameters:**
- `scale_obj` (Object, optional) - Scale configuration object

**Scale Object Properties:**
- `scale_mode` (number) - Scale mode (1 = enabled, 0 = disabled)
- `scale_intervals` (number[]) - Array of semitone intervals defining the scale
- `root_note` (number) - Root note (0-11, where 0 = C)

**Example:**
```javascript
const majorScale = new Scale({
    scale_mode: 1,
    root_note: 0,
    scale_intervals: [0, 2, 4, 5, 7, 9, 11],
});
```

## Properties

### Getters

#### `length`
- **Type:** `number`
- **Description:** The number of notes in the scale (or 12 if scale mode is disabled)
- **Read-only:** Yes

#### `valid_notes`
- **Type:** `number[]`
- **Description:** Array of all MIDI notes (0-127) that are valid in the current scale
- **Read-only:** Yes

#### `scale_mode`
- **Type:** `boolean`
- **Description:** True if scale mode is enabled, false otherwise
- **Read-only:** Yes

#### `scale_intervals`
- **Type:** `number[]`
- **Description:** Array of semitone intervals defining the scale
- **Read-only:** Yes

#### `root_note`
- **Type:** `number`
- **Description:** Root note (0-11, where 0 = C)
- **Read-only:** Yes

#### `auto_round`
- **Type:** `boolean`
- **Description:** True if auto-round is enabled, false otherwise
- **Read-only:** Yes

#### `round_direction`
- **Type:** `boolean`
- **Description:** True if rounding up, false if rounding down
- **Read-only:** Yes

#### `steps_per_octave`
- **Type:** `number`
- **Description:** Number of steps per octave (default: 12)
- **Read-only:** Yes

### Setters

#### `scale_intervals`
- **Type:** `number[]`
- **Description:** Sets the scale intervals array
- **Validation:** Must be an array of integers
- **Side Effects:** Recalculates scale length

#### `root_note`
- **Type:** `number`
- **Description:** Sets the root note of the scale
- **Validation:** Must be an integer (0-11)
- **Side Effects:** Automatically wraps to valid range

#### `scale_mode`
- **Type:** `number|boolean`
- **Description:** Sets the scale mode (1/true = enabled, 0/false = disabled)
- **Side Effects:** Recalculates scale length

#### `auto_round`
- **Type:** `number|boolean`
- **Description:** Sets the auto-round behavior (1/true = enabled, 0/false = disabled). Auto-rounding enables "smart rounding" where the scale degree is rounded up if the note increased by 1 from the previous note, otherwise it is rounded down. This is useful when advancing through notes in a menu or number box in Max.

#### `round_direction`
- **Type:** `number`
- **Description:** Sets the round direction for pitch fitting (0 = down, 1 = up). Will be overwritten by auto-rounding if enabled.

#### `steps_per_octave`
- **Type:** `number`
- **Description:** Sets the number of steps per octave
- **Validation:** Must be an integer greater than 0

## Methods

### `setParams(scale_obj)`

Sets multiple scale parameters from a configuration object.

**Parameters:**
- `scale_obj` (Object) - Scale configuration object

**Required Properties:**
- `scale_mode` (number)
- `scale_intervals` (number[])
- `root_note` (number)

**Throws:** Error if required properties are missing

**Example:**
```javascript
scale.setParams({
    scale_mode: 1,
    scale_intervals: [0, 2, 4, 5, 7, 9, 11],
    root_note: 0
});
```

### `isInScale(note)`

Checks if a note is in the current scale.

**Parameters:**
- `note` (number) - MIDI note number (0-127)

**Returns:** `boolean` - True if the note is in scale, false otherwise

**Example:**
```javascript
const isInScale = scale.isInScale(60); // true for C in C major
```

### `getFitDifference(note)`

Gets the difference between a note and its fitted version.

**Parameters:**
- `note` (number) - MIDI note number (0-127)

**Returns:** `number` - The difference (fitted note - original note)

**Example:**
```javascript
const diff = scale.getFitDifference(61); // Returns -1 if 61 becomes 60
```

### `fitPitch(inputNote)`

Fits a MIDI note to the current scale. This is the core method for pitch fitting.

**Parameters:**
- `inputNote` (number|null) - MIDI note number (0-127) or null

**Returns:** `number` - The fitted MIDI note number

**Behavior:**
- If `inputNote` is null, uses note 60 (C4) as default
- If scale mode is disabled, returns the input note unchanged
- Uses auto-round behavior if enabled
- Clamps input to valid MIDI range (0-127)

**Example:**
```javascript
const fitted = scale.fitPitch(61); // Returns 60 (C) in C major scale
```

### `transpose(note, amt)`

Transposes a note by a specified amount. The method depends on scale mode.

**Parameters:**
- `note` (number, optional) - MIDI note number (0-127). If not provided, uses active_note or 60
- `amt` (number, optional) - Transposition amount. If not provided, uses note as amount

**Returns:** `number` - The transposed MIDI note number

**Behavior:**
- If scale_mode is enabled: transposes by scale degrees
- If scale_mode is disabled: transposes by semitones
- Automatically fits input note to scale if needed

**Example:**
```javascript
const transposed = scale.transpose(60, 2); // Transpose C up 2 scale degrees
```

### `transposeSemitones(note, amt)`

Transposes a note by semitones (chromatic transposition).

**Parameters:**
- `note` (number, optional) - MIDI note number (0-127). If not provided, uses active_note or 60
- `amt` (number, optional) - Number of semitones to transpose. If not provided, uses note as amount

**Returns:** `number` - The transposed MIDI note number

**Example:**
```javascript
const transposed = scale.transposeSemitones(60, 2); // Transpose C up 2 semitones
```

### `transposeDegrees(note, amt)`

Transposes a note by scale degrees (diatonic transposition).

**Parameters:**
- `note` (number, optional) - MIDI note number (0-127). If not provided, uses active_note or 60
- `amt` (number, optional) - Number of scale degrees to transpose. If not provided, uses note as amount

**Returns:** `number` - The transposed MIDI note number

**Example:**
```javascript
const transposed = scale.transposeDegrees(60, 2); // Transpose C up 2 degrees in scale
```

### `getTransposeDistance(start, end)`

Calculates the transposition distance between two notes.

**Parameters:**
- `start` (number) - Starting MIDI note number
- `end` (number) - Ending MIDI note number

**Returns:** `Object` - Object containing:
- `distance` (number) - The transposition distance
- `start` (number) - The fitted starting note
- `end` (number) - The fitted ending note

**Example:**
```javascript
const distance = scale.getTransposeDistance(60, 64);
// Returns {distance: 2, start: 60, end: 64}
```

## Static Methods

### `Scale.wrap(value, min, max)`

Wraps a value within a specified range using modulo operation.

**Parameters:**
- `value` (number) - The value to wrap
- `min` (number) - The minimum value of the range
- `max` (number) - The maximum value of the range

**Returns:** `number` - The wrapped value within the range

**Example:**
```javascript
Scale.wrap(13, 0, 12); // Returns 1
Scale.wrap(-1, 0, 12); // Returns 11
```

## Examples

### Basic Scale Creation and Usage

```javascript
// Create a C major scale
const majorScale = new Scale({
    scale_mode: 1,
    root_note: 0,
    scale_intervals: [0, 2, 4, 5, 7, 9, 11],
    scale_name: "Major"
});

// Fit a note to the scale
const fittedNote = majorScale.fitPitch(61); // Returns 60 (C)

// Check if a note is in scale
const isInScale = majorScale.isInScale(60); // true

// Transpose by scale degrees
const transposed = majorScale.transpose(60, 2); // Returns 64 (E)
```

### Working with Different Scales

```javascript
// Create a pentatonic scale
const pentatonic = new Scale({
    scale_mode: 1,
    root_note: 0,
    scale_intervals: [0, 2, 4, 7, 9],
    scale_name: "Pentatonic"
});

// Create a chromatic scale (scale mode disabled)
const chromatic = new Scale({
    scale_mode: 0,
    root_note: 0,
    scale_intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
});
```

### Advanced Usage

```javascript
// Enable auto-rounding
scale.auto_round = true;
scale.round_direction = 1; // Round up

// Get all valid notes in the scale
const validNotes = scale.valid_notes;
console.log(validNotes); // [0, 2, 4, 5, 7, 9, 11, 12, 14, ...]

// Calculate transposition distance
const distance = scale.getTransposeDistance(60, 67);
console.log(distance.distance); // 5 (perfect fourth)
```

## Error Handling

The library includes built-in error handling for common issues:

- Invalid scale intervals (must be array of integers)
- Invalid root note (must be integer 0-11)
- Invalid steps per octave (must be positive integer)
- Null input notes (defaults to note 60)

## Notes

- MIDI note numbers range from 0-127
- Root notes are represented as 0-11 (C=0, C#=1, D=2, etc.)
- Scale intervals are in semitones
- The library automatically handles octave wrapping
- Auto-round behavior affects how notes are fitted to the scale
- The `active_note` property tracks the last processed note for context

## License

Created by Philip Meyer, 2025
