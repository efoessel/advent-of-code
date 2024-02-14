import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Interval, Intervals, parseBlocks } from '../../utils/@index';

type El = {line: number, val: string, range: Interval}

const parse = (reg: RegExp, overlap: number) => flow(
    parseBlocks('\n', ((line, i) => {
        return  [...line.matchAll(reg)]
            .map(m => ({
                line: i,
                val: m[0],
                range: Intervals.fromIntegersIncluded((m.index ?? 0) - overlap, (m.index ?? 0) + m[0].length -1 + overlap)
            }));
    })),
    Arrays.flatMap(identity)
);


const findAdjacents = (el: El, candidates: El[]) => {
    return candidates.filter(c => {
        return c != el && Math.abs(el.line - c.line) <= 1
            && Intervals.intersects(el.range)(c.range)
    })
}

const algo1 = flow(
    (input: string) => {
        const numbers = parse(/\d+/g, 1)(input);
        const symbols = parse(/[^\d.]/g, 0)(input);
        return numbers.filter(n => findAdjacents(n, symbols).length > 0)
    },
    Arrays.map(({val}) => parseInt(val)),
    Arrays.sum
);

const algo2 = flow(
    (input: string) => {
        const numbers = parse(/\d+/g, 1)(input);
        const gears = parse(/[*]/g, 0)(input);
        return gears.map(s => findAdjacents(s, numbers))
            .filter(m => m.length === 2)
            .map(([a, b]) => parseInt(a.val)*parseInt(b.val))
    },
    Arrays.sum
)

runStep(__dirname, 'step1', 'example', algo1, 4361);
runStep(__dirname, 'step1', 'real', algo1, 527144);
runStep(__dirname, 'step2', 'example', algo2, 467835);
runStep(__dirname, 'step2', 'real', algo2, 81463996);
