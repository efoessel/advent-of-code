import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', identity),
);

const inMemory = (s: string) => s.length;
const nbChar = (s: string) => {
    return s.substring(1, s.length - 1)
        .replaceAll('\\\\', 'a')
        .replaceAll('\\"', 'a')
        .replaceAll(/\\x../g, 'a')
        .length
}
const encodedLength = (s: string) => 2 + s.length + (s.match(/["\\]/g)?.length ?? 0);

const algo1 = flow(
    parse,
    Arrays.map((l) => inMemory(l) - nbChar(l)),
    Arrays.sum
);

const algo2 = flow(
    parse,
    Arrays.map((l) => encodedLength(l) - inMemory(l)),
    Arrays.sum
);

runStep(__dirname, 'step1', 'example', algo1, 12);
runStep(__dirname, 'step1', 'real', algo1, 1350);
runStep(__dirname, 'step2', 'example', algo2, 19);
runStep(__dirname, 'step2', 'real', algo2, 2085);
