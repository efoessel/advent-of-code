import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks(',', (line => {
        return line
    })),
);

const hash = flow(
    (block: string) => block.split(''),
    Arrays.map(c => c.charCodeAt(0)),
    Arrays.reduce((acc, c) => (acc + c)*17%256, 0)
)

const algo1 = flow(
    parse,
    Arrays.map(hash),
    Arrays.sum
);

const parse2 = flow(
    parseBlocks(',', (line => {
        const tmp = /(\w+)([=-])(\d*)/.exec(line)!;
        return {
            label: tmp[1],
            hash: hash(tmp[1]),
            action: tmp[2] as '-'|'=',
            val: parseInt(tmp[3]),
        }
    })),
);

type Action = ReturnType<typeof parse2>[number];
type Lens = { label: string, val: number }
type State = Lens[][];

const action = (state: State, action: Action) => state.map(
    (box, i) => i !== action.hash
        ? box
        : action.action === '-'
            ? box.filter(lens => lens.label !== action.label)
            : box.some(lens => lens.label === action.label)
                ? box.map(lens => lens.label === action.label ? {label: action.label, val: action.val} : lens)
                : [...box, {label: action.label, val: action.val}]
)

const computeFocussingPower = (state: State) => pipe(
    state,
    Arrays.map(flow(
        (box, boxIdx) => box.map((lens, lensIdx) => (boxIdx+1)*(lensIdx+1)*lens.val),
        Arrays.sum
    )),
    Arrays.sum
)


const algo2 = flow(
    parse2,
    Arrays.reduce(action, new Array(256).fill([])),
    computeFocussingPower
)

runStep(__dirname, 'step1', 'example', algo1, 1320);
runStep(__dirname, 'step1', 'real', algo1, 504036);
runStep(__dirname, 'step2', 'example', algo2, 145);
runStep(__dirname, 'step2', 'real', algo2, 295719);
