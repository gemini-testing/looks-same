'use strict';
var path = require('path'),
    temp = require('temp'),

    gm = require('gm'),
    looksSame = require('..');

function imagePath(image) {
    return path.resolve(__dirname, '..',  'test', 'data', image);
}

var refImage = imagePath('image1.png'),
    currImage = imagePath('image3.png');

function benchamrkDiff(title, refImage, currImage) {
    suite(title, function() {
        var path1 = temp.path({suffix: '.png'}),
            path2 = temp.path({suffix: '.png'});

        set('iterations', 1000);
        bench('looksSame', function(next) {
            looksSame.saveDiff({
                reference: refImage,
                current: currImage,
                diff: path1,
                highlightColor: '#ff00ff'
            }, next);
        });

        bench('gm', function(next) {
            gm.compare(
                refImage,
                currImage,
                {
                    file: path2,
                    highlightStyle: 'assign',
                    highlightColor: '"#ff00ff"'
                },
                next
            );
        });
    });
}

benchamrkDiff('small diff', imagePath('image1.png'), imagePath('image3.png'));
benchamrkDiff('large diff', imagePath('large-image1.png'), imagePath('large-image2.png'));
