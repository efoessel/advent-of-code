import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, DIRECTIONS, Direction, Directions, Matrices, Objects, Vector, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', (line => {
        return line.split('')
    }))
);

const SUCCESSORS: Record<string, readonly Direction[]> = {
    '.': DIRECTIONS,
    '>': ['>'],
    '<': ['<'],
    'v': ['v'],
    '^': ['^'],
}

const explore = (successors: Record<string, string[]>, from: string, to: string): number => {
    const visited = new Set<string>()
    const stack: {ref: string, next: string[]}[] = [{ref: from, next: successors[from]}];
    visited.add(from)
    let max = -Infinity;

    while(stack.length) {
        const {ref, next} = stack[stack.length-1];
        if(ref === to) {
            max = Math.max(max, stack.length);
            visited.delete(ref);
            stack.pop();
            continue;
        }
        if(next.length === 0) {
            visited.delete(ref);
            stack.pop();
            continue;
        }
        const n = next.pop()!;
        visited.add(n);
        stack.push({
            ref: n,
            next: successors[n].filter(x => !visited.has(x))
        });
    }
    return max - 1;

}


const algo1 = flow(
    parse,
    (grid) => ({
        from: '0,1',
        to: (Matrices.nbRows(grid)-1)+','+(Matrices.nbCols(grid)-2),
        successors: pipe(grid,
            Matrices.filterPoints(v => v !== '#'),
            Arrays.map(([r, c]) => [
                [r, c].toString(),
                pipe(SUCCESSORS[grid[r][c]],
                    Arrays.map(d => Directions.apply(d)([r, c])),
                    Arrays.filter((p) => Matrices.at(grid)(p) !== '#'),
                    Arrays.map(Vector.toString)
                )
            ] as const),
            Objects.fromEntries
            
            
            // ({
            //     ...cell,
            //     next: grid.getNeighbors(cell, ...SUCCESSORS[cell.value]
            // ).filter((v) => v.value != '#')})),
            // Arrays.map(({x, y, next}) => [x+','+y, next.map(({x, y}) => x+','+y)] as const),
        )
    }),
    ({successors, from, to}) => explore(successors, from, to),
);

type Edge = {to: string, cost: number};
type Node = Edge[];

const explore3 = (successors: Record<string, Node>, from: string, to: string, visited = new Set<string>()): number => {
    if(from === to) return 0;
    const next = successors[from].filter(n => !visited.has(n.to));
    visited.add(from);
    const result = pipe(next,
        Arrays.map(n => n.cost + explore3(successors, n.to, to, visited)),
        Arrays.max
    );
    visited.delete(from);
    return result;
}

const replace = (node: Node, lookup: string, replacement: Edge) => {
    const remove = node.find(e => e.to === lookup)!;
    remove.to = replacement.to;
    remove.cost += replacement.cost;
}

const algo2 = flow(
    parse,
    (grid) => {
        const from = '0,1', to = (Matrices.nbRows(grid)-1)+','+(Matrices.nbCols(grid)-2);

        const nodes: Record<string, Node> = pipe(grid,
            Matrices.filterPoints(v => v !== '#'),
            Arrays.map(([r, c]) => [
                [r, c].toString(),
                pipe(
                    Matrices.getNeighbors(grid)([r, c]),
                    Arrays.filter((p) => Matrices.at(grid)(p) !== '#'),
                    Arrays.map(Objects.apply({
                        to: Vector.toString,
                        cost: () => 1
                    }))
                )
            ] as const),
            Objects.fromEntries
        );

        pipe(nodes,
            Objects.filter((succ) => succ.length === 2),
            Objects.keys,
        ).forEach(m => {
            const [a, b] = nodes[m];
            replace(nodes[a.to], m, b);
            replace(nodes[b.to], m, a);
            delete nodes[m];
        });

        return explore3(nodes, from, to);
    }
)

runStep(__dirname, 'step1', 'example0', algo1, 11);
runStep(__dirname, 'step1', 'example', algo1, 94);
runStep(__dirname, 'step1', 'real', algo1, 2250);
runStep(__dirname, 'step2', 'example0', algo2, 11);
runStep(__dirname, 'step2', 'example', algo2, 154);
runStep(__dirname, 'step2', 'real', algo2, 6470, true);
