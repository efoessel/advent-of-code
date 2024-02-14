import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, Strings, Vector, findReachableNodes } from '../../utils/@index';
import { Matrices, Matrix } from '../../utils/grids';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(Strings.split('')),
    Matrices.map(Parse.extractInt),
);

const algo1 = flow(
    parse,
    (m) => pipe(m,
        Matrices.filter((v, [r, c]) => Matrices.getNeighborValues(m)([r, c]).every(v2 => v2 > v)),
        Arrays.reduce((s, v) => s + v + 1, 0),
    ),
);

const getBasin = (m: Matrix<number>, pos: Vector) => {
    return findReachableNodes(
        [pos],
        (from) => Matrices.getNeighbors(m)(from).filter(([r, c]) => m[r][c] != 9),
        Vector.toString
    );
}

const algo2 = flow(
    parse,
    (m) => pipe(m,
        Matrices.filterPoints((v, [r, c]) => Matrices.getNeighborValues(m)([r, c]).every(v2 => v2 > v)),
        Arrays.map(p => getBasin(m, p)),
        Arrays.map(Arrays.length),
        Arrays.sortNumbers('DESC', identity),
        Arrays.slice(0, 3),
        Arrays.prod,
    ),
)

runStep(__dirname, 'step1', 'example', algo1, 15);
runStep(__dirname, 'step1', 'real', algo1, 594);
runStep(__dirname, 'step2', 'example', algo2, 1134);
runStep(__dirname, 'step2', 'real', algo2, 858494);
