"use strict";

import _ from "lodash";
import * as png from "./png";
import DiffArea from "./diff-area";
import DiffClusters from "./diff-clusters";
import { validateImages } from "./validators";

function read({ source, ...opts }) {
    const readFunc = Buffer.isBuffer(source) ? png.fromBuffer : png.fromFile;
    return readFunc(source, opts);
}

export const readPair = async (first, second) => {
    const [firstPng, secondPng] = await Promise.all([first, second].map(read));

    return { first: firstPng, second: secondPng };
};

const getDiffClusters = (diffClusters, diffArea, { shouldCluster }) => {
    return shouldCluster ? diffClusters.clusters : [diffArea.area];
};

export const getDiffPixelsCoords = (png1, png2, predicate, opts, callback?) => {
    if (!callback) {
        callback = opts;
        opts = {};
    }

    const stopOnFirstFail = opts.hasOwnProperty("stopOnFirstFail") ? opts.stopOnFirstFail : false;

    const width = Math.min(png1.width, png2.width);
    const height = Math.min(png1.height, png2.height);

    const diffArea = new DiffArea();
    const diffClusters = new DiffClusters(opts.clustersSize);

    const processRow = y => {
        setImmediate(() => {
            for (let x = 0; x < width; x++) {
                const color1 = png1.getPixel(x, y);
                const color2 = png2.getPixel(x, y);

                const result = predicate({
                    color1,
                    color2,
                    png1,
                    png2,
                    x,
                    y,
                    width,
                    height,
                });

                if (!result) {
                    const { x: actX, y: actY } = png1.getActualCoord(x, y);
                    diffArea.update(actX, actY);
                    if (opts.shouldCluster) {
                        diffClusters.update(actX, actY);
                    }

                    if (stopOnFirstFail) {
                        return callback({ diffArea, diffClusters: getDiffClusters(diffClusters, diffArea, opts) });
                    }
                }
            }

            y++;

            if (y < height) {
                processRow(y);
            } else {
                callback({ diffArea, diffClusters: getDiffClusters(diffClusters, diffArea, opts) });
            }
        });
    };

    processRow(0);
};

export const formatImages = (img1, img2) => {
    validateImages(img1, img2);

    return [img1, img2].map(i => {
        return _.isObject(i) && !Buffer.isBuffer(i) ? i : { source: i, boundingBox: null };
    });
};
