import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, Parse } from '../../utils/@index';

const parse = flow(
    Parse.extractIntArray,
);

const algo1 = flow(
    parse,
    Objects.apply({
        pos: i => i,
        med: flow(Arrays.median, Math.round),
    }),
    ({pos, med}) => pipe(pos,
        Arrays.map(p => Math.abs(p - med)),
        Arrays.sum
    ),
);

const cost = (pos: number[], target: number) => pipe(pos,
    Arrays.map(p => Math.abs(p - target)),
    Arrays.map(d => d*(d+1)/2),
    Arrays.sum
)

const algo2 = flow(
    parse,
    Objects.apply({
        pos: i => i,
        left: flow(Arrays.avg, Math.floor),
        right: flow(Arrays.avg, Math.ceil),
    }),
    ({pos, left, right}) => Math.min(cost(pos, left), cost(pos, right)),
)

runStep(__dirname, 'step1', 'example', algo1, 37);
runStep(__dirname, 'step1', 'real', algo1, 352707);
runStep(__dirname, 'step2', 'example', algo2, 168);
runStep(__dirname, 'step2', 'real', algo2, 95519693);
