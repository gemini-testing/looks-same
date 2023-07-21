# LooksSame

[![Build Status](https://travis-ci.org/gemini-testing/looks-same.svg?branch=master)](https://travis-ci.org/gemini-testing/looks-same)

Node.js library for comparing images, taking into account human color
perception. It is created specially for the needs of visual regression testing
for [`hermione`](http://github.com/gemini-testing/hermione) utility, but can be used
for other purposes.

## Supported image formats

JPEG, PNG, WebP, GIF, AVIF, TIFF and SVG images are supported.

*Note: If you want to compare jpeg files, you may encounter random differences due to the jpeg structure if they are not lossless jpeg files.*

## Comparing images

```javascript
const looksSame = require('looks-same');

// equal will be true, if images looks the same
const {equal} = await looksSame('image1.png', 'image2.png');
```

Parameters can be paths to files or buffer with compressed image.

By default, it will detect only noticeable differences. If you wish to detect any difference,
use `strict` options:

```javascript
const {equal} = await looksSame('image1.png', 'image2.png', {strict: true});
```

You can also adjust the [ΔE](http://en.wikipedia.org/wiki/Color_difference) value that will be treated as error
in non-strict mode:

```javascript
const {equal} = await looksSame('image1.png', 'image2.png', {tolerance: 5});
```

Default `tolerance` in non-strict mode is 2.3 which is enough for the most cases.
Setting `tolerance` to 0 will produce the same result as `strict: true`, but strict mode
is faster.
Attempt to set `tolerance` in strict mode will produce an error.

Some devices can have different proportion between physical and logical screen resolutions also
known as `pixel ratio`. Default value for this proportion is 1.
This param also affects the comparison result, so it can be set manually with `pixelRatio` option.

```javascript
const {equal} = await looksSame('image1.png', 'image2.png', {pixelRatio: 2});
```

### Comparing images with ignoring caret

Text caret in text input elements it is a pain for visual regression tasks, because it is always blinks. These diffs will be ignored by default. You can use `ignoreCaret` option with `false` value to disable ignoring such diffs. In that way text caret will be marked as diffs.

```javascript
const {equal} = await looksSame('image1.png', 'image2.png', {ignoreCaret: true});
```

Both `strict` and `ignoreCaret` can be set independently of one another.

### Comparing images with ignoring antialiasing

Some images has difference while comparing because of antialiasing. These diffs will be ignored by default. You can use `ignoreAntialiasing` option with `false` value to disable ignoring such diffs. In that way antialiased pixels will be marked as diffs. Read more about [anti-aliasing algorithm](http://www.eejournal.ktu.lt/index.php/elt/article/view/10058/5000).

```javascript
const {equal} = await looksSame('image1.png', 'image2.png', {ignoreAntialiasing: true});
```

Sometimes the antialiasing algorithm can work incorrectly due to some features of the browser rendering engine. Use the option `antialiasingTolerance` to make the algorithm less strict. With this option you can specify the minimum difference in brightness (zero by default) between the darkest/lightest pixel (which is adjacent to the antialiasing pixel) and theirs adjacent pixels.

We recommend that you don't increase this value above 10. If you need to increase more than 10 then this is definitely not antialiasing.

Example:
```javascript
const {equal} = await looksSame('image1.png', 'image2.png', {ignoreAntialiasing: true, antialiasingTolerance: 3});
```

### Getting diff bounds
Looksame returns information about diff bounds. It returns only first pixel if you passed `stopOnFirstFail` option with `true` value. The whole diff area would be returned if `stopOnFirstFail` option is not passed or it's passed with `false` value.

### Getting diff clusters
Looksame returns diff bounds divided into clusters if option `shouldCluster` passed with `true` value. Moreover you can pass clusters size using `clustersSize` option.

```javascript
// {
//     equal: false,
//     diffBounds: {left: 10, top: 10, right: 20, bottom: 20}
//     diffClusters: [
//         {left: 10, top: 10, right: 14, bottom: 14},
//         {left: 16, top: 16, right: 20, bottom: 20}
//     ]
// }
const {equal, diffBounds, diffClusters} = await looksSame('image1.png', 'image2.png', {shouldCluster: true, clustersSize: 10});
```

## Building diff image

```javascript
await looksSame.createDiff({
    reference: '/path/to/reference/image.png',
    current: '/path/to/current/image.png',
    diff: '/path/to/save/diff/to.png',
    highlightColor: '#ff00ff', // color to highlight the differences
    strict: false, // strict comparsion
    tolerance: 2.5,
    antialiasingTolerance: 0,
    ignoreAntialiasing: true, // ignore antialising by default
    ignoreCaret: true // ignore caret by default
});
```

## Building diff image as a Buffer

If you don't want the diff image to be written on disk, then simply **don't**
pass any `diff: path` to the `createDiff` method. The method will then
resolve a `Buffer` containing the diff. You can also specify buffer format
with `extension` key. Default extension is `png`. List of supported formats:
*`heic`, `heif`, `avif`, `jpeg`, `jpg`, `png`, `raw`, `tiff`, `tif`, `webp`, `gif`, `jp2`, `jpx`, `j2k`, `j2c`*

```javascript
const buffer = await looksSame.createDiff({
    // exactly same options as above, but with optional extension and without diff
    extension: 'png'
});
```

## Comparing images and creating diff image simultaneously

If you need both co compare images and create diff image, you can pass option `createDiffImage: true`,
it would work faster than two separate function calls:

```javascript
const {
    equal,
    diffImage,
    differentPixels,
    totalPixels,
    diffBounds,
    diffClusters
} = await looksSame('image1.png', 'image2.png', {createDiffImage: true});

if (!equal) {
    await diffImage.save('diffImage.png');
}
```

## Comparing colors

If you just need to compare two colors you can use `colors` function:

```javascript
const equal = looksSame.colors(
    {R: 255, G: 0, B: 0},
    {R: 254, G: 1, B: 1},
    {tolerance: 2.5}
);
```
