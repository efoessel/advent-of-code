import { flow, identity, pipe } from 'fp-ts/function'
import { runStep, assertThat } from '../../utils/run';
import { Arithmetics, Arrays, Objects, cycleDetector, Stream, parseBlocks } from '../../utils/@index';

type Node = {
    name: string,
    outs: string[],
}
 & ({
    type: 'b',
} | {
    type: '%',
    on: boolean
} | {
    type: '&',
    inputs: Record<string, boolean>
})

const parse = flow(
    parseBlocks('\n', (line): [string, Node] => {
        const [i, o] = line.split(' -> ');
        const m = /([%&])(\w+)/.exec(i)!;
        if(i==='broadcaster') {
            return ['broadcaster', {type: 'b', outs: o.split(', '), name: 'broadcaster'}];
        } else if(m[1] === '%') {
            return [m[2], {type: '%', outs: o.split(', '), on: false, name: m[2]}];
        } else {
            return [m[2], {type: '&', outs: o.split(', '), inputs: {}, name: m[2]}];
        }
    }),
    Objects.fromEntries
);

const initNodeStates = (nodes: Record<string, Node>): Record<string, Node> => pipe(
    nodes,
    Objects.map((v, name) => v.type === '%'
        ? {...v, on: false}
        : v.type === '&'
            ? {...v, inputs: pipe(
                nodes,
                Objects.filter(({outs}) => outs.includes(name)),
                Objects.map(() => false)
            )}
            :v
        )
)

const apply = (node: Node, from: string, high: boolean) => {
    switch(node.type) {
        case 'b':
            return high;
        case '%':
            if(high) return undefined;
            node.on = !node.on;
            return node.on;
        case '&': {
            node.inputs[from] = high;
            const allHigh = Objects.values(node.inputs).every(identity);
            return !allHigh;
        }
    }
}

const step = (nodes: Record<string, Node>, starter: {from: string, to: string, high: boolean}, watch?: string) => {
    const ticks = [];
    let highTicks = 0, lowTicks = 0;
    let queue: {from: string, to: string, high: boolean}[] = [starter];
    while(queue.length > 0) {
        const [h, ...tail] = queue;
        if(h.from === watch) {
            ticks.push(h.high);
        }
        // inputs: { js: false, qs: false, dt: false, ts: false },
        highTicks += h.high ? 1 : 0;
        lowTicks += h.high ? 0 : 1;
        const node = nodes[h.to];
        const output = node && apply(node, h.from, h.high);
        if(output !== undefined) {
            const ticked = node.outs.map((to) => ({
                from: h.to,
                to,
                high: output,
            }));
            queue = tail.concat(ticked);
        } else {
            queue = tail;
        }
    }
    return { lowTicks, highTicks, ticks }
}

const algo1 = flow(
    parse,
    initNodeStates,
    (nodes) => Stream.fromRange(0, 1000).reduce(
        ({ lowTicks, highTicks }) => {
            const res = step(nodes, {from: 'button', to: 'broadcaster', high: false});
            return {
                highTicks: highTicks + res.highTicks,
                lowTicks: lowTicks + res.lowTicks
            }
        },
        { lowTicks: 0, highTicks: 0 }
    ),
    ({ lowTicks, highTicks}) => lowTicks * highTicks
);



const parents = (nodes: Record<string, Node>, name: string) => pipe(
    nodes,
    Objects.filter(({outs}) => outs.includes(name)),
    Objects.keys
);

const ancestors = (nodes: Record<string, Node>, name: string) => Stream.loopUntil(
    ({rest}) => rest.length === 0,
    ({done, rest}) => ({
        done: Arrays.asSet(done.concat(rest)),
        rest: rest.flatMap(r => parents(nodes, r)).filter(p => !done.includes(p))
    }),
    {done: [] as string[], rest: [name]}
).done


// this algo assumes that:
// - the global graph is subdividable in n smaller graphs, that each end in rx grand-parents
// - each of those graph have a periodic behavior without warm-up (periodic is guaranteed since it's finite & deterministic, no warmup much less)
// - there is no high signal to those grand-parents before the end of those periods (or we could overestimate the result)
// - when all those periods coincide, the high signal from all subgraphs will overlap (no subgraph 1 reverts to low before the high signal from subgraph 2)
// yuck
const algo2 = flow(
    parse,
    (nodes) => pipe(
        parents(nodes, 'rx'),
        Arrays.flatMap(p => parents(nodes, p)),
        Arrays.map(gp => pipe(gp,
            assertThat(gp => nodes[gp].type === '&', 'Wrong graph struct assumption for '+gp),
            gp => ancestors(nodes, gp),
            Arrays.map(n => [n, nodes[n]] as const),
            Objects.fromEntries,
            initNodeStates,
            (subgraph) => {
                return cycleDetector(
                    (state) => {
                        step(state, {from: 'button', to: 'broadcaster', high: false}, gp);
                        return state;
                    },
                    (state) => JSON.stringify(state),
                    Infinity,
                    subgraph
                )
            },
            assertThat(({start}) => start === 1, 'Wrong cycle structure assumption for '+gp),
            ({period}) => period!
        )),
        (res) => Arithmetics.lcm(...res)
    ),
)

runStep(__dirname, 'step1', 'example1', algo1, 32000000);
runStep(__dirname, 'step1', 'example2', algo1, 11687500);
runStep(__dirname, 'step1', 'real', algo1, 938065580);
runStep(__dirname, 'step2', 'real', algo2, 250628960065793);
