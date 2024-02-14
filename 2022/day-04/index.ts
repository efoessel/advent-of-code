import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Intervals, Parse, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', parseBlocks(',', flow(
        parseBlocks('-', Parse.extractInt),
        ([f, t]) => Intervals.fromIntegersIncluded(f, t)
    ))),
);

const algo1 = flow(
    parse,
    Arrays.count(([a, b]) => Intervals.contains(a)(b) || Intervals.contains(b)(a)),
);

const algo2 = flow(
    parse,
    Arrays.count(([a, b]) => Intervals.intersects(a)(b)),
);

runStep(__dirname, 'step1', 'example', algo1, 2);
runStep(__dirname, 'step1', 'real', algo1, 305);
runStep(__dirname, 'step2', 'example', algo2, 4);
runStep(__dirname, 'step2', 'real', algo2, 811);
