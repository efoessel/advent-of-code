import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Vector, castTo, parseBlocks } from '../../utils/@index';

type M = '<'|'>'|'^'|'v';
const moves = {
    '<': [-1,0],
    '>': [1,0],
    '^': [0,-1],
    'v': [0,1],
}

const parse = flow(
    parseBlocks('\n', parseBlocks('', castTo<M>)),
);

const run = Arrays.reduceAndRemember(
    (pos, m: M) => Vector.add(pos, moves[m]),
    [0, 0] as Vector
)

const algo1 = flow(
    parse,
    Arrays.map(flow(
        run,
        Arrays.asSetUsing(Vector.toString),
        Arrays.length
    )),
);

const algo2 = flow(
    parse,
    Arrays.map(flow(
        Arrays.partition((_, i) => i%2 === 0),
        Arrays.map(run),
        Arrays.unionUsing(Vector.toString),
        Arrays.length
    )),
);

runStep(__dirname, 'step1', 'example', algo1, [2, 4, 2]);
runStep(__dirname, 'step1', 'real', algo1, [2081]);
runStep(__dirname, 'step2', 'example', algo2, [3, 3, 11]);
runStep(__dirname, 'step2', 'real', algo2, [2341]);
