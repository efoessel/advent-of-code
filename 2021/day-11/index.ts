import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, Parse, Strings, Vector, Stream } from '../../utils/@index';
import { Matrices, Matrix } from '../../utils/grids';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(Strings.split('')),
    Matrices.map(Parse.extractInt),
);

const update = (octopuses: Matrix<number>) => {
    let flashCounter = 0;
    const alreadyFlashed = new Set<string>();
    let justFlashed: Vector[] = [];

    octopuses = pipe(octopuses, Matrices.map(x => x+1));
    
    do {
        justFlashed = pipe(octopuses, Matrices.filterPoints((x, p) => x>9 && !alreadyFlashed.has(p.toString())));
        justFlashed.forEach(p => alreadyFlashed.add(p.toString()));
        octopuses = pipe(octopuses, Matrices.map((x, p) => x + Matrices.getNeighborsWithDiags(octopuses)(p).filter(p => justFlashed.some(Vector.eq(p))).length));
        flashCounter += justFlashed.length;
    } while(justFlashed.length);

    return {
        octopuses: pipe(octopuses, Matrices.map(x => x >= 10 ? 0 : x)),
        flashes: flashCounter
    };
}

const algo1 = flow(
    parse,
    octopuses => Stream.fromRange(0, 100).reduce(
        ({octopuses, flashes}) => {
            const res = update(octopuses);
            return {octopuses: res.octopuses, flashes: flashes + res.flashes};
        }, {octopuses, flashes: 0}
    ),
    Objects.pluck('flashes')
);

const algo2 = flow(
    parse,
    octopuses => Stream.loop().reduceUntil(
        ({octopuses, flashes}) => flashes === octopuses.length * octopuses[0].length,
        ({octopuses, i}) => {
            const res = update(octopuses);
            return {...res, i: i+1};
        }, {octopuses, flashes: 0, i: 0}
    )
    ,
    Objects.pluck('i')
)

runStep(__dirname, 'step1', 'example', algo1, 1656);
runStep(__dirname, 'step1', 'real', algo1, 1652);
runStep(__dirname, 'step2', 'example', algo2, 195);
runStep(__dirname, 'step2', 'real', algo2, 220);
