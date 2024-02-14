import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Strings } from '../../utils/@index';

/**
 * Heavily reverse-engineered solution
 *
 * We have 14 steps.
 * Each step will multiply / divide Z by 26 and add some number between 0 and 25 to if depending on conditions on the z value and the input
 * Each step can be seen as adding / removing a 0-25 value on a stack (z being the stack by itself, as a base 26 digit string)
 * 
 * We have 7 steps that will add a non-zero value to the stack (those with 'div z 1' then 'add x >10')
 * And 7 steps that may remove a value from the stack (those with 'div z 26'), but only under a certain condition (that depends on the input and the current head of the stack)
 * In order to have z = 0 at the end, we need to make those 'may' into a 'will', so we need to make sure the condition is always verified, which allows only one value (if any)
 * 
 * In the end, push steps allow multiple values, so we explore them all.
 * On pop states we compute the required value to stay alive, cutoff if it's not possible, and continue exploring otherwise.
 * It reduces the number of inputs to explore to at most 9^7 ~ 4M (even significantly less thanks to the cutoffs - about 340k recursive calls)
 * 
 * ~15ms
 */

type ALUState = number[]; // z as a base-26 big endian int
type Instruction = {
    type: 'push' | 'pop';
    val: number
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

const findValidTail = (blocks: Instruction[], order: 'ASC' | 'DESC') => {
    const options = pipe(Arrays.rangeI(1, 9), Arrays.sortNumbers(order, identity));

    const findValidTail_rec = (state: ALUState, tailLength: number): number | undefined => {
        if(tailLength === 0) return state.length === 0 ? 0 : undefined;
        const instruction = blocks.at(-tailLength)!;

        if(instruction.type === 'push') {
            // On push instruction, we test all values (in the requested order)
            for(const w of options) {
                const maybeValidTail = findValidTail_rec([instruction.val + w, ...state], tailLength-1);
                if(maybeValidTail !== undefined) {
                    return Math.pow(10, tailLength-1)*w + maybeValidTail;
                }
            }
            return undefined;
        } else {
            // On pull instruction, either the condition is true (which is only possible fo a single input value), or we failed.
            const [head, ...tail] = state;
            const validInput = head + instruction.val;
            if(validInput > 0 && validInput < 10) {
                const maybeValidTail = findValidTail_rec(tail, tailLength-1);
                if(maybeValidTail !== undefined) {
                    return Math.pow(10, tailLength-1)*validInput + maybeValidTail;
                }
            } else {
                return undefined
            }
        }
    };

    return findValidTail_rec([], blocks.length)!;
}


const algo1 = flow(
    parse,
    (blocks) => findValidTail(blocks, 'DESC'),
);

const algo2 = flow(
    parse,
    (blocks) => findValidTail(blocks, 'ASC'),
)

runStep(__dirname, 'step1', 'real', algo1, 91398299697996, true);
runStep(__dirname, 'step2', 'real', algo2, 41171183141291, true);
