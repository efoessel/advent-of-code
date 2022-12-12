import { flow, identity } from 'fp-ts/function'
import { assert } from '../../utils/run';
import { parseBlocks } from '../../utils/parse';
import { Grid } from '../../utils/grid';
import { findPath } from '../../utils/path-finder'

const parse = flow(
    parseBlocks('\n', parseBlocks('', identity)),
    (grid) => new Grid(grid, false)
);

function getHeight(a: string): number {
    if(a==='S') return getHeight('a');
    if(a==='E') return getHeight('z');
    return a.charCodeAt(0);
}

const algo = (startSelector: (s: string) => boolean) => flow(
    parse,
    (grid) => findPath(
        grid.filter(startSelector).map(s => ({state: s, cost: 0})),
        grid.filter(v => v === 'E'),
        (from) => grid.getNeighbors(from.state)
            .filter(v => getHeight(v.value) <= getHeight(from.state.value)+1)
            .map(v => ({
                state: v,
                cost: from.cost + 1,
            })),
        (s) => `${s.x},${s.y}`
    ),
    (result) => result?.cost
);

assert(__dirname, algo(s => s === 'S'), algo(s => s === 'S' || s === 'a'), [352, 345]);
