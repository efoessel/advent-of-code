import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { findPath, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', line => line.split('').map(c => parseInt(c))),
);


type Dir = '<'|'>'|'^'|'v';
type State = {
    x: number, y: number,
    dir: Dir, straightLength: number,
}

const straigth = (x: number, y: number, dir: Dir) => {
    switch(dir) {
        case '<': return {x: x-1, y, dir};
        case '>': return {x: x+1, y, dir};
        case '^': return {x, y: y-1, dir};
        case 'v': return {x, y: y+1, dir};
    }
}

const left = (x: number, y: number, dir: Dir) => {
    switch(dir) {
        case '<': return straigth(x, y, 'v');
        case '>': return straigth(x, y, '^');
        case '^': return straigth(x, y, '<');
        case 'v': return straigth(x, y, '>');
    }
}

const right = (x: number, y: number, dir: Dir) => {
    switch(dir) {
        case '<': return straigth(x, y, '^');
        case '>': return straigth(x, y, 'v');
        case '^': return straigth(x, y, '>');
        case 'v': return straigth(x, y, '<');
    }
}

const isDefined = <T>(x: T): x is NonNullable<T> => x !== undefined && x!== null;

const isTarget1 = (grid: number[][]) => (s: State) => s.x === grid[0].length-1 && s.y === grid.length-1;
const getNextCandidates1 = ({x, y, dir, straightLength}: State) => [
    left(x, y, dir),
    right(x, y, dir),
    straightLength < 3 ? straigth(x, y, dir) : undefined
];


const algo = (getNextCandidates: typeof getNextCandidates1, isTarget: typeof isTarget1) => flow(
    parse,
    grid => findPath<State>(
        [{state: {x: 0, y: 0, dir: '>', straightLength: 0}, cost:0}, {state: {x: 0, y: 0, dir: 'v', straightLength: 0}, cost:0}],
        isTarget(grid),
        ({cost, state:{x, y, dir, straightLength}}) => {
            return getNextCandidates({x, y, dir, straightLength})
            .filter(isDefined)
            .filter(n => grid[n.y]?.[n.x])
            .map((n) => ({
                state: {
                    ...n,
                    straightLength: n?.dir === dir ? straightLength + 1 : 1,
                },
                cost: cost + grid[n.y][n.x]
            }))
        },
        (state) => JSON.stringify(state)
    )?.cost,
);

const isTarget2 = (grid: number[][]) => (s: State) => s.x === grid[0].length-1 && s.y === grid.length-1 && s.straightLength > 3;
const getNextCandidates2 = ({x, y, dir, straightLength}: State) => [
    straightLength > 3 ? left(x, y, dir) : undefined,
    straightLength > 3 ? right(x, y, dir) : undefined,
    straightLength < 10 ? straigth(x, y, dir) : undefined
];

const algo1 = algo(getNextCandidates1, isTarget1);
const algo2 = algo(getNextCandidates2, isTarget2);

runStep(__dirname, 'step1', 'example', algo1, 102);
runStep(__dirname, 'step1', 'real', algo1, 698);
runStep(__dirname, 'step2', 'example', algo2, 94);
runStep(__dirname, 'step2', 'example2', algo2, 71);
runStep(__dirname, 'step2', 'real', algo2, 825, true);
