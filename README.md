# LooksSame

[![Build Status](https://travis-ci.org/gemini-testing/looks-same.svg?branch=master)](https://travis-ci.org/gemini-testing/looks-same)

Node.js library for comparing PNG-images, taking into account human color
perception. It is created specially for the needs of visual regression testing
for [`gemini`](http://github.com/gemini-testing/gemini) utility, but can be used
for other purposes.

## Comparing images

```javascript
var looksSame = require('looks-same');

looksSame('image1.png', 'image2.png', function(error, equal) {
    //equal will be true, if images looks the same
});
```

Parameters can be paths to files or buffer with compressed `png` image.

By default, it will detect only noticeable differences. If you wish to detect any difference,
use `strict` options:

```javascript
looksSame('image1.png', 'image2.png', {strict: true}, function(error, equal) {
    ...
});
```

You can also adjust the [ΔE](http://en.wikipedia.org/wiki/Color_difference) value that will be treated as error
in non-strict mode:

```javascript
looksSame('image1.png', 'image2.png', {tolerance: 5}, function(error, equal) {
    ...
});
```

Default `tolerance` in non-strict mode is 2.3 which is enough for the most cases.
Setting `tolerance` to 0 will produce the same result as `strict: true`, but strict mode
is faster.
Attempt to set `tolerance` in strict mode will produce an error.

Some devices can have different proportion between physical and logical screen resolutions also
known as `pixel ratio`. Default value for this proportion is 1.
This param also affects the comparison result, so it can be set manually with `pixelRatio` option.

```javascript
looksSame('image1.png', 'image2.png', {pixelRatio: 2}, function(error, equal) {
    ...
});
```

### Comparing images with ignoring caret

For visual regression tasks it may be useful to ignore text caret in text input elements.
You can do it with `ignoreCaret` option.

```javascript
looksSame('image1.png', 'image2.png', {ignoreCaret: true}, function(error, equal) {
    ...
});
```

Both `strict` and `ignoreCaret` can be set independently of one another.

### Comparing images with ignoring antialiasing

Some images has difference while comparing because of antialiasing. These diffs will be ignored by default. You can use `ignoreAntialiasing` option with `false` value to disable ignoring such diffs. In that way antialiased pixels will be marked as diffs. Read more about [anti-aliasing algorithm](http://www.eejournal.ktu.lt/index.php/elt/article/view/10058/5000).

```javascript
looksSame('image1.png', 'image2.png', {ignoreAntialiasing: true}, function(error, equal) {
    ...
});
```

Sometimes the antialiasing algorithm can work incorrectly due to some features of the browser rendering engine. Use the option `antialiasingTolerance` to make the algorithm less strict. With this option you can specify the minimum difference in brightness (zero by default) between the darkest/lightest pixel (which is adjacent to the antialiasing pixel) and theirs adjacent pixels.

We recommend that you don't increase this value above 10. If you need to increase more than 10 then this is definitely not antialiasing.

Example:
```javascript
looksSame('image1.png', 'image2.png', {ignoreAntialiasing: true, antialiasingTolerance: 3}, function(error, equal) {
    ...
});
```

## Building diff image

```javascript
looksSame.createDiff({
    reference: '/path/to/reference/image.png',
    current: '/path/to/current/image.png',
    diff: '/path/to/save/diff/to.png',
    highlightColor: '#ff00ff', // color to highlight the differences
    strict: false, // strict comparsion
    tolerance: 2.5,
    ignoreAntialiasing: false, // do not ignore antialising by default
    ignoreCaret: false // do not ignore caret by default
}, function(error) {
    ...
});
```

## Building diff image as a Buffer

If you don't want the diff image to be written on disk, then simply **don't**
pass any `diff: path` to the `createDiff` method. The callback will then
receive a `Buffer` containing the diff as the 2nd argument.

```javascript
looksSame.createDiff({
    // exactly same options as above, but without diff
}, function(error, buffer) {
    ...
});
```

## Comparing colors

If you just need to compare two colors you can use `colors` function:

```javascript
looksSame.colors(
    {R: 255, G: 0, B: 0},
    {R: 254, G: 1, B: 1},
    {tolerance: 2.5}
);
```
