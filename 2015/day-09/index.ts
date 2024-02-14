import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, Stream, parseBlocks } from '../../utils/@index';

// Dublin to Belfast = 141
const parse = flow(
    parseBlocks('\n', flow(
        s => s.split(' '),
        ([a,,b,,dist]) => [a, b, parseInt(dist)] as const
    )),
    (rawEdges) => ({
        cities: Arrays.asSet(rawEdges.flatMap(([a, b]) => [a, b])),
        edges: Objects.fromEntries(rawEdges.map(([a, b, dist]) => [`${a}->${b}`, dist])),
    })
);

const calcPathCost = (edges: Record<string, number>) => flow(
    Arrays.windowStrict(2),
    Arrays.map(([a, b]) => edges[`${a}->${b}`] ?? edges[`${b}->${a}`]),
    Arrays.sum
);

const algo1 = flow(
    parse,
    ({cities, edges}) => Stream.fromPermutations(cities)
        .map(calcPathCost(edges))
        .reduce((min, curr) => Math.min(min, curr), Infinity)
);

const algo2 = flow(
    parse,
    ({cities, edges}) => Stream.fromPermutations(cities)
        .map(calcPathCost(edges))
        .max()
);

runStep(__dirname, 'step1', 'example', algo1, 605);
runStep(__dirname, 'step1', 'real', algo1, 117);
runStep(__dirname, 'step2', 'example', algo2, 982);
runStep(__dirname, 'step2', 'real', algo2, 909);
