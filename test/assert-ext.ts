export default function(chai) {
    const assert = chai.assert;

    assert.calledOnceWith = function() {
        assert.calledOnce(arguments[0]);
        assert.calledWith(...arguments);
    };

    assert.calledOnceWithMatch = function() {
        assert.calledOnce(arguments[0]);
        assert.calledWithMatch(...arguments);
    };
};
