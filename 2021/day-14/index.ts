import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, Strings } from '../../utils/@index';

type Pair = {p: string, cnt: number};

const parse = flow(
    Strings.split('\n\n'),
    ([base, rules]) => ({
        base: pipe(' '+base+' ',
            Strings.split(''),
            Arrays.windowStrict(2),
            Arrays.map(p => ({p: p.join(''), cnt:1})),
            compress
        ),
        rules: pipe(rules,
            Strings.split('\n'),
            Arrays.map(Strings.split(' -> ')),
            Objects.fromEntriesUnsafe,
            Objects.map((v, k) => [k.at(0)!+v, v+k.at(1)!])
        )
    })
);

const compress = (pair: Pair[]) => pipe(pair,
    Arrays.groupByAsArray(Objects.pluck('p')),
    Arrays.map(v => ({p: v[0].p, cnt: pipe(v, Arrays.map(Objects.pluck('cnt')), Arrays.sum)}))
)

const polymerize = (replacements: Record<string, string[]>) => (pair: Pair[]) => pipe(pair,
    Arrays.flatMap(({p, cnt}) => (replacements[p]??[p]).map(r => ({p: r, cnt}))),
    compress
)

const countAtoms = (pairs: Pair[]) => pipe(pairs,
    Arrays.groupByAsObject(pair => pair.p.split('')),
    Objects.map(flow(Arrays.map(Objects.pluck('cnt')), Arrays.sum)),
    Objects.map(x => x/2)
)

const score = (atoms: Record<string, number>) => pipe(atoms,
    Objects.entries,
    Arrays.filter(([atom]) => atom !== ' '),
    Arrays.map(([,cnt]) => cnt),
    Arrays.sortNumbers('ASC', identity),
    (arr) => arr.at(-1)! - arr.at(0)!
)

const algo = (steps: number) => flow(
    parse,
    ({base, rules}) => Arrays.range(0, steps).reduce(polymerize(rules), base),
    countAtoms,
    score
);


const algo1 = algo(10);
const algo2 = algo(40);

runStep(__dirname, 'step1', 'example', algo1, 1588);
runStep(__dirname, 'step1', 'real', algo1, 2988);
runStep(__dirname, 'step2', 'example', algo2, 2188189693529);
runStep(__dirname, 'step2', 'real', algo2, 3572761917024);
