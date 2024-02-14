import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Mapper, parseBlocks } from '../../utils/@index';

type Stacks = string[][];
type Move = {
    from: number,
    to: number,
    nb: number,
}

const parseStacks = flow(
    (text: string) => text.split('\n').reverse().slice(1),
    Arrays.reduce(flow(
        (stacks: Stacks, line: string) => Arrays.zipW([line.match(/.{3} ?/g)!, stacks]),
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

const readResult = (stacks: Stacks) => stacks.map((stack) => stack.length === 0 ? '*' : stack[stack.length-1]).join('');

const algo = (craneMover: Mapper<string[], string[]>) => flow(
    parse,
    ([stacks, moves]) => moves.reduce(
        (stacks: Stacks, move: Move) => stacks.map(
            (stack, index) => index === move.from
                ? stack.slice(0, -move.nb)
                : index === move.to
                    ? stack.concat(craneMover(stacks[move.from].slice(-move.nb)))
                    : stack
        ),
        stacks),
    readResult,
)

const algo1 = algo(Arrays.reverse);
const algo2 = algo(identity);

runStep(__dirname, 'step1', 'example', algo1, 'CMZ');
runStep(__dirname, 'step1', 'real', algo1, 'QGTHFZBHV');
runStep(__dirname, 'step2', 'example', algo2, 'MCD');
runStep(__dirname, 'step2', 'real', algo2, 'MGDMPSZTM');
