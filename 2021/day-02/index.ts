import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Strings, Objects } from '../../utils/@index';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(flow(
        Strings.split(' '),
        ([dir, cnt]) => ({dir, cnt: parseInt(cnt)}),
    ))
);

const algo1 = flow(
    parse,
    Arrays.groupByAsObject(({dir}) => dir),
    Objects.map(flow(
        Arrays.map(Objects.pluck('cnt')),
        Arrays.sum
    )),
    ({forward, down, up}) => forward * (down - up)
);

const algo2 = flow(
    parse,
    Arrays.reduce(({pos, d, aim}, {dir, cnt}) => {
        switch(dir) {
            case 'down': return {pos, d, aim: aim + cnt};
            case 'up': return {pos, d, aim: aim - cnt};
            default: return {pos: pos + cnt, d: d + aim * cnt, aim};
        }
    }, {pos: 0, d: 0, aim: 0}),
    ({pos, d}) => pos * d
)

runStep(__dirname, 'step1', 'example', algo1, 150);
runStep(__dirname, 'step1', 'real', algo1, 1692075);
runStep(__dirname, 'step2', 'example', algo2, 900);
runStep(__dirname, 'step2', 'real', algo2, 1749524700);
