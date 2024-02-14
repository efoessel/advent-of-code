import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Strings } from '../../utils/@index';

/**
 * Heavily reverse-engineered solution
 *
 * Uses the same optimizations as attempt-3, but on top of that matches each push step with the corresponding pop step
 * That way, we don't need to recursively explore for all push state options, we straight up find the highest valid value to be pushed
 * Now we are on a 7 * 9 complexity
 * 
 * <1ms
 */

type Instruction = {
    type: 'push' | 'pop';
    val: number,
};

const parse = flow(
    Strings.split('\n'),
    Arrays.split((line) => line.startsWith('inp')),
    Arrays.filter(a => a.length !== 0),
    Arrays.map((lines): Instruction => {
        const isAdd = lines[3] === 'div z 1';
        if(isAdd) {
            return { type: 'push', val: parseInt(lines[14].split(' ')[2])};
        } else {
            return { type: 'pop', val: parseInt(lines[4].split(' ')[2])};
        }
    }),
);

function solve(steps: Instruction[], order: 'ASC' | 'DESC') {
    const options = pipe(Arrays.rangeI(1, 9), Arrays.sortNumbers(order, identity));
    const pushStack: [Instruction, number][] = [];

    return Arrays.sum(steps.map((step, i) => {
        if(step.type === 'push') {
            pushStack.push([step, i]);
            return 0;
        } else {
            const [push, idx] = pushStack.pop()!;
            for(const w of options) {
                const popInput = push.val + w + step.val;
                if(popInput > 0 && popInput < 10) {
                    return Math.pow(10, 13-i)*popInput + Math.pow(10, 13-idx)*w;
                }
            }
            throw 'Impossibru !!!'
        }
    }));
}

const algo1 = flow(
    parse,
    (blocks) => solve(blocks, 'DESC'),
);

const algo2 = flow(
    parse,
    (blocks) => solve(blocks, 'ASC'),
)

runStep(__dirname, 'step1', 'real', algo1, 91398299697996, true);
runStep(__dirname, 'step2', 'real', algo2, 41171183141291, true);
