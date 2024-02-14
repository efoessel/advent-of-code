import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, Vector, findReachableNodes, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', Parse.extractIntArray),
);

const getNeighbors = (p: Vector) => [
    [0,0,1],
    [0,0,-1],
    [0,1,0],
    [0,-1,0],
    [1,0,0],
    [-1, 0,0],
].map(d => Vector.add(p, d))

const algo1 = flow(
    parse,
    (blocks) => {
        const lava = new Set<string>(blocks.map(b => b.toString()));
        return blocks.map(block => getNeighbors(block).filter(n => !lava.has(n.toString())).length);
    },
    Arrays.sum
);

const algo2 = flow(
    parse,
    (blocks) => {
        const lava = new Set<string>(blocks.map(b => b.toString()));
        const minArea = blocks.reduce((min, b) => min.map((m,i) => Math.min(m, b[i])));
        const maxArea = blocks.reduce((max, b) => max.map((m,i) => Math.max(m, b[i])));
        const startPoint = Vector.add(minArea, [-1, -1, -1]);

        const reachables = findReachableNodes(
            [startPoint],
            (curr) => getNeighbors(curr).filter(n => !lava.has(n.toString())
                && n.every((ni, i) => ni >= minArea[i]-1
                && ni <= maxArea[i]+1)),
            (s) => s.toString()
        );
        const reachablesAsSet = new Set(reachables.map(r => r.toString()));

        return pipe(blocks,
            Arrays.map((block) => getNeighbors(block).filter(n => reachablesAsSet.has(n.toString())).length),
            Arrays.sum
        )
    },
);

runStep(__dirname, 'step1', 'example', algo1, 64);
runStep(__dirname, 'step1', 'real', algo1, 3432);
runStep(__dirname, 'step2', 'example', algo2, 58);
runStep(__dirname, 'step2', 'real', algo2, 2042);
