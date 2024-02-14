import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, parseBlocks } from '../../utils/@index';

type Set = ReturnType<typeof parseSet>;

const parseSet = (set: string) => {
    return Object.fromEntries(set.split(', ').map(flow(
        oneColor => oneColor.split(' '),
        ([v, k]) => [k, parseInt(v)] as const,
    )));
}

const parse = flow(
    parseBlocks('\n', (line => {
        const [gameTxt, setsTxt] = line.split(': ');
        const gameId = parseInt(gameTxt.split(' ')[1]);
        const sets = setsTxt.split('; ').map(parseSet)
        return {
            gameId, sets
        }
    })),
);

const compatibleWith = (ref: Set, toTest: Set): boolean =>  Objects.entries(ref).every(([color, cnt]) => (toTest[color] ?? 0) <= cnt);

const algo1 = flow(
    parse,
    Arrays.filter(({sets}) => sets.every(set => compatibleWith({red: 12, green: 13, blue: 14}, set))),
    Arrays.map(({gameId}) => gameId),
    Arrays.sum
);


const minimumFor = (sets: Set[]): Set => sets.reduce((acc, set) => 
    Objects.fromEntries(Object.keys(acc).concat((Object.keys(set))).map(k => [k, Math.max(acc[k] ?? 0, set[k] ?? 0)])),
    {} as Set
);

const power = (set: Set) => set.red * set.green * set.blue

const algo2 = flow(
    parse,
    Arrays.map(flow(
        ({sets}) => minimumFor(sets),
        power
    )),
    Arrays.sum
)

runStep(__dirname, 'step1', 'example', algo1, 8);
runStep(__dirname, 'step1', 'real', algo1, 2377);
runStep(__dirname, 'step2', 'example', algo2, 2286);
runStep(__dirname, 'step2', 'real', algo2, 71220);
