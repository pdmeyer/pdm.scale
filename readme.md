# pdm.scale

A library for working with 12 tone equal temperament scales in Max MSP.

This package currently includes four gen patches:

- `pdm.scale.fit.gendsp` : fit a note to a scale
- `pdm.scale.xpose.gendsp` : transpose a note by a specified number of scale degrees
- `pdm.scale.validate.gendsp` : validate that a scale is formatted correctly for use in the library
- `pdm.scale.length.gendesp` : get the length of a scale

Scales are provided to the objects as a buffer containing an ascending list of semitone intervals.

e.g. a Major scale would be provided as a buffer containing the intervals `[0, 2, 4, 5, 7, 9, 11]`. You can use the buffer name "intervals", or provide your own buffer and assign it to the "intervals" parameter of the gen/gen~ patcher. e.g. `[gen pdm.scale.fit @intervals ---my_intervals_buf]`

The root note of the scale is provided as a parameter to the objects.

e.g. a Major scale with a root note of 0 would be provided as a buffer containing the intervals `[0, 2, 4, 5, 7, 9, 11]` and a `root_note` of 0.

Use `pdm.scale.maxhelp` to see how to use the library. 

## Future Enhancements:
* Use `define` or RNBO to make it more user friendly to invoke the, fit, xpose, validate, and length objects
    * RNBO would allow the intervals to be passed as a list, so that's nice...
* Include a Javascript class and examples for working with scales in Javascript
* Add help fuiles for each object
* Tidy up the general help file and migrate it to be the package's main patch
* Add refdocs

