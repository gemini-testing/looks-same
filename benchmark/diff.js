'use strict';
var path = require('path'),
    temp = require('temp'),

    gm = require('gm'),
    looksSame = require('..');

function imagePath(image) {
    return path.resolve(__dirname, '..', 'test', 'data', 'src', image);
}

function benchmarkDiff(title, refImage, currImage) {
    suite(title, function() {
        var path1 = temp.path({suffix: '.png'}),
            path2 = temp.path({suffix: '.png'});

        set('iterations', 1000);
        bench('looksSame', function(next) {
            looksSame.createDiff({
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

benchmarkDiff('small diff',
    imagePath('ref.png'),
    imagePath('different.png')
);

benchmarkDiff('large diff',
    imagePath('large-ref.png'),
    imagePath('large-different.png')
);
