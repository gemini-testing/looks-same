const _ = require('lodash');
const colorDiff = require('color-diff');
const {REFERENCE_COLOR} = require('./constants');
const {labToRgb} = require('./utils');

const abMinValue = -38;
const abMaxValue = 128;

const lMinValue = 0;
const lMaxValue = 100;

const makeProbabilityDistribution = _.memoize((histBuckets) => {
    let sum = 0;

    return histBuckets.map(v => sum += v[2]);
});

const createAllCiede2000LabDiffs = _.memoize((referenceLab) => {
    const ciede2000Diffs = [];
    const referenceRgb = labToRgb(referenceLab);

    for (let l = lMinValue; l <= lMaxValue; l++) {
        for (let ab = abMinValue; ab <= abMaxValue; ab++) {
            ciede2000Diffs.push({
                diff: colorDiff.diff(
                    {L: referenceLab[0], a: referenceLab[1], b: referenceLab[2]},
                    {L: l, a: ab, b: ab}
                ),
                lab: [l, ab, ab]
            });
        }
    }

    // Multiple CIE-L*ab colors are being converted to same RGB colors
    return ciede2000Diffs.filter(({diff, lab}) => {
        const isZeroCiede2000Diff = diff === 0;
        const isSameRgbColor = _.isEqual(labToRgb(lab), referenceRgb);

        return isZeroCiede2000Diff === isSameRgbColor;
    });
});

const getSuitableBucketRgbColors = _.memoize((histBuckets, referenceLab) => {
    const ciede2000Diffs = createAllCiede2000LabDiffs(referenceLab);

    return histBuckets.map(bucket => {
        const averageCiede2000Diff = (bucket[0] + bucket[1]) / 2;
        const suitableLabColor = _.minBy(ciede2000Diffs, pair => Math.abs(pair.diff - averageCiede2000Diff)).lab;

        return labToRgb(suitableLabColor);
    });
});

exports.HistCieDiffColorsGenerator = class HistCieDiffColorsGenerator {
    constructor(histBuckets) {
        this._distribution = makeProbabilityDistribution(histBuckets);
        this._suitableBucketColors = getSuitableBucketRgbColors(histBuckets, REFERENCE_COLOR);
    }

    getRandomRgbColor() {
        const randomValue = Math.random();

        // Shortcut to speed up execution
        if (randomValue < this._distribution[0]) {
            return this._suitableBucketColors[0];
        }

        const bucketNumber = _.sortedIndex(this._distribution, randomValue);

        return this._suitableBucketColors[bucketNumber];
    }
};
