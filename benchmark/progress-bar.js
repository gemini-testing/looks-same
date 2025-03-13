const cliProgress = require('cli-progress');

exports.createProgressBarFromBenchmark = benchmark => {
    const progressBar = new cliProgress.SingleBar({
        format: ' [{bar}] | {value} / {total} | {status}',
        stopOnComplete: true,
        forceRedraw: true,
        autopadding: true,
        clearOnComplete: true
    });

    const benchmarkTasksCount = benchmark.tasks.length + 1; // warmup;
    let doneTasksCount = 0;

    benchmark.addEventListener('warmup', () => {
        progressBar.start(benchmarkTasksCount, doneTasksCount, {status: 'Warming up the benchmark'});
    });

    benchmark.addEventListener('start', () => {
        doneTasksCount++;
    });

    benchmark.tasks.forEach(task => {
        task.addEventListener('start', evt => {
            progressBar.update(doneTasksCount, {status: evt.task.name});
        });

        task.addEventListener('complete', () => {
            doneTasksCount++;
        });
    });

    benchmark.addEventListener('error', () => progressBar.stop());
    benchmark.addEventListener('complete', () => progressBar.stop());
};
