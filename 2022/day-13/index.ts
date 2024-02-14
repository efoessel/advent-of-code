import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, parseBlocks } from '../../utils/@index';

type Packet = number | (number|Packet)[];

const parse = flow(
    parseBlocks('\n\n', parseBlocks('\n', (line) => JSON.parse(line) as Packet)),
);

function compare(a?: Packet, b?: Packet): number {
    if(a === undefined) {
        return -1;
    } else if (b === undefined) {
        return 1;
    } else if(typeof a === 'number') {
        if(typeof b === 'number') {
            return a === b ? 0 : a < b ? -1 : 1;
        } else {
            return compare([a], b);
        }
    } else {
        if(typeof b === 'number') {
            return compare(a, [b]);
        } else {
            for(let i = 0 ; i < Math.max(a.length, b.length) ; i++) {
                const tmp = compare(a[i], b[i]);
                if(tmp !== 0) return tmp;
            }
            return 0;
        }
    }
}

const algo1 = flow(
    parse,
    Arrays.map(([a, b], i) => compare(a, b)<=0 ? i+1 : 0),
    Arrays.sum
);

const START_DIV = [[2]];
const END_DIV = [[6]];
const algo2 = flow(
    parse,
    Arrays.flatMap(identity),
    (arr) => [...arr, START_DIV, END_DIV],
    (arr) => [...arr].sort(compare),
    (arr) => (arr.indexOf(START_DIV)+1)*(arr.indexOf(END_DIV)+1),
);

runStep(__dirname, 'step1', 'example', algo1, 13);
runStep(__dirname, 'step1', 'real', algo1, 5905);
runStep(__dirname, 'step2', 'example', algo2, 140);
runStep(__dirname, 'step2', 'real', algo2, 21691);
