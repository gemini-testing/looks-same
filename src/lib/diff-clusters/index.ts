import DiffArea from "../diff-area";
import { CLUSTERS_SIZE } from "../constants";
import * as clustersJoiner from "./clusters-joiner";

export default class DiffClusters {
    private _clustersSize: any;
    private _clusters: any[];

    constructor(clustersSize?: number) {
        this._clustersSize = clustersSize || CLUSTERS_SIZE;
        this._clusters = [];
    }

    update(x, y): this {
        if (!this._clusters.length) {
            this._clusters.push(DiffArea.create().update(x, y));

            return this;
        }

        this._joinToClusters(x, y);

        return this;
    }

    _joinToClusters(x, y) {
        const pointCluster = this._clusters.find(c => c.isPointInArea(x, y, this._clustersSize));

        if (!pointCluster) {
            this._clusters.push(DiffArea.create().update(x, y));

            return;
        }

        pointCluster.update(x, y);
    }

    get clusters() {
        return clustersJoiner.join(this._clusters).map(c => c.area);
    }
}
