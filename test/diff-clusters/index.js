'use strict';

const DiffArea = require('../../lib/diff-area');
const DiffClusters = require('../../lib/diff-clusters');
const clustersJoiner = require('../../lib/diff-clusters/clusters-joiner');

describe('DiffClusters', () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.stub(clustersJoiner, 'join');
        sandbox.stub(DiffArea.prototype, 'isPointInArea');
    });

    afterEach(() => sandbox.restore());

    it('should define points to different clusters', () => {
        DiffArea.prototype.isPointInArea.returns(false);
        clustersJoiner.join = (clusters) => clusters;
        const diffClusters = new DiffClusters();

        diffClusters.update(1, 1);
        diffClusters.update(5, 5);

        assert.deepEqual(diffClusters.clusters, [
            {left: 1, top: 1, right: 1, bottom: 1},
            {left: 5, top: 5, right: 5, bottom: 5}
        ]);
    });

    it('should define points to the same clusters', () => {
        DiffArea.prototype.isPointInArea.returns(true);
        clustersJoiner.join = (clusters) => clusters;
        const diffClusters = new DiffClusters();

        diffClusters.update(1, 1);
        diffClusters.update(5, 5);

        assert.deepEqual(diffClusters.clusters, [{left: 1, top: 1, right: 5, bottom: 5}]);
    });

    it('should return joined clusters', () => {
        DiffArea.prototype.isPointInArea.returns(false);
        clustersJoiner.join.returns([{area: {left: 1, top: 1, right: 5, bottom: 5}}]);
        const diffClusters = new DiffClusters();

        diffClusters.update(1, 1);
        diffClusters.update(5, 5);

        assert.deepEqual(diffClusters.clusters, [{left: 1, top: 1, right: 5, bottom: 5}]);
    });
});
