import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, parseBlocks } from '../../utils/@index';

const algo1 = flow(
    parseBlocks('\n', identity),
    Arrays.map(flow(
        line => line.split('').filter(char => '1234567890'.includes(char)),
        digits => digits[0] + digits[digits.length - 1],
        num => parseInt(num),
    )),
    Arrays.sum
);

const numbers = {
    'one': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
    'six': 6,
    'seven': 7,
    'eight': 8,
    'nine': 9,
    'zero': 0,
}
const parseNumber = (s: string) => {
    if(/^\d/.test(s)) {
        return parseInt(s[0])
    } else {
        return Objects.entries(numbers).find(([k]) => s.startsWith(k))?.[1];
    }
}

const algo2 = flow(
    parseBlocks('\n', identity),
    Arrays.map(flow(
        line => Arrays.range(0, line.length).map(i => line.substring(i)),
        Arrays.map(parseNumber),
        Arrays.filterNullable,
        digits => digits[0]*10 + digits[digits.length - 1],
    )),
    Arrays.sum
)

runStep(__dirname, 'step1', 'example1', algo1, 142);
runStep(__dirname, 'step1', 'real', algo1, 57346);
runStep(__dirname, 'step1', 'example2', algo2, 281);
runStep(__dirname, 'step1', 'real', algo2, 57345);
