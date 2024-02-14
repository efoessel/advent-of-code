import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, parseBlocks } from '../../utils/@index';

const parse = parseBlocks('\n', identity);

const algo1 = flow(
    parse,
    Arrays.map(flow(
        (str) => [...str.matchAll(/-?\d+/g)],
        Arrays.map(([x]) => parseInt(x)),
        Arrays.sum
    ))
)

const filterAndSum = (data: unknown): number => {
    if(Array.isArray(data)) {
        return pipe(data, Arrays.map(filterAndSum), Arrays.sum);
    } else if(typeof data === 'object' && data !== null) {
        const values = Object.values(data);
        if(values.includes('red')) return 0;
        return filterAndSum(values);
    } else if(typeof data === 'number') {
        return data;
    } else {
        return 0;
    }
}

const algo2 = flow(
    parse,
    Arrays.map(flow(
        x => JSON.parse(x),
        filterAndSum
    ))
)

runStep(__dirname, 'step1', 'example', algo1, [6, 6, 3, 3, 0, 0, 0, 0, 6, 15, 6]);
runStep(__dirname, 'step1', 'real', algo1, [111754]);
runStep(__dirname, 'step2', 'example', algo2, [6, 6, 3, 3, 0, 0, 0, 0, 4, 0, 6]);
runStep(__dirname, 'step2', 'real', algo2, [65402]);
