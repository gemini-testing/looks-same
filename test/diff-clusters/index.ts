import DiffArea from '../../src/lib/diff-area';
import DiffClusters from '../../src/lib/diff-clusters';
import * as clustersJoiner from '../../src/lib/diff-clusters/clusters-joiner';

describe('DiffClusters', () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.stub(clustersJoiner, 'join').returnsArg(0);
        sandbox.stub(DiffArea.prototype, 'isPointInArea');
    });

    afterEach(() => sandbox.restore());

    it('should define points to different clusters', () => {
        (DiffArea.prototype.isPointInArea as any).returns(false);
        const diffClusters = new DiffClusters();

        diffClusters.update(1, 1);
        diffClusters.update(5, 5);

        assert.deepEqual(diffClusters.clusters, [
            {left: 1, top: 1, right: 1, bottom: 1},
            {left: 5, top: 5, right: 5, bottom: 5}
        ]);
    });

    it('should define points to the same clusters', () => {
        (DiffArea.prototype.isPointInArea as any).returns(true);
        const diffClusters = new DiffClusters();

        diffClusters.update(1, 1);
        diffClusters.update(5, 5);

        assert.deepEqual(diffClusters.clusters, [{left: 1, top: 1, right: 5, bottom: 5}]);
    });
});
