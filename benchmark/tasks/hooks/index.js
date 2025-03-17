const fs = require('fs');
const generators = require('../../image-generator');
const {hooksCache, withHooksCache} = require('./cache');

const addImagesToTaskCtx = async (taskCtx, referenceGenerator, pictureToCompareGenerator) => {
    const [reference, pictureToCompare] = await Promise.all([
        referenceGenerator.toPngBuffer(),
        pictureToCompareGenerator.toPngBuffer()
    ]);

    taskCtx.reference = reference;
    taskCtx.pictureToCompare = pictureToCompare;
};

exports.mkWebAverageFailedPair = (taskCtx, cache = hooksCache) =>
    withHooksCache(taskCtx, cache, async function mkWebAverageFailedPair() {
        const averageFailedGenerator = new generators.WebAverageFailedGenerator();
        const referenceGenerator = new generators.ReferenceGenerator(averageFailedGenerator.width, averageFailedGenerator.height);

        return addImagesToTaskCtx(taskCtx, referenceGenerator, averageFailedGenerator);
    });

exports.mkWebAverageSuccessPair = (taskCtx, cache = hooksCache) =>
    withHooksCache(taskCtx, cache, async function mkWebAverageSuccessPair() {
        const averageFailedGenerator = new generators.WebAverageSuccessGenerator();
        const referenceGenerator = new generators.ReferenceGenerator(averageFailedGenerator.width, averageFailedGenerator.height);

        return addImagesToTaskCtx(taskCtx, referenceGenerator, averageFailedGenerator);
    });

exports.mkEqualPair = (taskCtx, {width, height}, cache = hooksCache) =>
    withHooksCache(taskCtx, cache, async function mkEqualPair() {
        const referenceGenerator = new generators.ReferenceGenerator(width, height);
        const alsoReferenceGenerator = new generators.ReferenceGenerator(width, height);

        return addImagesToTaskCtx(taskCtx, referenceGenerator, alsoReferenceGenerator);
    });

exports.mkFullDiffPair = (taskCtx, {width, height}, cache = hooksCache) =>
    withHooksCache(taskCtx, cache, async function mkFullDiffPair() {
        const contrastReferenceGenerator = new generators.ContrastToReferenceGenerator(width, height);
        const referenceGenerator = new generators.ReferenceGenerator(width, height);

        return addImagesToTaskCtx(taskCtx, referenceGenerator, contrastReferenceGenerator);
    });

exports.mkFixedVisibleDiffPercentPair = (taskCtx, {width, height, diff}, cache = hooksCache) =>
    withHooksCache(taskCtx, cache, async function mkFixedVisibleDiffPercentPair() {
        const referenceGenerator = new generators.ReferenceGenerator(width, height);
        const contrastReferenceGenerator = new generators.FixedVisibleDiffAmountGenerator(width, height, diff);

        return addImagesToTaskCtx(taskCtx, referenceGenerator, contrastReferenceGenerator);
    });

exports.mkDemonstrativeExamplePair = (taskCtx, cache = hooksCache) =>
    withHooksCache(taskCtx, cache, async function mkDemonstrativeExamplePair() {
        const referencePath = require.resolve('../../fixtures/reference.png');
        const actualPath = require.resolve('../../fixtures/actual.png');

        const [reference, pictureToCompare] = await Promise.all([
            fs.promises.readFile(referencePath),
            fs.promises.readFile(actualPath)
        ]);

        taskCtx.reference = reference;
        taskCtx.pictureToCompare = pictureToCompare;
    });
