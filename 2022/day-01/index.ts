import { flow, identity } from 'fp-ts/function';
import { runStep } from '../../utils/run';
import { Arrays, basicParseInt, parseBlocks } from '../../utils/@index';

const parse = parseBlocks('\n\n', parseBlocks('\n', basicParseInt));

const algo1 = flow(
    parse,
    Arrays.map(Arrays.sum),
    Arrays.sortNumbers('DESC', identity),
    Arrays.at(0)
)

const algo2 = flow(
    parse,
    Arrays.map(Arrays.sum),
    Arrays.sortNumbers('DESC', identity),
    Arrays.slice(0, 3),
    Arrays.sum
)

runStep(__dirname, 'step1', 'example', algo1, 24000);
runStep(__dirname, 'step1', 'real', algo1, 68802);
runStep(__dirname, 'step2', 'example', algo2, 45000);
runStep(__dirname, 'step2', 'real', algo2, 205370);
