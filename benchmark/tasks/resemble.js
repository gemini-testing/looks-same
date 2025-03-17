const resemble = require('resemblejs');

exports.mkCompare = (taskCtx) => async () => {
    return new Promise((resolve) => {
        resemble(taskCtx.reference)
            .compareTo(taskCtx.pictureToCompare)
            .ignoreAntialiasing()
            .onComplete(resolve);
    });
};
