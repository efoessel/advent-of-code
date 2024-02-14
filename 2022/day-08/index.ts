import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, DIRECTIONS, Matrices, Strings, basicParseInt } from '../../utils/@index';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(Strings.split('')),
    Matrices.map(basicParseInt),
);

const algo1 = flow(
    parse,
    grid => pipe(grid,
        Matrices.filter((val, p) => pipe(DIRECTIONS,
            Arrays.some(d => Matrices.getValuesInDirection(grid)(p, d).every(t => t < val)),
        )),
    ),
    Arrays.length
);

function score(tree: number, direction: number[]) {
    const tmp = direction.findIndex(t => t>=tree);
    if(tmp === -1) return direction.length;
    else return tmp+1;
}

const algo2 = flow(
    parse,
    grid => pipe(grid,
        Matrices.map((val, p) => pipe(DIRECTIONS,
            Arrays.map(d => Matrices.getValuesInDirection(grid)(p, d)),
            Arrays.map(line => score(val, line)),
            Arrays.prod
        )),
    ),
    Arrays.map(Arrays.max),
    Arrays.max
);


runStep(__dirname, 'step1', 'example', algo1, 21);
runStep(__dirname, 'step1', 'real', algo1, 1818);
runStep(__dirname, 'step2', 'example', algo2, 8);
runStep(__dirname, 'step2', 'real', algo2, 368368);
