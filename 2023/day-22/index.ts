import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, Vector, parseBlocks } from '../../utils/@index';
import { Matrices } from '../../utils/grids';

type Brick = {
    id: number,
    surface: Vector[],
    zmin: number,
    zmax: number
}


const surface = (b1: Vector, b2: Vector) => Arrays.crossProduct([
    Arrays.rangeI(b1[0], b2[0]),
    Arrays.rangeI(b1[1], b2[1])
]) as unknown as Vector[];

const parse = flow(
    parseBlocks('\n', line => line.split('~')),
    Matrices.map(x => Parse.extractIntArray(x) as Vector),
    Arrays.map(([b1, b2], i): Brick => ({
        id: i,
        surface: surface(b1, b2),
        zmin: Math.min(b1[2], b2[2]),
        zmax: Math.max(b1[2], b2[2])
    }))
);

type BrickWithSupports = Brick & {
    potentialSupports: number[]
}

const findPotentialSupports = (b: Brick, all: readonly Brick[]): BrickWithSupports => {
    const supports = b.surface.map((s) => all.reduce((best: Brick | undefined, curr) => {
        if(curr.zmax >= b.zmin) return best;
        if(curr.surface.find(c => Vector.equals(c, s))) {
            return (best?.zmax ?? 0) > curr.zmax ? best : curr;
        }
        return best;
    }, undefined));
    return {
        ...b,
        potentialSupports: pipe(supports,
            Arrays.asSet,
            Arrays.filterNullable,
            Arrays.map(s => s.id)
        ),
    }
};

const settle = (all: BrickWithSupports[]) => {
    const settled = new Map<number, number>();
    let waiting: BrickWithSupports[] = all.filter(b => b.potentialSupports.length > 0);
    let ready: BrickWithSupports[] = all.filter(b => b.potentialSupports.length === 0);

    while(ready.length) {
        // console.log(ready.map(print), waiting.map(print), [...settled].map(([b, x]) => print(b)+'*'+x));
        ready.forEach(curr => {
            const supportsHeight = Math.max(0, Arrays.max(curr.potentialSupports.map(b => settled.get(b)! + all[b].zmax - all[b].zmin)));
            settled.set(curr.id, supportsHeight + 1);
        });
        ready = waiting.filter(b => b.potentialSupports.every(s => settled.has(s)));
        waiting = waiting.filter(w => !ready.includes(w));
    }
    return settled
}

const findActualSupports = (b: BrickWithSupports, settled: Map<number, number>, all: BrickWithSupports[]) => b.potentialSupports.filter(
    s => {
        // console.log(b.id, s.id, settled.get(s)! + s.zmax - s.zmin, b.zmin - 1)
        return settled.get(s)! + all[s].zmax - all[s].zmin === settled.get(b.id)! - 1
    }
);

const findActualSupported = (b: BrickWithSupports, actualSupports: number[][]) => actualSupports
    .map((supp, i) => [i, supp] as const)
    .filter(([,supp]) => supp.includes(b.id))
    .map(([i]) => i)

const algo1 = flow(
    parse,
    Arrays.map((b, i, all) => findPotentialSupports(b, all)),
    (all) => {
        const settled = settle(all);
        const supports = all.map(b => findActualSupports(b, settled, all));
        const uniqueSupports = Arrays.asSet(supports.filter(s => s.length === 1).map(x => x[0]));
        return all.length - uniqueSupports.length;
    },
);

const algo2 = flow(
    parse,
    Arrays.map((b, i, all) => findPotentialSupports(b, all)),
    (all) => {
        const settled = settle(all);
        const actualSupports = all.map(b => findActualSupports(b, settled, all));
        const actualSupported = all.map(b => findActualSupported(b, actualSupports));

        return all.map((b, id) => {
            let nextToInspect = [id];
            const falling = new Set<number>(nextToInspect);

            while(nextToInspect.length) {
                const supported = Arrays.asSet(nextToInspect.flatMap(n => actualSupported[n]).filter(s => !falling.has(s)));
                nextToInspect = supported.filter(s => actualSupports[s].every(x => falling.has(x)));
                nextToInspect.forEach(f => falling.add(f));
            }

            return falling.size - 1;
        });
    },
    Arrays.sum
)

runStep(__dirname, 'step1', 'example', algo1, 5);
runStep(__dirname, 'step1', 'real', algo1, 451);
runStep(__dirname, 'step2', 'example', algo2, 7);
runStep(__dirname, 'step2', 'real', algo2, 66530);
