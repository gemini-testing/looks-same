# LooksSame

Pure node.js library for comparing PNG-images, taking into account human color perception.
It is created specially for the needs of visual regression testing for [`gemini`](http://github.com/bem/gemini)
utility, but can be used for other purposes.

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

For visual regression tasks it may be useful to ignore text caret in text input elements.
You can do it with `ignoreCaret` option.

```javascript
looksSame('image1.png', 'image2.png', {ignoreCaret: true}, function(error, equal) {
    ...
});
```

Both `strict` and `ignoreCaret` can be set independently of one another.

## Building diff image

```javascript
looksSame.createDiff({
    reference: '/path/to/reference/image.png',
    current: '/path/to/reference/image.png',
    diff: '/path/to/save/diff/to.png',
    highlightColor: '#ff00ff' //color to highlight the differences
    strict: true //strict comparsion
}, function(error) {
});
```
