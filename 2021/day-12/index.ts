import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Logic, Objects, Strings, Stream } from '../../utils/@index';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(Strings.split('-')),
    Arrays.groupByAsObject(([a, b]) => [a, b]),
    Objects.map((opts, k) => opts.map(Arrays.findUnsafe(Logic.neq(k))).filter(Logic.neq('start')))
);

const countPaths = (useJoker: boolean) => (graph: Record<string, string[]>) => {
    const possibleMoves = pipe(graph, Objects.map((_, k) => k.charAt(0).toLowerCase() === k.charAt(0) ? 1 : Infinity));
    let joker = useJoker ? 1 : 0;

    function* enumeratePaths(from: string): Generator<number, void, void> {
        if(from === 'end') {
            yield 1;
            return;
        }
        possibleMoves[from]--;
        if(possibleMoves[from] === -1) joker--;
        for(const next of graph[from].filter(n => possibleMoves[n] > 0 || joker > 0)) {
            yield* enumeratePaths(next);
        }
        if(possibleMoves[from] === -1) joker++;
        possibleMoves[from]++;
    }
    return new Stream(enumeratePaths('start')).size();
};

const algo1 = flow(
    parse,
    countPaths(false)
);

const algo2 = flow(
    parse,
    countPaths(true)
)

runStep(__dirname, 'step1', 'example1', algo1, 10);
runStep(__dirname, 'step1', 'example2', algo1, 19);
runStep(__dirname, 'step1', 'example3', algo1, 226);
runStep(__dirname, 'step1', 'real', algo1, 4011);
runStep(__dirname, 'step2', 'example1', algo2, 36);
runStep(__dirname, 'step2', 'example2', algo2, 103);
runStep(__dirname, 'step2', 'example3', algo2, 3509);
runStep(__dirname, 'step2', 'real', algo2, 108035);
