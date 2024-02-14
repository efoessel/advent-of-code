import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, Parse, Stream, parseBlocks } from '../../utils/@index';

const PARAMETERS = ['capacity' , 'durability' , 'flavor' , 'texture'] as const;

const parse = flow(
    parseBlocks('\n', flow(
        // Butterscotch: capacity -1, durability -2, flavor 6, texture 3, calories 8
        (l) => l.split(/: capacity |, durability |, flavor |, texture |, calories /),
        ([, capacity , durability , flavor , texture , calories]) => ({capacity , durability , flavor , texture , calories}),
        Objects.map(Parse.extractInt)
    )),
);

function* generateMixes(ingredientsCount: number, volume: number): Generator<number[], void, void> {
    if(ingredientsCount <= 1) {
        yield [volume];
    } else {
        for(let i = 0 ; i <= volume ; i++) {
            for(const submix of generateMixes(ingredientsCount-1, volume-i)) {
                yield [i, ...submix];
            }
        }
    }
}

const algo = (expectedCalories: number) => flow(
    parse,
    (ingredients) => new Stream(generateMixes(ingredients.length, 100))
        .filter((mix) => isNaN(expectedCalories) || mix.reduce((acc, curr, i) => acc + curr*ingredients[i].calories, 0) === expectedCalories)
        .map((mix) => PARAMETERS.map(p => mix.reduce((acc, curr, i) => acc + curr*ingredients[i][p], 0)))
        .map(Arrays.reduce((prod, curr) => prod * Math.max(curr, 0), 1))
        .max()
)

runStep(__dirname, 'step1', 'example', algo(NaN), 62842880);
runStep(__dirname, 'step1', 'real', algo(NaN), 21367368);
runStep(__dirname, 'step2', 'example', algo(500), 57600000);
runStep(__dirname, 'step2', 'real', algo(500), 1766400);
