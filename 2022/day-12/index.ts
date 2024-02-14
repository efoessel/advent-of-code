import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Matrices, Strings, Vector, findTargetDistBFS } from '../../utils/@index';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(Strings.split('')),
);

function getHeight(a: string): number {
    if(a==='S') return getHeight('a');
    if(a==='E') return getHeight('z');
    return a.charCodeAt(0);
}

const algo = (startSelector: (s: string) => boolean) => flow(
    parse,
    (grid) => findTargetDistBFS(
        Matrices.filterPoints(startSelector)(grid),
        (p) => Matrices.at(grid)(p) === 'E',
        ([fr, fc]) => pipe([fr, fc],
            Matrices.getNeighbors(grid),
            Arrays.filter(([r, c]) => getHeight(grid[r][c]) <= getHeight(grid[fr][fc])+1)
        ),
        Vector.toString
    )
);

const algo1 = algo(s => s === 'S');
const algo2 = algo(s => s === 'S' || s === 'a');

runStep(__dirname, 'step1', 'example', algo1, 31);
runStep(__dirname, 'step1', 'real', algo1, 352);
runStep(__dirname, 'step2', 'example', algo2, 29);
runStep(__dirname, 'step2', 'real', algo2, 345);
