'use strict';

module.exports = (data) => {
    const c1 = data.color1;
    const c2 = data.color2;

    return c1.R === c2.R
        && c1.G === c2.G
        && c1.B === c2.B;
};
