import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, Strings } from '../../utils/@index';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(Parse.extractInt),
);

const algo1 = flow(
    parse,
    Arrays.windowStrict(2),
    Arrays.count(([a, b]) => b > a)
);

const algo2 = flow(
    parse,
    Arrays.windowStrict(3),
    Arrays.map(Arrays.sum),
    Arrays.windowStrict(2),
    Arrays.count(([a, b]) => b > a)
)

runStep(__dirname, 'step1', 'example', algo1, 7);
runStep(__dirname, 'step1', 'real', algo1, 1564);
runStep(__dirname, 'step2', 'example', algo2, 5);
runStep(__dirname, 'step2', 'real', algo2, 1611);
