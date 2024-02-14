import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, memo, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', flow(
        line => line.split(' '),
        ([springs, rating]) => ({
            springs: springs,
            rating: Parse.extractIntArray(rating)
        })
    )),
);

const expand = ({springs, rating}: {springs: string, rating: readonly number[]}) => ({
    springs: [springs, springs, springs, springs, springs].join('?'),
    rating: rating.concat(rating).concat(rating).concat(rating).concat(rating),
});

const solve = (springs: string, rating: readonly number[]) => {
    const withEmpty = (ptr: number, cursor: number, currentBlock: number) => {
        if(currentBlock === rating[cursor]) {
            return step(ptr+1, cursor+1, 0);
        } else if(currentBlock === 0) {
            return step(ptr+1, cursor, 0);
        } else {
            return 0;
        }
    };

    const withSpring = (ptr: number, cursor: number, currentBlock: number) => {
        if(cursor >= rating.length || currentBlock === rating[cursor]) {
            return 0;
        } else {
            return step(ptr+1, cursor, currentBlock+1);
        }
    }

    const step = memo((ptr: number, cursor: number, currentBlock: number): number => {
        const curr = springs.at(ptr);
        if(curr === undefined) {
            return cursor === rating.length || (cursor === rating.length - 1 && currentBlock === rating[cursor])
                ? 1 : 0;
        } else if(curr === '.') {
            return withEmpty(ptr, cursor, currentBlock);
        } else if(curr === '#') {
            return withSpring(ptr, cursor, currentBlock);
        } else {
            return withEmpty(ptr, cursor, currentBlock)
                + withSpring(ptr, cursor, currentBlock);
        }
    })

    return step(0, 0, 0);
}

const algo1 = flow(
    parse,
    Arrays.map(({springs, rating}) => solve(springs, rating)),
    Arrays.sum
);

const algo2 = flow(
    parse,
    Arrays.map(expand),
    Arrays.map(({springs, rating}) => solve(springs, rating)),
    Arrays.sum
)

runStep(__dirname, 'step1', 'example', algo1, 21);
runStep(__dirname, 'step1', 'real', algo1, 7007);
runStep(__dirname, 'step2', 'example', algo2, 525152);
runStep(__dirname, 'step2', 'real', algo2, 3476169006222);
