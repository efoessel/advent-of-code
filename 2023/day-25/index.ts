import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, parseBlocks, Objects, findTargetPathBFS, Stream, findReachableNodes } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', (line => {
        const [from, ...to] = line.split(/:? /);
        return [
            { from, to: to},
            ...to.map(t => ({from: t, to: from}))

        ];
    })),
    Arrays.flatMap(identity),
    Arrays.groupByAsArray(
        ({from}) => from,
    ),
    Arrays.map((g) => [g[0].from, g.flatMap(i => i.to)] as const),
    Objects.fromEntries
);

const edgeKey = (f: string, t: string) => f < t ? f+'-'+t : t+'-'+f;

const algo1 = flow(
    parse,
    (edges) => {
        const hits = new Map<string, number>();
        const nodes = Objects.keys(edges);

        for(let i = 0 ; i < 500 ; i++) {
            const from = Arrays.randomElement(nodes);
            const to = Arrays.randomElement(nodes);
            const path = findTargetPathBFS(
                [from],
                (s) => s === to,
                (s) => edges[s],
                identity
            )!;
            Arrays.windowStrict<string>(2)(path).forEach(([f, t]) => {
                const key = edgeKey(f, t);
                hits.set(key, (hits.get(key) ?? 0) +1)
            })
        }

        const mostFrequents = [...hits.entries()].sort((a, b) => b[1] - a[1]);
        return {
            nodes,
            edges,
            candidates: mostFrequents.slice(0, 5).map(e => e[0]),
        }
    },
    // probably not required, find the actual 3 nodes in case they are not the 3 first
    ({candidates, edges, nodes}) => {
        const removed = Stream.fromArrayChooseK(candidates, 3).first(
            (removed) => {
                const from = Arrays.randomElement(nodes);
                const reachable = findReachableNodes(
                    [from],
                    (f) => edges[f].filter(t => !removed.includes(edgeKey(f, t))),
                    identity
                );
                return reachable.length !== nodes.length;
            }
        );
        if(!removed) throw new Error('Correct nodes to cut not in the '+candidates.length+' first, try again')
        return {removed, edges, nodes};
    },
    ({removed, edges, nodes}) => {
        const a = Arrays.randomElement(nodes);
        const aSideSize = findReachableNodes(
            [a],
            (f) => edges[f].filter(t => !removed.includes(edgeKey(f, t))),
            identity
        ).length;
        return (nodes.length - aSideSize) * aSideSize;
    }
);

runStep(__dirname, 'step1', 'example', algo1, 54);
runStep(__dirname, 'step1', 'real', algo1, 601344);
