import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Mapper, Objects, Parse, Stream } from '../../utils/@index';

const parse = flow(
    Parse.extractIntArray,
    Arrays.countUniqueAsMap(identity),
    m => Array.from(m.entries()),
    Arrays.map(([d, cnt]) => ({d, cnt}))
);

type State = ReturnType<typeof parse>;

const oneDay: Mapper<State, State> = flow(
    Arrays.flatMap(({d, cnt}) => d === 0 ? [{d: 6, cnt}, {d: 8, cnt}] : [{d: d-1, cnt}]),
    Arrays.groupByAsArray(Objects.pluck('d')),
    Arrays.map((l) => ({d: l[0].d, cnt: countFishes(l)})),
)

const countFishes: Mapper<State, number> = flow(
    Arrays.map(Objects.pluck('cnt')),
    Arrays.sum
)

const algo = (days: number) => flow(
    parse,
    (s) => Stream.fromRange(0, days).reduce(oneDay, s),
    countFishes,
);

const algo1 = algo(80);
const algo2 = algo(256);

runStep(__dirname, 'step1', 'example', algo1, 5934);
runStep(__dirname, 'step1', 'real', algo1, 386536);
runStep(__dirname, 'step2', 'example', algo2, 26984457539);
runStep(__dirname, 'step2', 'real', algo2, 1732821262171);
