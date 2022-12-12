import { flow, identity, pipe } from 'fp-ts/function'
import { run } from '../../utils/run';
import { basicParseInt, castTo, parseBlocks } from '../../utils/parse';
import { Arrays } from '../../utils/arrays';
import { Objects } from '../../utils/objects';
import { Grid } from '../../utils/grid';
import { findPath } from '../../utils/path-finder';
import { number } from 'fp-ts';

const parse = flow(
    parseBlocks('\n', parseBlocks(',', basicParseInt)),
);

type S = {
    x: number,
    y: number,
    p?: S,
}

const tap = <T>(fn: (val: T) => void) => (val: T) => {
    fn(val);
    return val;
} 

const algo81 = flow(
    parse,
    (grid) => new Grid(grid, false),
    (grid) => findPath<S>(
        [{state: {x: 0, y: 0}, cost: grid.get({x: 0, y: 0})}],
        [{x: grid.width-1, y: grid.height-1}],
        ({state, cost}) => grid.getNeighbors(state, 'down', 'right').map(s => ({
            state: {x: s.x, y: s.y, p: state},
            cost: cost + s.value,
        })),
        (s) => `${s.x},${s.y}`, 
    )!,
    ({cost, state}) => ({
        cost, path: Objects.exploreDeep<S>(s => s.p)(state).reverse().map(s => ({x: s.x, y: s.y}))
    })
);

const algo82 = flow(
    parse,
    (grid) => new Grid(grid, false),
    (grid) => findPath<S>(
        Arrays.range(0, grid.height).map((_, i) => grid.getCell(0, i)).map(cell => ({
            state: {
                x: cell.x,
                y: cell.y
            },
            cost: cell.value,
        })),
        Arrays.range(0, grid.height).map((_, i) => grid.getCell(grid.width-1, i)),
        ({state, cost}) => grid.getNeighbors(state, 'up', 'right').map(s => ({
            state: {x: s.x, y: s.y, p: state},
            cost: cost + s.value,
        })),
        (s) => `${s.x},${s.y}`, 
    )!,
    ({cost, state}) => ({
        cost, path: Objects.exploreDeep<S>(s => s.p)(state).reverse().map(s => ({x: s.x, y: s.y}))
    })
);


const algo83 = flow(
    parse,
    (grid) => new Grid(grid, false),
    (grid) => findPath<S>(
        [{state: {x: 0, y: 0}, cost: grid.get({x: 0, y: 0})}],
        [{x: grid.width-1, y: grid.height-1}],
        ({state, cost}) => grid.getNeighbors(state).map(s => ({
            state: {x: s.x, y: s.y, p: state},
            cost: cost + s.value,
        })),
        (s) => `${s.x},${s.y}`, 
    )!,
    ({cost, state}) => ({
        cost, path: Objects.exploreDeep<S>(s => s.p)(state).reverse().map(s => ({x: s.x, y: s.y}))
    })
);


run(__dirname, algo81, algo82, algo83);
