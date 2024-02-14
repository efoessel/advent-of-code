import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Matrices, Matrix, Stream, Strings } from '../../utils/@index';


const parse = flow(
    Strings.split('\n'),
    Arrays.map(flow(
        Strings.split(''),
        Arrays.map(x => x === '#')
    )),
);

const conwayStep = (grid: Matrix<boolean>) => {
    return pipe(grid, Matrices.map((alive, point) => {
        const aliveNeighbors = Matrices.getNeighborWithDiagsValues(grid)(point).filter(identity).length;
        return aliveNeighbors === 3 || (alive && aliveNeighbors === 2);
    }))
}

const forceCorners = (grid: Matrix<boolean>) => pipe(grid,
    Matrices.map((v, [x, y]) => {
        const sidex = x === 0 || x === Matrices.nbRows(grid)-1;
        const sidey = y === 0 || y === Matrices.nbCols(grid)-1;
        return v || (sidex && sidey);
    })
);

const algo1 = (steps: number) => flow(
    parse,
    start => Stream.fromRange(0, steps).reduce(conwayStep, start),
    Matrices.filter(identity),
    Arrays.length
)

const algo2 = (steps: number) => flow(
    parse, forceCorners,
    start => Stream.fromRange(0, steps).reduce(flow(conwayStep, forceCorners), start),
    Matrices.filter(identity),
    Arrays.length
)

runStep(__dirname, 'step1', 'example', algo1(2), 8);
runStep(__dirname, 'step1', 'example', algo1(4), 4);
runStep(__dirname, 'step1', 'real', algo1(100), 1061);
runStep(__dirname, 'step2', 'example', algo2(5), 17);
runStep(__dirname, 'step2', 'real', algo2(100), 1006);
