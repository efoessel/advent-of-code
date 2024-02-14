import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, Parse, Strings, Vector } from '../../utils/@index';
import { Matrices } from '../../utils/grids';

const parse = flow(
    Strings.split('\n\n'),
    Arrays.map(Strings.split('\n')),
    ([points, folds]) => ({
        points: pipe(points, Arrays.map(Parse.extractIntArray)),
        folds: pipe(folds, Arrays.map(Objects.apply({
            dir: f => /(\w)=\d/.exec(f)![1] as 'x'|'y',
            val: Parse.extractInt
        })))
    }),
);

const fold = (points: Vector[], {dir, val}: {dir: 'x'|'y', val: number}) => pipe(points,
    Arrays.map(([x, y]) => [
        dir === 'y' || val > x ? x : 2*val - x,
        dir === 'x' || val > y ? y : 2*val - y,
    ]),
    Arrays.asSetUsing(Vector.toString)
)

const algo1 = flow(
    parse,
    ({points, folds}) => fold(points, folds[0]).length
);

const toLetters = (points: Vector[]) => {
    const dimX = pipe(points, Arrays.map(Arrays.atUnsafe(0)), Arrays.max);
    const dimY = pipe(points, Arrays.map(Arrays.atUnsafe(1)), Arrays.max);
    const pset = new Set(points.map(Vector.toString));
    return '\n' + pipe(
        Arrays.rangeI(0, dimY),
        Arrays.map(() => Arrays.rangeI(0, dimX)),
        Matrices.map((_, [r, c]) => pset.has([c, r].toString()) ? '█' : ' '),
        Arrays.map(Arrays.join('')),
        Arrays.join('\n')
    );
}

const algo2 = flow(
    parse,
    ({points, folds}) => folds.reduce(fold, points),
    toLetters
)

runStep(__dirname, 'step1', 'example', algo1, 17);
runStep(__dirname, 'step1', 'real', algo1, 781);
runStep(__dirname, 'step2', 'example', algo2, `
█████
█   █
█   █
█   █
█████`);
runStep(__dirname, 'step2', 'real', algo2, `
███  ████ ███   ██   ██    ██ ███  ███ 
█  █ █    █  █ █  █ █  █    █ █  █ █  █
█  █ ███  █  █ █    █       █ █  █ ███ 
███  █    ███  █    █ ██    █ ███  █  █
█    █    █ █  █  █ █  █ █  █ █    █  █
█    ████ █  █  ██   ███  ██  █    ███ `);
