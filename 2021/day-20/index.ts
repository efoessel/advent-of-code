import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Matrices, Objects, Strings, Vector } from '../../utils/@index';

const parse = flow(
    Strings.split('\n\n'),
    ([enhancer, image]) => ({
        enhancer: enhancer.split('').map(x => x === '#' ? 1 : 0),
        image: {
            pixels: pipe(image,
                Strings.split('\n'), Arrays.map(Strings.split('')),
                Matrices.map(c => c === '#' ? 1 : 0),
            ),
            backgroundValue: 0,
        }
    })
);

type Image = ReturnType<typeof parse>['image'];

const enhance = (enhanced: (0|1)[]) => ({pixels, backgroundValue}: Image) => {
    const mask = [-1, 0, 1].flatMap(r => [-1, 0, 1].map(c => [r-1, c-1] as const)); //-1 to take into account the shift between old & new map
    const coeffs = Arrays.rangeI(8, 0).map(x => 2**x);

    const newImage = pipe(
        Matrices.zeros(Matrices.nbRows(pixels)+2, Matrices.nbCols(pixels)+2),
        Matrices.map((_, p) => pipe(p,
            (p) => mask.map(m => Vector.add(p, m)),
            Arrays.map(([r, c]) => pixels[r]?.[c] ?? backgroundValue),
            vals => Vector.dotProd(coeffs, vals),
            v => enhanced[v]
        ))
    );
    return {
        pixels: newImage,
        backgroundValue: enhanced[backgroundValue === 0 ? 0 : 511],
    }
}

const algo = (steps: number) => flow(
    parse,
    ({enhancer, image}) => Arrays.range(0, steps).reduce(enhance(enhancer), image),
    Objects.pluck('pixels'),
    Matrices.count(v => v === 1)
);

const algo1 = algo(2);
const algo2 = algo(50);

runStep(__dirname, 'step1', 'example', algo1, 35);
runStep(__dirname, 'step1', 'real', algo1, 5291);
runStep(__dirname, 'step2', 'example', algo2, 3351);
runStep(__dirname, 'step2', 'real', algo2, 16665);
