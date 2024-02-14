import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, castTo, parseBlocks } from '../../utils/@index';

type P = '('|')';

const parse = flow(
    parseBlocks('', castTo<P>),
);

const algo1 = flow(
    parse,
    Arrays.reduce((lvl, s) => s === '(' ? lvl+1 : lvl-1, 0),
);

const algo2 = flow(
    parse,
    Arrays.reduceUntil(
        ([lvl]) => lvl === -1,
        ([lvl], s, i) => ([s === '(' ? lvl+1 : lvl-1, i]),
        [0, -1],
    ),
    ([, res]) => res+1
);

runStep(__dirname, 'step1', 'example', algo1, -1);
runStep(__dirname, 'step1', 'real', algo1, 232);
runStep(__dirname, 'step2', 'example', algo2, 5);
runStep(__dirname, 'step2', 'real', algo2, 1783);
