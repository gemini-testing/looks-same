const {PNG} = require('pngjs');
const pixelmatch = require('pixelmatch');

exports.mkCompare = (taskCtx) => async () => {
    const img1 = PNG.sync.read(taskCtx.reference);
    const img2 = PNG.sync.read(taskCtx.pictureToCompare);
    const {width, height} = img1;
    const diff = new PNG({width: img1.width, height: img1.height});

    const isDiff = pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 0.1});

    if (isDiff) {
        PNG.sync.write(diff);
    }
};
