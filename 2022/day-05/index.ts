import { flow, identity } from 'fp-ts/function'
import { assert } from '../../utils/run';
import { parseBlocks } from '../../utils/parse';
import { Arrays } from '../../utils/arrays';

type Stacks = string[][];
type Move = {
    from: number,
    to: number,
    nb: number,
}

const parseStacks = flow(
    (text: string) => text.split('\n').reverse().slice(1),
    Arrays.reduce(flow(
        (stacks: Stacks, line: string) => Arrays.zipW(line.match(/.{3} ?/g)!, stacks),
        Arrays.map(([crate, stack]) => ([crate || '', stack || []] as const)),
        Arrays.map(([crate, stack]) => crate.trim() === '' ? stack : [...stack, crate.charAt(1)])
    ), [] as Stacks)
);

const parseMoves = parseBlocks('\n', flow(
    (line) => /move (\d+) from (\d+) to (\d+)/.exec(line)!,
    (matches) => ({
        from: parseInt(matches[2])-1,
        to: parseInt(matches[3])-1,
        nb: parseInt(matches[1]),
    } as Move)
));

const parse = flow(
    (str: string) => ([
        parseStacks(str.split('\n\n')[0]),
        parseMoves(str.split('\n\n')[1])
    ] as const)
);

const applyMoveStep = (transformOnMove: (moved: string[]) => string[]) => (stacks: Stacks, move: Move) => stacks.map(
    (stack, index) => index === move.from
        ? stack.slice(0, -move.nb)
        : index === move.to
            ? transformOnMove(stack.concat(stacks[move.from].slice(-move.nb)))
            : stack
);

const readResult = (stacks: Stacks) => stacks.map((stack) => stack.length === 0 ? '*' : stack[stack.length-1]).join('');

const algo1 = flow(
    parse,
    ([stacks, moves]) => moves.reduce(applyMoveStep(arr => arr.reverse()), stacks),
    readResult,
)

const algo2 = flow(
    parse,
    ([stacks, moves]) => moves.reduce(applyMoveStep(identity), stacks),
    readResult,
)

assert(__dirname, algo1, algo2, ['QDPFNRZHF', 'MGDMPSZTM']);