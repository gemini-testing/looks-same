'use strict';

const clustersJoiner = require('../../lib/diff-clusters/clusters-joiner');

describe('DiffClusters', () => {
    it('should join clusters', () => {
        const clusters = [
            {area: {left: 1, top: 1, right: 5, bottom: 5}},
            {area: {left: 2, top: 2, right: 6, bottom: 6}},
            {area: {left: 10, top: 10, right: 11, bottom: 11}}
        ];
        const joinedClusters = clustersJoiner.join(clusters).map(c => c.area);

        assert.deepEqual(joinedClusters, [
            {left: 1, top: 1, right: 6, bottom: 6},
            {left: 10, top: 10, right: 11, bottom: 11}
        ]);
    });
});
