import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', identity),
);

const algo1 = flow(
    parse,
    Arrays.filter(str => str.match(/(.)\1/) !== null),
    Arrays.filter(str => str.split('').filter(c => 'aeiou'.includes(c)).length >= 3),
    Arrays.filter(str => str.match(/ab|cd|pq|xy/) === null),
    Arrays.length
);

const algo2 = flow(
    parse,
    Arrays.filter(str => str.match(/(.)(.).*\1\2/) !== null),
    Arrays.filter(str => str.match(/(.).\1/) !== null),
    Arrays.length
);

runStep(__dirname, 'step1', 'example', algo1, 1);
runStep(__dirname, 'step1', 'real', algo1, 258);
runStep(__dirname, 'step2', 'example', algo2, 2);
runStep(__dirname, 'step2', 'real', algo2, 53);
