import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, Strings, Vector, findPath } from '../../utils/@index';
import { Matrices } from '../../utils/grids';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(Strings.split('')),
    Matrices.map(Parse.extractInt)
);

const algo1 = flow(
    parse,
    m => {

        return findPath(
            [{state: [0, 0] as const, cost: 0}],
            [[Matrices.dim(m).rows - 1, Matrices.dim(m).cols - 1]] as const,
            (from) => pipe(from.state,
                Matrices.getNeighbors(m),
                Arrays.map((p) => ({state: p, cost: from.cost + m[p[0]][p[1]]})),
            ),
            Vector.toString
        )!.cost
    },
);



const algo2 = flow(
    parse,
    m => Arrays.range(0, 5).flatMap(rowIdx => m.map(row => 
        Arrays.range(0, 5).flatMap(colIdx => row.map(x => (x + rowIdx + colIdx - 1)%9 +1))
    )),
    m => {

        return findPath(
            [{state: [0, 0] as const, cost: 0}],
            [[Matrices.dim(m).rows - 1, Matrices.dim(m).cols - 1]] as const,
            (from) => pipe(from.state,
                Matrices.getNeighbors(m),
                Arrays.map((p) => ({state: p, cost: from.cost + m[p[0]][p[1]]})),
            ),
            Vector.toString
        )!.cost
    },
)

runStep(__dirname, 'step1', 'example', algo1, 40);
runStep(__dirname, 'step1', 'real', algo1, 393);
runStep(__dirname, 'step2', 'example', algo2, 315);
runStep(__dirname, 'step2', 'real', algo2, 2823);
