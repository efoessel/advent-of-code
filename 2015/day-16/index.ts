import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, Predicate, parseBlocks } from '../../utils/@index';

const REAL_SUE_DATA: Record<string, number> = {
    children: 3,
    cats: 7,
    samoyeds: 2,
    pomeranians: 3,
    akitas: 0,
    vizslas: 0,
    goldfish: 5,
    trees: 3,
    cars: 2,
    perfumes: 1
};

const parseDesc = flow(
    parseBlocks(', ', flow(
        (item) => item.split(': '),
        ([a, b]) => [a, parseInt(b)] as const
    )),
    Objects.fromEntries
);

const parse = flow(
    parseBlocks('\n', flow(
        // Sue 1: cars: 9, akitas: 3, goldfish: 0
        (l) => l.match(/Sue (\d+): (.*)/)!.slice(1),
        ([id, desc]) => ({id: parseInt(id), desc: parseDesc(desc)})
    )),
);

const sueMatch = (desc: Record<string, number>) => Objects.entries(desc).every(([k, v]) => REAL_SUE_DATA[k] === v);

const sueMatch2 = (desc: Record<string, number>) => Objects.entries(desc).every(([k, v]) => {
    if(['cats', 'trees'].includes(k)) return REAL_SUE_DATA[k] < v;
    if(['pomeranians', 'goldfish'].includes(k)) return REAL_SUE_DATA[k] > v;
    return REAL_SUE_DATA[k] === v
});

const algo = (sueMatch: (Predicate<Record<string, number>>)) => flow(
    parse,
    Arrays.findUnsafe(({desc}) => sueMatch(desc)),
    Objects.pluck('id')
)

runStep(__dirname, 'step1', 'real', algo(sueMatch), 373);
runStep(__dirname, 'step2', 'real', algo(sueMatch2), 260);