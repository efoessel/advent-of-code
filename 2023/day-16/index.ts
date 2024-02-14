import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, parseBlocks } from '../../utils/@index';
import { Matrices } from '../../utils/grids';

const parse = flow(
    parseBlocks('\n', parseBlocks('', c => ({
        cell: c as Cell['cell'],
        '<': false,
        '>': false,
        '^': false,
        'v': false,
    }))),
);

type Dir = '<'|'>'|'^'|'v';
type Cell = {cell: '.'|'\\'|'/'|'-'|'|'} & Record<Dir, boolean>;
type Grid = Cell[][];

function moveRay(grid: Grid, dir: Dir, x: number, y: number): void {
    const cell = grid[y]?.[x];
    if(cell === undefined || cell[dir]) {
        return;
    }
    cell[dir] = true;
    const combo: `${Dir}${Cell['cell']}` = `${dir}${cell.cell}`;


    function next(dir: Dir) {
        switch(dir) {
            case '<': return moveRay(grid, dir, x-1, y);
            case '>': return moveRay(grid, dir, x+1, y);
            case '^': return moveRay(grid, dir, x, y-1);
            case 'v': return moveRay(grid, dir, x, y+1);
        }
    }

    switch(combo) {
        case '<.': case '<-': return next('<');
        case '<\\': return next('^');
        case '</': return next('v');
        case '<|': return next('^'), next('v');
        case '>.': case '>-': return next('>');
        case '>\\': return next('v');
        case '>/': return next('^');
        case '>|': return next('v'), next('^');
        case '^.': case '^|': return next('^');
        case '^\\': return next('<');
        case '^/': return next('>');
        case '^-': return next('<'), next('>');
        case 'v.': case 'v|': return next('v');
        case 'v\\': return next('>');
        case 'v/': return next('<');
        case 'v-': return next('>'), next('<');
    }
}

const solve = (dir: Dir, x: number, y: number) => flow(
    (grid: Grid) => {
        moveRay(grid, dir, x, y);
        return grid;
    },
    Matrices.map(cell => cell['<'] || cell['>'] || cell['^'] || cell.v ? 1 : 0),
    Arrays.map(Arrays.sum),
    Arrays.sum
)

const algo1 = flow(
    parse,
    solve('>', 0, 0),
);

const copy = <T>(x: T) => JSON.parse(JSON.stringify(x)) as T

const algo2 = flow(
    parse,
    grid => [
        grid.flatMap((line, lineIdx) => [
            solve('>', 0, lineIdx),
            solve('<', line.length-1, lineIdx)
        ]),
        grid[0].flatMap((_, colIdx) => [
            solve('v', colIdx, 0),
            solve('^', colIdx, grid.length-1)
        ])
    ].flat().map(comp => comp(copy(grid))),
    Arrays.max
)

runStep(__dirname, 'step1', 'example', algo1, 46);
runStep(__dirname, 'step1', 'real', algo1, 6978);
runStep(__dirname, 'step2', 'example', algo2, 51);
runStep(__dirname, 'step2', 'real', algo2, 7315, true);
