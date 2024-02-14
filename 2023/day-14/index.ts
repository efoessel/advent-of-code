import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, parseBlocks, runWithPeriodSkipper } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', (line => line.split(''))),
);


const tiltLine = (line: string[], pull: boolean) => line.join('').split('#')
    .map(chunk => {
        const cntO = chunk.split('O').length - 1;
        return pull
            ? 'O'.repeat(cntO).padEnd(chunk.length, '.')
            : 'O'.repeat(cntO).padStart(chunk.length, '.')
    }).join('#').split('');

const transpose = (grid: string[][]) => pipe(
    Arrays.range(0, grid[0].length),
    Arrays.map(i => Arrays.range(0, grid.length).map(j => grid[j][i])),
);


const tiltGrid = (dir: 'N'|'W'|'S'|'E') => (grid: string[][]) => {
    if(dir === 'N' || dir ==='S') {
        const tgrid = transpose(grid);
        const tiltedTGrid = tgrid.map(col => tiltLine(col, dir === 'N'));
        return transpose(tiltedTGrid);
    } else {
        return grid.map(row => tiltLine(row, dir === 'W'));
    }
}

const computeLoad = flow(
    Arrays.map((line: string[]) => line.filter(x => x === 'O').length),
    x => x.reverse().map((y, i) => y*(i+1)),
    Arrays.sum
)

const algo1 = flow(
    parse,
    tiltGrid('N'),
    computeLoad
);

const toString = (grid: string[][]) => grid.map(x => x.join('')).join('\n');

const cycle = flow(
    tiltGrid('N'),
    tiltGrid('W'),
    tiltGrid('S'),
    tiltGrid('E'),
)

const algo2 = flow(
    parse,
    a => runWithPeriodSkipper(cycle, toString, 1000000000, a),
    computeLoad
)

runStep(__dirname, 'step1', 'example', algo1, 136);
runStep(__dirname, 'step1', 'real', algo1, 113078);
runStep(__dirname, 'step2', 'example', algo2, 64);
runStep(__dirname, 'step2', 'real', algo2, 94255);
