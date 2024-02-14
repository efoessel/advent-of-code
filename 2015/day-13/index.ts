import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, Stream, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', flow(
        (l) => l.split(' '),
        ([a,,gainOrLose, amount,,,,,,,b]) => [a, b.substring(0, b.length-1), (gainOrLose === 'gain' ? 1 : -1)*parseInt(amount)] as const,
    )),
    (entries) => ({
        people: Arrays.asSet(entries.flatMap(([a, b]) => ([a, b]))),
        relations: Objects.fromEntries(entries.map(([a, b, val]) => ([`${a}+${b}`, val])))
    })
);

const findBestOption = ({people, relations}: {people: string[], relations: Record<string, number>}) =>
    Stream.fromPermutations(people.slice(1))
        .map(perm => [people[0], ...perm, people[0]])
        .map(Arrays.windowStrict(2))
        .map(flow(
            Arrays.flatMap(([a, b]) => ([`${a}+${b}`, `${b}+${a}`])),
            Arrays.map((key) => key.includes('__me__') ? 0 : relations[key]),
            Arrays.sum
        ))
        .reduce((max, curr) => Math.max(max, curr), -Infinity)

const algo1 = flow(
    parse,
    findBestOption,
)


const algo2 = flow(
    parse,
    ({people, relations}) => ({people: ['__me__', ...people], relations}),
    findBestOption,
)

runStep(__dirname, 'step1', 'example', algo1, 330);
runStep(__dirname, 'step1', 'real', algo1, 709);
runStep(__dirname, 'step2', 'example', algo2, 286);
runStep(__dirname, 'step2', 'real', algo2, 668);
