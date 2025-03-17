const BlinkDiff = require('blink-diff');

exports.mkCompare = (taskCtx) => async () => {
    const diff = new BlinkDiff({
        imageA: taskCtx.reference,
        imageB: taskCtx.pictureToCompare,
        thresholdType: BlinkDiff.THRESHOLD_PERCENT,
        threshold: 0.01
    });

    await diff.runWithPromise();
};
