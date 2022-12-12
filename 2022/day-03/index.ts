import { flow, identity } from 'fp-ts/function';
import { Arrays } from '../../utils/arrays';
import { parseBlocks } from '../../utils/parse';
import { assert } from '../../utils/run';
import { strings } from '../../utils/strings';


function getPriority(char: string) {
    if(/[a-z]/.test(char)) return char.charCodeAt(0) - 112 + 16
    else return char.charCodeAt(0) - 76 + 38;
}

const splitInHalves = (l: string) => ([l.substring(0, l.length / 2).split(''), l.substring(l.length / 2).split('')])

const algo1 = flow(
    parseBlocks('\n', splitInHalves),
    Arrays.map((halves) => Arrays.intersection(halves)[0]),
    Arrays.map(getPriority),
    Arrays.sum
)

const algo2 = flow(
    parseBlocks('\n', identity),
    Arrays.groupByAsArray((_, i) => Math.floor(i/3)),
    Arrays.map((bags) => strings.intersection(bags)[0]),
    Arrays.map(getPriority),
    Arrays.sum
)

assert(__dirname, algo1, algo2, [8139, 2668]);