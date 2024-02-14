import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', Parse.extractIntArray),
);

const algo1 = flow(
    parse,
    Arrays.map(Arrays.sortNumbers('ASC', identity)),
    Arrays.map(sizes => Arrays.getPairs(sizes).map(([a, b]) => a*b)),
    Arrays.map(sides => Arrays.sum(sides)*2 + sides[0]),
    Arrays.sum
);

const algo2 = flow(
    parse,
    Arrays.map(Arrays.sortNumbers('ASC', identity)),
    Arrays.map(sizes => Arrays.prod(sizes) + 2*(sizes[0]+sizes[1])),
    Arrays.sum
);

runStep(__dirname, 'step1', 'example', algo1, 43+58);
runStep(__dirname, 'step1', 'real', algo1, 1588178);
runStep(__dirname, 'step2', 'example', algo2, 34+14);
runStep(__dirname, 'step2', 'real', algo2, 3783758);
