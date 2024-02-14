import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Intervals, Interval, Parse, Strings } from '../../utils/@index';


type FarmingMap = ReturnType<typeof parseMap>;

const parseMap = flow(
    (mapTxt: string) => mapTxt.split('\n').slice(1),
    Arrays.map(line => {
        const nb = line.split(' ');
        return {
            from: parseInt(nb[1]),
            to: parseInt(nb[0]),
            length: parseInt(nb[2]),
        }
    }),
    Arrays.map(({from, to, length}) => ({ from: Intervals.from(from, from + length), to}))
);

const parse = flow(
    Strings.split('\n\n'),
    ([seeds, ...maps]) => ({
        seeds: Parse.extractIntArray(seeds),
        maps: maps.map(parseMap),
    })
);



type Acc = { untouched: Interval[], converted: Interval[] };

const applyLine = (input: Interval[], {from, to}: FarmingMap[number]): Acc => ({
    converted: pipe(input,
        Arrays.map(Intervals.intersectionWith(from)),
        Arrays.filterNullable,
        Arrays.map(i => Intervals.from(to + i.from - from.from, to + i.to - from.from))
    ),
    untouched: pipe(input,
        Arrays.flatMap(i => Intervals.exclude(i, from)),
    )
})

const applyMap = (input: Interval[], map: FarmingMap) => {
    const res = map.reduce(
        (acc: Acc, m) => {
            const step = applyLine(acc.untouched, m);
            return {
                converted: acc.converted.concat(step.converted),
                untouched: step.untouched,
            }
        },
        {untouched: input, converted: []} as Acc
    );
    return res.converted.concat(res.untouched);
}

const seedAsIntervals2 = (seeds: readonly number[]) => pipe(seeds,
    Arrays.partition((_, i) => i%2 === 0),
    Arrays.zip,
    Arrays.map(([s, r]) => Intervals.from(s, s+r))
)

const algo = (seedAsIntervals: typeof seedAsIntervals2) => flow(
    parse,
    ({seeds, maps}) => ({
        seeds: seedAsIntervals(seeds),
        maps,
    }),
    ({seeds, maps}) => maps.reduce(applyMap, seeds),
    Arrays.map(i => i.from),
    Arrays.min
);

runStep(__dirname, 'step1', 'example', algo(Arrays.map(s => Intervals.from(s, s+1))), 35);
runStep(__dirname, 'step1', 'real', algo(Arrays.map(s => Intervals.from(s, s+1))), 389056265);
runStep(__dirname, 'step2', 'example', algo(seedAsIntervals2), 46);
runStep(__dirname, 'step2', 'real', algo(seedAsIntervals2), 137516820);
