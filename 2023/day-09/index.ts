import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, Vector, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', Parse.extractIntArray),
);

const diff = (nums: readonly number[]) => Vector.sub(
    nums.slice(1), nums.slice(0, -1)
)

const extrapolate = (nums: readonly number[]): number => {
    if(nums.every(z => z === 0)) {
        return 0;
    } else {
        const d = diff(nums);
        const nd = extrapolate(d);
        return nums[nums.length - 1] + nd;
    }
}

const algo1 = flow(
    parse,
    Arrays.map(extrapolate),
    Arrays.sum
);

const algo2 = flow(
    parse,
    Arrays.map(Arrays.reverse),
    Arrays.map(extrapolate),
    Arrays.sum
)

runStep(__dirname, 'step1', 'example', algo1, 114);
runStep(__dirname, 'step1', 'real', algo1, 1584748274);
runStep(__dirname, 'step2', 'example', algo2, 2);
runStep(__dirname, 'step2', 'real', algo2, 1026);
