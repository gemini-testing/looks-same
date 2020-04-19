'use strict';

const DiffArea = require('../diff-area');
const {CLUSTERS_SIZE} = require('../constants');
const clustersJoiner = require('./clusters-joiner');

module.exports = class DiffClusters {
    constructor(clustersSize) {
        this._clustersSize = clustersSize || CLUSTERS_SIZE;
        this._clusters = [];
    }

    update(x, y) {
        if (!this._clusters.length) {
            this._clusters.push(DiffArea.create().update(x, y));

            return;
        }

        this._joinToClusters(x, y);

        return this;
    }

    _joinToClusters(x, y) {
        const pointCluster = this._clusters.find((c) => c.isPointInArea(x, y, this._clustersSize));

        if (!pointCluster) {
            this._clusters.push(DiffArea.create().update(x, y));

            return;
        }

        pointCluster.update(x, y);
    }

    get clusters() {
        return clustersJoiner.join(this._clusters).map(c => c.area);
    }
};
