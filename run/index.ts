import { createAndRun, runAll, skipLong } from '../utils/run';

require('util').inspect.defaultOptions.depth = 10;

async function runEverything() {
    // skipLong();
    await runAll([
        '@/2015',
        '@/2021',
        '@/2022',
        '@/2023'
    ]);
}


runEverything();
// createAndRun('@/2021/day-25');
