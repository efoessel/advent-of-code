import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arithmetics, Stream } from '../../utils/@index';

type Input = ReturnType<typeof parse>;

const parse = flow(
    (input: string) => {
        const [instructions, nodes] = input.split('\n\n');
        return {
            instructions,
            nodes: Object.fromEntries(nodes.split('\n').map(line => {
                const m = /(\w+) = \((\w+), (\w+)\)/.exec(line)!;
                return [m[1], {L: m[2], R: m[3]}];
            }))
        }
    }
);

const next = ({instructions, nodes}: Input, pos: string, step: number) => nodes[pos][instructions.at(step%instructions.length) as 'L'|'R'];

const nextZero = (input: Input, from: string, step: number, until: (pos: string) => boolean) => Stream.loopUntil(
    ({pos}) => until(pos),
    ({pos, step}) => ({pos: next(input, pos, step), step: step+1}),
    {pos: from, step}
)

const algo1 = flow(
    parse,
    (input) => nextZero(input, 'AAA', 0, pos => pos === 'ZZZ').step
);

// works because first zero and loop period are equal, and no other zeros are met during period for all ghosts.
const algo2 = flow(
    parse,
    (input) => {
        const startingNodes = Object.keys(input.nodes).filter(n => n.endsWith('A'));
        return startingNodes.map(start => nextZero(input, start, 0, pos => pos.endsWith('Z')).step)
    },
    periods => Arithmetics.lcm(...periods)
);

runStep(__dirname, 'step1', 'example', algo1, 2);
runStep(__dirname, 'step1', 'example2', algo1, 6);
runStep(__dirname, 'step1', 'real', algo1, 16043);
runStep(__dirname, 'step2', 'example3', algo2, 6);
runStep(__dirname, 'step2', 'real', algo2, 15726453850399);
