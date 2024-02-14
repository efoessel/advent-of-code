import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, Stream, Strings, Vector } from '../../utils/@index';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(flow(
        Strings.split(''),
        Arrays.map(Parse.extractInt)
    ))
);

const back2number = (i: number[]) => parseInt(i.join(''), 2)

const algo1 = flow(
    parse,
    (inputs) => {
        const sum = Vector.addW(...inputs);
        const gamma = back2number(sum.map(x => x > inputs.length/2 ? 1 : 0));
        const epsilon = back2number(sum.map(x => x > inputs.length/2 ? 0 : 1));
        return gamma * epsilon;
    }
);

const rating = (inputs: number[][], select: (moreOnes: boolean) => number) => back2number(Stream.loop().reduceUntil(
    ({inputs}) => inputs.length === 1,
    ({inputs, acc}, _, i) => {
        const bit = select(pipe(inputs, Arrays.map(input => input[i]), Arrays.sum) >= inputs.length/2);
        return {
            inputs: inputs.filter(input => input[i] === bit),
            acc: [...acc, bit],
        };
    },
    {inputs, acc: [] as number[] }
).inputs[0]);

const algo2 = flow(
    parse,
    (inputs) => {
        const O2 = rating(inputs, (b) => b ? 1 : 0);
        const CO2 = rating(inputs, (b) => b ? 0 : 1);
        return O2 * CO2;
    }
);

runStep(__dirname, 'step1', 'example', algo1, 198);
runStep(__dirname, 'step1', 'real', algo1, 3009600);
runStep(__dirname, 'step2', 'example', algo2, 230);
runStep(__dirname, 'step2', 'real', algo2, 6940518);
