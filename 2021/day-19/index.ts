import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, Parse, Strings, Vector, castTo, Stream } from '../../utils/@index';
import { Vector3d, Geometry3d } from '../../utils/geometry/geometry-3d';

type Scanner = Vector3d[];
type ScannerPrepared = {
    scanner: Scanner,
    distances: number[],
}

const parse = flow(
    Strings.split('\n\n'),
    Arrays.map(flow(
        Strings.split('\n'),
        Arrays.slice(1),
        Arrays.map(Parse.extractIntArray),
        castTo<Scanner>
    ))
);

const rotateScanner = (s: Scanner, rot: Geometry3d.Rotation) => pipe(s, Arrays.map(rot));

const shiftScanner = (s: Scanner, vect: Vector3d) => pipe(s,
    Arrays.map(x => Vector.sub(x, vect))
);


// comparing distances between pairs of beacons is a fast heuristic to find sensors that may match. If two sensors dont have at least 66 common distances, they can't have 1 common beacons.
const prepareDistances: (s: Scanner) => ScannerPrepared = Objects.apply({
    scanner: identity<Scanner>,
    distances: flow(Arrays.getPairs, Arrays.map(([a, b]) => Vector.manhattanDist(a, b)), Arrays.sortNumbers('ASC', identity)),
})

// fast method to find common ground between 2 sorted list of numbers
const distancesMatch = (s1: number[], s2: number[]) => {
    let p1 = 0, p2 = 0, m = 0;
    while(p1 < s1.length && p2 < s2.length && m<66) {
        const n1 = s1[p1], n2 = s2[p2];
        if(n1 <= n2) p1++;
        if(n1 >= n2) p2++;
        if(n1 == n2) m++;
    }
    return m === 66;
}

const tryMerge = (s1: Scanner, s2: Scanner) => {
    const s1AsSet = new Set(s1.map(Vector.toString));
    const matches = (s2: Scanner) => {
        let cnt = 0;
        for(const b of s2) {
            if(s1AsSet.has(b.toString())) {
                if(++cnt >= 12) return true;
            }
        }
        return false;
    }

    return Stream.fromIterable(Geometry3d.allRotations)
        .map((rot) => rotateScanner(s2, rot)) // test all rotations
        .flatMap(rotatedS2 => Stream.fromCrossProduct(s1, rotatedS2) // test to match all pairs of points
            .map(([s1b, s2b]) => Vector.sub(s2b, s1b))
            .map((translation) => {
                const aligned = shiftScanner(rotatedS2, translation);
                return {
                    matches: matches(aligned),
                    aligned,
                    translation,
                }
            })
            .filter(Objects.pluck('matches')),
        )
        .first();
}

const mergeAll = (scanners: ScannerPrepared[]) => {
    const [s0, ...rest] = scanners;
    let alive = [{aligned: s0, translation: [0, 0, 0]}];
    let todo = rest;
    let done: typeof alive = [];
    while(todo.length > 0 && alive.length > 0) {
        const attempt = todo.map(s2 => {
            for(const a of alive) {
                if(distancesMatch(a.aligned.distances, s2.distances)) {
                    const test = tryMerge(a.aligned.scanner, s2.scanner);
                    if(test) {
                        return {
                            matches: true,
                            aligned: {
                                scanner: test.aligned,
                                distances: s2.distances
                            },
                            translation: test.translation
                        }
                    }
                }
            }
            return {matches: false, aligned: s2, translation: [0, 0, 0]};
        });
        done = done.concat(alive);
        alive = attempt.filter(a => a.matches);
        todo = attempt.filter(a => !a.matches).map(a => a.aligned);
    }
    done = done.concat(alive);
    return done;
}


const algo1 = flow(
    parse,
    Arrays.map(prepareDistances),
    mergeAll,
    Arrays.map(flow(Objects.pluck('aligned'), Objects.pluck('scanner'))),
    Arrays.flatMap(identity),
    Arrays.asSetUsing(Vector.toString),
    Arrays.length,
);

const algo2 = flow(
    parse,
    Arrays.map(prepareDistances),
    mergeAll,
    Arrays.map(Objects.pluck('translation')),
    Arrays.getPairs,
    Arrays.map(([a, b]) => Vector.manhattanDist(a, b)),
    Arrays.max
)

runStep(__dirname, 'step1', 'example', algo1, 79);
runStep(__dirname, 'step1', 'real', algo1, 381);
runStep(__dirname, 'step2', 'example', algo2, 3621);
runStep(__dirname, 'step2', 'real', algo2, 12201);
