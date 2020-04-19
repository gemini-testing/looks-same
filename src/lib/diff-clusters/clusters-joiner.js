'use strict';

const DiffArea = require('../diff-area');
const jsgraphs = require('js-graph-algorithms');

const hasOverlap = (cluster1, cluster2) => {
    if (cluster1.left > cluster2.right || cluster2.left > cluster1.right) {
        return false;
    }

    if (cluster1.bottom < cluster2.top || cluster2.bottom < cluster1.top) {
        return false;
    }

    return true;
};

const getConnectedComponents = (clusters) => {
    const graph = new jsgraphs.Graph(clusters.length);

    clusters.forEach((c1, i) => {
        clusters.forEach((c2, j) => {
            if (i !== j && hasOverlap(c1.area, c2.area)) {
                graph.addEdge(i, j);
            }
        });
    });

    return new jsgraphs.ConnectedComponents(graph);
};

exports.join = (clusters) => {
    const connectedComponents = getConnectedComponents(clusters);

    return connectedComponents.id.reduce((acc, clusterId, i) => {
        const {left, top, right, bottom} = clusters[i].area;
        if (!acc[clusterId]) {
            acc[clusterId] = DiffArea.create();
        }

        acc[clusterId]
            .update(left, top)
            .update(right, bottom);

        return acc;
    }, []);
};
