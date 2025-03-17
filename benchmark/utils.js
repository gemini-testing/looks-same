exports.truncateNumber = function truncateNumber(value, precision = 2) {
    const multiplier = 10 ** precision;

    return Math.round(value * multiplier) / multiplier;
};
