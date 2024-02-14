import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Matrices, Strings, memo } from '../../utils/@index';


/**
 * Moderately reverse-engineered solution.
 * Compared to attempt-1, the only assumption we add is that only Z state matters between two blocks
 * 
 * About 4 minutes total on M3pro
 */

const REGISTERS = ['w', 'x', 'y', 'z'] as const;
type Register = typeof REGISTERS[number];
const isRegister = (x: string): x is Register => (REGISTERS as readonly string[]).includes(x);

type ALUState = Record<Register, number>;
type Instruction = (s: ALUState) => ALUState;

const parse = flow(
    Strings.split('\n'),
    Arrays.split((line) => line.startsWith('inp')),
    Matrices.map((line): Instruction => {
        const[instruction, i1raw, i2] = line.split(' ');
        const i1 = i1raw as Register;

        if(isRegister(i2)) {
            switch(instruction) {
                case 'add': return (s) => ( { ...s, [i1]: s[i1] + s[i2]});
                case 'mul': return (s) => ( { ...s, [i1]: s[i1] * s[i2]});
                case 'div': return (s) => ( { ...s, [i1]: Math.floor(s[i1] / s[i2])});
                case 'mod': return (s) => ( { ...s, [i1]: s[i1] % s[i2]});
                case 'eql': return (s) => ( { ...s, [i1]: s[i1] === s[i2] ? 1 : 0});
            }
        } else {
            const v2 = parseInt(i2);
            switch(instruction) {
                case 'add': return (s) => ( { ...s, [i1]: s[i1] + v2});
                case 'mul': return (s) => ( { ...s, [i1]: s[i1] * v2});
                case 'div': return (s) => ( { ...s, [i1]: Math.floor(s[i1] / v2)});
                case 'mod': return (s) => ( { ...s, [i1]: s[i1] % v2});
                case 'eql': return (s) => ( { ...s, [i1]: s[i1] === v2 ? 1 : 0});
            }
        }
        throw new Error('Unknown instruction: '+line);
    }),
    // compress each block in a single instruction
    Arrays.map((block): Instruction => (state) => block.reduce(
        (state, instruction) => instruction(state),
        state
    ))
);

const findValidTail = (blocks: Instruction[], order: 'ASC' | 'DESC') => {
    const options = pipe(Arrays.rangeI(1, 9), Arrays.sortNumbers(order, identity))

    const findValidTail_rec = memo(
        (state: ALUState, tailLength: number): number[] | undefined => {
            if(tailLength === 0) return state.z === 0 ? [] : undefined;
            for(const w of options) {
                if(tailLength > 11){
                    console.log(w.toFixed(0).padEnd(tailLength-11, '.').padStart(3, '.'));
                }
                const nextState = blocks.at(-tailLength)!({...state, w});
                const maybeValidTail = findValidTail_rec(nextState, tailLength-1);
                if(maybeValidTail) {
                    return [w, ...maybeValidTail];
                }
            }
            return undefined;
        },
        (state, tailLength) => state.z + '-' + tailLength
    );
    return findValidTail_rec({w: 0, x: 0, y: 0, z: 0}, blocks.length-1)!;
}


const algo1 = flow(
    parse,
    (blocks) => findValidTail(blocks, 'DESC'),
    Arrays.join(''),
);

const algo2 = flow(
    parse,
    (blocks) => findValidTail(blocks, 'ASC'),
    Arrays.join(''),
)

runStep(__dirname, 'step1', 'example0', algo1, '981');
runStep(__dirname, 'step1', 'real', algo1, '91398299697996', true);
runStep(__dirname, 'step2', 'example0', algo2, '211');
runStep(__dirname, 'step2', 'real', algo2, '41171183141291', true);
