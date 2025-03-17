const looksSame = require('looks-same');

exports.mkCompare = (
    taskCtx,
    {strict = false, ignoreAntialiasing = true} = {},
) => async () => {
    const result = await looksSame(taskCtx.reference, taskCtx.pictureToCompare, {
        createDiffImage: true,
        strict,
        ignoreAntialiasing,
        ignoreCaret: false,
        tolerance: 2.3,
        antialiasingTolerance: 6
    });

    if (!result.equal) {
        await result.diffImage.createBuffer('png');
    }
};
