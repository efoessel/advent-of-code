import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, Strings, isDefined } from '../../utils/@index';

const parse = flow(
    Strings.split('\n'),
);

const OPENING_DELIMITERS = '([{<';
const CLOSING: Record<string, string> = {
    '(': ')',
    '[':  ']',
    '{': '}',
    '<': '>',
};
const SYNTAX_ERROR_SCORE: Record<string, number> = {
    ')': 3,
    ']': 57,
    '}': 1197,
    '>': 25137,
};

const process = (str: string) => {
    const stack: string[] = [];
    const error = str.split('').find(
        (current) => {
            if(OPENING_DELIMITERS.includes(current)) {
                stack.push(CLOSING[current]);
                return false;
            } else if (stack.at(-1) === current) {
                stack.pop()
                return false;
            } else {
                return true;
            }
        }
    );
    return {stack, error};
}

const algo1 = flow(
    parse,
    Arrays.map(flow(
        process,
        Objects.pluck('error'),
        err => err ? SYNTAX_ERROR_SCORE[err] : 0
    )),
    Arrays.sum
);

const AUTO_CLOSE_SCORE: Record<string, number> = {
    ')': 1,
    ']': 2,
    '}': 3,
    '>': 4,
};

const algo2 = flow(
    parse,
    Arrays.map(process),
    Arrays.filter(({error}) => !isDefined(error)),
    Arrays.map(flow(
        Objects.pluck('stack'),
        Arrays.reverse,
        Arrays.reduce((score, char) => score * 5 + AUTO_CLOSE_SCORE[char], 0)
    )),
    Arrays.median
)

runStep(__dirname, 'step1', 'example', algo1, 26397);
runStep(__dirname, 'step1', 'real', algo1, 442131);
runStep(__dirname, 'step2', 'example', algo2, 288957);
runStep(__dirname, 'step2', 'real', algo2, 3646451424);
