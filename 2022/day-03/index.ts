import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Strings, parseBlocks } from '../../utils/@index';


function getPriority(char: string) {
    if(/[a-z]/.test(char)) return char.charCodeAt(0) - 112 + 16
    else return char.charCodeAt(0) - 76 + 38;
}

const algo1 = flow(
    parseBlocks('\n', identity),
    Arrays.map(flow(
        Strings.splitIn(2),
        Strings.intersection,
        Arrays.atUnsafe(0),
        getPriority
    )),
    Arrays.sum
);

const algo2 = flow(
    parseBlocks('\n', identity),
    Arrays.groupByAsArray((_, i) => Math.floor(i/3)),
    Arrays.map(flow(
        Strings.intersection,
        Arrays.atUnsafe(0),
        getPriority
    )),
    Arrays.sum
);

runStep(__dirname, 'step1', 'example', algo1, 157);
runStep(__dirname, 'step1', 'real', algo1, 8139);
runStep(__dirname, 'step2', 'example', algo2, 70);
runStep(__dirname, 'step2', 'real', algo2, 2668);
