import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, Stream, Strings } from '../../utils/@index';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(Parse.extractIntArray)
);

function* line(x1: number, y1: number, x2: number, y2: number) {
    const dirX = Math.sign(x2 - x1);
    const dirY = Math.sign(y2 - y1);
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) + 1;

    for(let i = 0 ; i < steps ; i++) {
        yield [x1 + i*dirX, y1 + i*dirY];
    }
}

const algo1 = flow(
    parse,
    Stream.fromIterable,
    Stream.filter(([x1, y1, x2, y2]) => x1 === x2 || y1 === y2),
    Stream.flatMap(([x1, y1, x2, y2]) => line(x1, y1, x2, y2)),
    Stream.map(pt => pt.toString()),
    Stream.countElements,
    m => Array.from(m.values()),
    Arrays.count(n => n>1)
);

const algo2 = flow(
    parse,
    Stream.fromIterable,
    Stream.flatMap(([x1, y1, x2, y2]) => line(x1, y1, x2, y2)),
    Stream.map(pt => pt.toString()),
    Stream.countElements,
    m => Array.from(m.values()),
    Arrays.count(n => n>1)
)

runStep(__dirname, 'step1', 'example', algo1, 5);
runStep(__dirname, 'step1', 'real', algo1, 7438);
runStep(__dirname, 'step2', 'example', algo2, 12);
runStep(__dirname, 'step2', 'real', algo2, 21406);
