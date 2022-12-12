import { flow, identity } from 'fp-ts/function'
import { assert } from '../../utils/run';
import { parseBlocks } from '../../utils/parse';
import { Arrays } from '../../utils/arrays';
import { Vector } from '../../utils/vectors';

type Dir = 'R'|'L'|'U'|'D';

const parse = flow(
    parseBlocks('\n', (line) => {
        const tmp = line.split(' ');
        return Arrays.range(0, parseInt(tmp[1])).map(() => tmp[0] as Dir)
    }),
    Arrays.flatMap(identity),
);

const buildInitialState = (length: number) => ({
    rope: Arrays.range(0, length).map(() => Vector.zero(2)),
    visited: [] as Vector[],
});

const dirToVector = {
    'D': [0, -1],
    'U': [0, 1],
    'R': [1, 0],
    'L': [-1, 0],
}

const moveHead = (head: Vector, dir: Dir) => Vector.add(head, dirToVector[dir]);

const moveTail = (prev: Vector, curr: Vector) => {
    const diff = Vector.sub(prev, curr);
    return Vector.normInf(diff) > 1
        ? Vector.add(curr, Vector.sign(diff))
        : curr;
}

const updateRope = (dir: Dir) => (rope: Vector[], curr: Vector, i: number) => 
    ([...rope, i === 0 ? moveHead(curr, dir) : moveTail(rope[i-1], curr)]);

const algo = (length: number) => flow(
    parse,
    Arrays.reduce(({rope, visited}, dir) => {
        const newRope = rope.reduce(updateRope(dir), []);
        const tail = newRope[length - 1];
        return {
            rope: newRope,
            visited: [...visited, tail]
        };
    }, buildInitialState(length)),
    ({visited}) => {
        return new Set(visited.map(Vector.toString)).size;
    }
);

assert(__dirname, algo(2), algo(10), [6018, 2619]);
