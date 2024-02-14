import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, findPath, parseBlocks } from '../../utils/@index';

type FullGraph =  Record<string, {flow: number, dests: string[]}>;
type SimplifiedGraph = { flow: number, dests: number[]}[];

const parse = flow(
    parseBlocks('\n', (line) => {
        const match = /Valve (\w\w) has flow rate=(\d+); tunnels? leads? to valves? ((\w\w, )*\w\w)$/.exec(line)!;
        return {
            source: match[1],
            flow: parseInt(match[2]),
            dests: match[3].split(', '),
        }
    }),
    Arrays.reduce((graph, edge) => ({
        ...graph,
        [edge.source]: edge,
    }), {} as FullGraph)
);

// gets the distance between two rooms from the full graph
const getCostToMove = (graph: FullGraph, source: string, dest: string) => findPath(
    [{state: source, cost: 0}],
    [dest],
    (from) => graph[from.state].dests.map(x => ({ state:x , cost: from.cost+1})),
    identity,
)?.cost;

// Build a pruned graph with only non-zero flow rooms & index them with integers
const simplifyGraph = (graph: FullGraph) => {
    const nodeIds = Object.keys(graph).filter(n => n === 'AA' || graph[n].flow>0).sort();
    return nodeIds.map((n) => ({
        flow: graph[n].flow, 
        dests: nodeIds.map((m) => n === m ? Infinity : getCostToMove(graph, n, m)!),
    }));
}

// find the best possible score. could easily be done functional, but takes ~2x more time to execute :(
export const explore = (g: SimplifiedGraph) => {
    const nbNodes = g.length;

    return function exploreInternal(time: number, pos: number, explored: number): number {
        let best = 0;
        for(let destId = 1 ; destId < nbNodes ; destId++) {
            const cost = g[pos].dests[destId];
            if(cost && cost < time && !(explored & 1<<destId)) {
                best = Math.max(best, exploreInternal(time - cost - 1, destId, explored | 1<<destId));
            }
        }
        return best + (time) * g[pos].flow;
    };
}

const algo1 = flow(
    parse,
    simplifyGraph,
    (graph) => explore(graph)(30, 0, 0),
);

const algo2 = flow(
    parse,
    simplifyGraph,
    (graph) => {
        const totalTime = 26;
        const nodeCnt = Object.keys(graph).length;
        const exploreThisGraph = explore(graph);
        return Arrays.range(0, 2**(nodeCnt-1)).reduce((best, i) => Math.max(
            best,
            exploreThisGraph(totalTime, 0, i) + exploreThisGraph(totalTime, 0, 2**nodeCnt - i - 1)
        ), 0);
    }
);

runStep(__dirname, 'step1', 'example', algo1, 1651);
runStep(__dirname, 'step1', 'real', algo1, 1862);
runStep(__dirname, 'step2', 'example', algo2, 1707);
runStep(__dirname, 'step2', 'real', algo2, 2422, true);
