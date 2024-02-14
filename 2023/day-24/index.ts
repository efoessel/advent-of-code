import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Interval, Intervals, Parse, Vector, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', (line => {
        const [pos, speed] = line.split(' @ ');
        return {
            pos: Parse.extractIntArray(pos),
            speed: Parse.extractIntArray(speed),
        }
    })),
);

type HailStone = {
    pos: Vector,
    speed: Vector,
}

const crossProd3d = (a: Vector, b: Vector) => [
    a[1]*b[2] - b[1]*a[2],
    b[0]*a[2] - a[0]*b[2],
    a[0]*b[1] - b[0]*a[1],
];

const normalize = (a: Vector) => {
    const n = Vector.norm2(a);
    const first = a.find(identity);
    return n === 0 ? a : Vector.mult(Math.sign(first ?? 0)/n, a);
}

// ax+by+c=0 => [a, b, c]
const toLineEquation = (h: HailStone) => {
    return [h.speed[1], -h.speed[0], h.pos[1]*h.speed[0]-h.pos[0]*h.speed[1]]
}

const lineEquationEquals = (a: Vector, b: Vector) => {
    if(a[0] === 0) return b[0]===0 && a[2]/a[1] === b[2]/b[1];
    return Vector.isZero(Vector.sub(Vector.div(a[0], a), Vector.div(a[0], b)))
    if(Math.abs(Vector.dotProd(a, b)) === Vector.norm2(a) * Vector.norm2(b)) {
        console.log(a, b)
        console.log(Math.abs(Vector.dotProd(a, b)), Vector.norm2(a) * Vector.norm2(b))
    }
    return Math.abs(Vector.dotProd(a, b)) === Vector.norm2(a) * Vector.norm2(b);
}

// Find intersection between 2 lines. returns undefined if there are none, or if the two lines are equal
const findIntersection2d = (h1: Vector, h2: Vector) => {
    const [px, py, pz] = crossProd3d(h1, h2)
    return pz === 0 ? undefined : [px/pz, py/pz];
}

const algo1 = (box: Interval) => flow(
    parse,
    Arrays.map(x => ({
        pos: x.pos.slice(0, 2),
        speed: x.speed.slice(0, 2),
        eq: toLineEquation(x),
    })),
    Arrays.getPairs,
    Arrays.map(([a, b]) => {
        const p = lineEquationEquals(a.eq, b.eq)
            ? b.pos
            : findIntersection2d(a.eq, b.eq);

        if(p) {
            const isFutureForA = Vector.dotProd(a.speed, Vector.sub(p, a.pos)) >= 0;
            const isFutureForB = Vector.dotProd(b.speed, Vector.sub(p, b.pos)) >= 0;
            return isFutureForA && isFutureForB ? p : undefined;
        }
        return undefined;
    }),
    Arrays.filter(p => p !== undefined && Intervals.includedIn(box)(p[0]) && Intervals.includedIn(box)(p[1])),
    Arrays.length

);


const posAtTime = (h: HailStone, t: number) => Vector.add(h.pos, Vector.mult(t, h.speed));


const algo2 = flow(
    parse,
    all => {
        const [ref, ...rest] = all;
        const normalizedRest = rest.map(({pos, speed}) => ({
            pos: Vector.sub(pos, ref.pos),
            speed: Vector.sub(speed, ref.speed)
        }));

        // normal vector to planes with both the ref and the h, stone trajectory must be in it
        const planes = normalizedRest.map(h => normalize(crossProd3d(h.pos, h.speed)));

        // pairwise intersection of planes, should always return the same values (with rounding errors), or there is no solution
        const intersects = Arrays.getPairs(planes).map(([pa, pb]) => crossProd3d(pa, pb))
        const stoneLineDir = Vector.div(intersects.length, Vector.addW(...intersects));

        // find the t at which the hailstone meets the stone trajectory
        const t = normalizedRest.map(h => {
            const n = crossProd3d(stoneLineDir, h.speed);
            return Vector.dotProd(crossProd3d(stoneLineDir, n), h.pos) / Vector.dotProd(n, n);
        }).map(Math.round);

        // deduce the stone speed
        const soonest = t.findIndex(m => m === Arrays.min(t))
        const latest = t.findIndex(m => m === Arrays.max(t))
        const speed = Vector.div(t[latest] - t[soonest], Vector.sub(
            posAtTime(normalizedRest[latest], t[latest]),
            posAtTime(normalizedRest[soonest], t[soonest]),
        ));

        // then the stone starting position
        const pos = Vector.sub(
            posAtTime(normalizedRest[soonest], t[soonest]),
            Vector.mult(t[soonest], speed)
        );

        // and un-normalize it
        return Vector.add(ref.pos, pos);
    },
    Arrays.sum

);

runStep(__dirname, 'step1', 'example', algo1(Intervals.fromIntegersIncluded(7, 28)), 2);
runStep(__dirname, 'step1', 'real', algo1(Intervals.fromIntegersIncluded(200000000000000, 400000000000001)), 28266);
runStep(__dirname, 'step2', 'example', algo2, 47);
runStep(__dirname, 'step2', 'real', algo2, 786617045860267);
