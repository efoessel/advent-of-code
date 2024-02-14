import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, Strings } from '../../utils/@index';

const parse = flow(
    Strings.split('\n'),
);

const algo1 = flow(
    parse,
    Arrays.map(flow(
        identity
    ))
);

const algo2 = flow(
    parse,
)

runStep(__dirname, 'step1', 'example', algo1, 123);
runStep(__dirname, 'step1', 'real', algo1, 123);
// runStep(__dirname, 'step2', 'example', algo2, 123);
// runStep(__dirname, 'step2', 'real', algo2, 123);
