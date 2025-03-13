const _ = require('lodash');
const {Bench, hrtimeNow} = require('tinybench');
const {truncateNumber} = require('./utils');
const {createProgressBarFromBenchmark} = require('./progress-bar');
const hooks = require('./tasks/hooks');
const looksSame = require('./tasks/looks-same');
const pixelmatch = require('./tasks/pixelmatch');
const resemble = require('./tasks/resemble');
const blinkDiff = require('./tasks/blink-diff');
const {PACKAGES, CASES} = require('./constants');

const packageNameToMkCompareFnMap = {
    [PACKAGES.LOOKS_SAME]: looksSame.mkCompare,
    [PACKAGES.PIXELMATCH]: pixelmatch.mkCompare,
    [PACKAGES.RESEMBLE_JS]: resemble.mkCompare,
    [PACKAGES.BLINK_DIFF]: blinkDiff.mkCompare
};

const mkTaskSet = (caseName, prepareFunc, taskCtx) => Object.keys(packageNameToMkCompareFnMap).map(packageName => ({
    package: packageName,
    case: caseName,
    func: packageNameToMkCompareFnMap[packageName](taskCtx),
    prepareFunc
}));

// Images are passed into tasks via shared taskCtx
const mkBenchmarkTasks = (taskCtx = {}) => [
    ...mkTaskSet(CASES.WEB_AVG_DIFF, hooks.mkWebAverageFailedPair(taskCtx), taskCtx),
    ...mkTaskSet(CASES.WEB_AVG_SUCCESS, hooks.mkWebAverageSuccessPair(taskCtx), taskCtx),
    ...mkTaskSet(CASES.EQUAL_IMAGES, hooks.mkEqualPair(taskCtx, {width: 1000, height: 1000}), taskCtx),
    ...mkTaskSet(CASES.ONE_PERCENT_VISIBLE_DIFF, hooks.mkFixedVisibleDiffPercentPair(taskCtx, {width: 1000, height: 1000, diff: 0.01}), taskCtx),
    ...mkTaskSet(CASES.TEN_PERCENTS_VISIBLE_DIFF, hooks.mkFixedVisibleDiffPercentPair(taskCtx, {width: 1000, height: 1000, diff: 0.10}), taskCtx),
    ...mkTaskSet(CASES.FULL_MAX_DIFF, hooks.mkFullDiffPair(taskCtx, {width: 1000, height: 1000}), taskCtx),
    ...mkTaskSet(CASES.DEMONSTRATIVE_EXAMPLE, hooks.mkDemonstrativeExamplePair(taskCtx), taskCtx)
];

async function main() {
    const bench = new Bench({now: hrtimeNow, time: 0, warmupTime: 0, iterations: 16, warmupIterations: 4});
    const benchmarkTasks = mkBenchmarkTasks();

    benchmarkTasks.forEach(task => bench.add(`${task.package} / ${task.case}`, task.func, {beforeEach: task.prepareFunc}));

    createProgressBarFromBenchmark(bench);

    await bench.run();

    const errorTasks = bench.tasks.filter(task => task.result.error);

    if (errorTasks.length) {
        errorTasks.forEach(({name, result}) => console.error('Task:', name, 'Error:', result.error));
    } else {
        const tasks = benchmarkTasks.map((task, idx) => ({case: task.case, package: task.package, idx}));
        const caseGroupedTasks = _.groupBy(tasks, task => task.case);

        for (const caseName in caseGroupedTasks) {
            console.info(`Case: ${caseName}`);

            console.table(caseGroupedTasks[caseName].map(({package: packageName, idx}) => ({
                'Package': packageName,
                'Avg (ms)': truncateNumber(bench.tasks[idx].result.latency.mean),
                'p50 (ms)': truncateNumber(bench.tasks[idx].result.latency.p50),
                'p99 (ms)': truncateNumber(bench.tasks[idx].result.latency.p99)
            })));

            console.info('\n');
        }
    }
}

main();
