class HooksCache {
    constructor() {
        this._fnPerHooksCachedValuesPositions = new Map(); // hook -> fn -> position
        this._hooksCachedValues = new Map(); // hook -> array of saved values
    }

    _getHookCachedValues(hook) {
        if (!this._hooksCachedValues.has(hook)) {
            this._hooksCachedValues.set(hook, []);
        }

        return this._hooksCachedValues.get(hook);
    }

    _getFnCachedValuesPositions(hook) {
        if (!this._fnPerHooksCachedValuesPositions.has(hook)) {
            this._fnPerHooksCachedValuesPositions.set(hook, new Map());
        }

        return this._fnPerHooksCachedValuesPositions.get(hook);
    }

    _getFnPosition(fnCachedValuesPositions, fn) {
        if (!fnCachedValuesPositions.has(fn)) {
            fnCachedValuesPositions.set(fn, 0);
        }

        return fnCachedValuesPositions.get(fn);
    }

    load(hookId, taskId) {
        if (!hookId || !taskId) {
            return null;
        }

        const hookCachedValues = this._getHookCachedValues(hookId);
        const fnCachedValuesPositions = this._getFnCachedValuesPositions(hookId);
        const functionPosition = this._getFnPosition(fnCachedValuesPositions, taskId);

        if (functionPosition < hookCachedValues.length) {
            fnCachedValuesPositions.set(taskId, functionPosition + 1);

            return hookCachedValues[functionPosition];
        }

        return null;
    }

    save(hookId, taskId, ctx) {
        if (!hookId || !taskId) {
            return null;
        }

        const hookCachedValues = this._getHookCachedValues(hookId);
        const fnCachedValuesPositions = this._getFnCachedValuesPositions(hookId);
        const functionPosition = this._getFnPosition(fnCachedValuesPositions, taskId);

        hookCachedValues.push({...ctx});
        fnCachedValuesPositions.set(taskId, functionPosition + 1);
    }
}

exports.hooksCache = new HooksCache();

// Subsequent tasks with same hook will use cached results
// ensuring all tasks are run with the same input pictures
exports.withHooksCache = function(taskCtx, cache, hook) {
    return async function() {
        const cachedValue = cache.load(hook.name, this.name);

        if (cachedValue) {
            Object.assign(taskCtx, cachedValue);
            return;
        }

        await hook.call(this);

        cache.save(hook.name, this.name, taskCtx);
    };
};
