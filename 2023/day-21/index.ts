import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Matrices, Matrix, Objects, Stream, Vector, memo, parseBlocks } from '../../utils/@index';

const NOT_EXPLORED = 50000000;
const BLOCKED = 500000000;

const parse2 = flow(
    parseBlocks('\n', (line => {
        return line.split('')
    })),
    Objects.apply({
        s: flow(
            Matrices.filterPoints(v => v === 'S'),
            Arrays.atUnsafe(0)
        ),
        grid: Matrices.map((v) => v === '#' ? BLOCKED : NOT_EXPLORED)
    }),
);

type EntryPoint = readonly [number, number];

const computeBloc = (grid: Matrix<number>, s: EntryPoint) => {
    const initializedGrid = pipe(grid, Matrices.map((v, p) => {
        return Vector.equals(s, p) ? 0 : v;
    }));
    
    return Stream.loopUntilStable(
         Matrices.reduce((cnt, v) => cnt + v, 0),
        g => pipe(g, Matrices.map((v, p) => v <= NOT_EXPLORED
            ? Math.min(v, Arrays.min(Matrices.getNeighborValues(g)(p)) + 1)
            : BLOCKED
        )),
        initializedGrid
    );
};

type Block = {
    rank: number,
    position: {x: number, y: number},
    limit: number,
}

/**
 * Assumptions: start is in the middle & full line & column of start are empty
 */
const solve = (grid: Matrix<number>, steps: number) => {
    const width = grid[0].length, height = grid.length;
    const gridSize = (rank: number) => Math.pow(3, rank-1)*height;
    const startingPoints: EntryPoint[][] = [width-1, Math.floor(width/2), 0].map(c => [height-1, Math.floor(height/2), 0].map(r => [r, c]));

    const computeBloc2 = memo((s: EntryPoint) => {
        const rgrid = computeBloc(grid, s);
        const max = pipe(rgrid, Matrices.reduce((m, v) => v < NOT_EXPLORED ? Math.max(m, v) : m, -Infinity));
        const res: number[] = new Array(max + 1).fill(0);
        pipe(rgrid, Matrices.filter(v => v < NOT_EXPLORED)).forEach((v) => res[v]++)
        res.forEach((r, i) => {
            if(i > 1) res[i] += res[i-2];
        });
        return res;
    });

    const memoHash = (block: Block) => `"${block.rank}, ${Math.sign(block.position.x)}, ${Math.sign(block.position.y)}, ${Math.min(block.limit, gridSize(block.rank)*2 + block.limit%2)}"`;
    const reduceBlocks = memo(
        (block: Block): number => {
            if(block.rank === 1) {
                const start = startingPoints[Math.sign(block.position.x)+1][Math.sign(block.position.y)+1];
                const res = computeBloc2(start);
                const idx = block.limit > res.length-1 ? (block.limit - res.length-1) % 2 === 0 ? res.length-1 : res.length-2 : block.limit;
                return res[idx];
            } else {
                return Arrays.sum(Arrays.crossProduct([[-1, 0, 1], [-1, 0, 1]])
                    .map(([dx, dy]) => {
                        const size = gridSize(block.rank - 1);
                        const x = 3*block.position.x+dx;
                        const y = 3*block.position.y+dy;
                        const xc = x === 0 ? 0 : (size+1)/2 + size*(Math.abs(x)-1);
                        const yc = y === 0 ? 0 : (size+1)/2 + size*(Math.abs(y)-1);
                        return {
                            rank: block.rank - 1,
                            limit: steps - xc - yc,
                            position: {x, y},
                        };
                    }).filter(
                        ({limit}) => limit >= 0
                    ).map(b => reduceBlocks(b)))
            }
        },
        memoHash
    );

    return reduceBlocks({
        rank: Math.ceil(Math.log(steps * 2 / height)/Math.log(3)) + 1,
        position: {x: 0, y: 0},
        limit: steps
    });
}



const algo1 = (steps: number) => flow(
    parse2,
    ({grid, s}) => computeBloc(grid, s),
    Matrices.filter(v => v % 2 === 0 && v <= steps),
    Arrays.length
);

const algo2 = (steps: number) => flow(
    parse2,
    ({grid}) => solve(grid, steps)
)

runStep(__dirname, 'step1', 'example', algo1(6), 16);
runStep(__dirname, 'step1', 'real', algo1(64), 3758);
runStep(__dirname, 'step2', 'example2', algo2(100), 10201);
runStep(__dirname, 'step2', 'real', algo2(26501365), 621494544278648, true);
