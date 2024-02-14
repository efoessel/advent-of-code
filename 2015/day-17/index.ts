import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, Stream, parseBlocks } from '../../utils/@index';


const parse = parseBlocks('\n', Parse.extractInt);


const algo1 = (total: number) => flow(
    parse,
    values => Stream.fromSubsets(values)
        .map(Arrays.sum)
        .filter(x => x === total)
        .size()
)

const algo2 = (total: number) => flow(
    parse,
    values => Stream.fromSubsets(values)
        .filter(set => Arrays.sum(set) === total)
        .map(Arrays.length)
        .reduce(({min, cnt}, current) => {
            if(current < min) return {min: current, cnt: 1};
            if(current === min) return {min, cnt: cnt+1};
            return {min, cnt};
        }, {min: Infinity, cnt: 0}).cnt
)

runStep(__dirname, 'step1', 'example', algo1(25), 4);
runStep(__dirname, 'step1', 'real', algo1(150), 1304);
runStep(__dirname, 'step2', 'example', algo2(25), 3);
runStep(__dirname, 'step2', 'real', algo2(150), 18);
