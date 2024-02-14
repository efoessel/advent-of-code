import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Intervals, Parse, parseBlocks, Vector } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', Parse.extractIntArray),
    Arrays.map(([a, b, c, d]) => ({
        pos: [a, b],
        beacon: [c, d],
        distance: Vector.manhattanDist([a, b], [c, d]),
    })),
);

const algo1 = (line: number) => flow(
    parse,
    (sensors) => pipe(
        sensors,
        // Compute for each sensor the interval blocked on the line (but they may overlap)
        Arrays.flatMap(({pos, distance}) => {
            const distanceFromLine = Math.abs(pos[1]-line);
            const left = pos[0] - (distance-distanceFromLine);
            const right = pos[0] + (distance-distanceFromLine);
            if((distanceFromLine) > distance) return [];
            return [Intervals.fromIntegersIncluded(left, right)];
        }),
        // Exclude overlapping parts
        Arrays.flatMap((int, i, all) => {
            return all.slice(0, i).reduce((res, curr) => {
                return res.flatMap(i => Intervals.exclude(i, curr));
            }, [int]);
        }),
        // now just count the size
        Arrays.map(Intervals.length),
        Arrays.sum,
        // but remove the number of beacons that are on the line as they don't count as blocking
        (sum) => {
            const beaconCnt = pipe(
                sensors.map(b => b.beacon),
                Arrays.asSetWithCustomEqual(Vector.equals),
                Arrays.count(b => b[1] === line)
            )
            return sum - beaconCnt;
        }
    )
);

// this algo would not work in some cases (if the cell to find is located on the edges of the area)
const algo2 = flow(
    parse,
    (sensors) => pipe(sensors,
         // find pairs of beacon that are distanced for each other so that the only let one space
        Arrays.getPairs,
        Arrays.filter(([b1, b2]) => Vector.manhattanDist(b1.pos, b2.pos) === b1.distance + b2.distance + 2),
        Arrays.map(([b1, b2]) => b1.pos[0] < b2.pos[0] ? [b1, b2] : [b2, b1]), // leftmost first
        Arrays.partition(([b1, b2]) => b1.pos[1] < b2.pos[1]),

        // find points that seem to be stuck between 4 sensors
        // finds the intersection between the end of the exclusion zone of the pairs
        // might not even be close to any of them, as we find the intersection between two infinite straight lines
        // lots of false positive, but reasonable candidates to check more thoroughly
        Arrays.crossProduct,
        Arrays.map(([[p1], [q1]]) => ([ 
            (p1.distance + q1.distance + 2 + p1.pos[0] + p1.pos[1] + q1.pos[0] - q1.pos[1])/2,
            (p1.distance - q1.distance + p1.pos[0] + p1.pos[1] - q1.pos[0] + q1.pos[1])/2
        ])),
        Arrays.asSetWithCustomEqual(Vector.equals),
        
        // test candidates with the true condition
        Arrays.filter((candidate) => sensors.every((s) => Vector.manhattanDist(candidate, s.pos) > s.distance)),
        ([[x, y]]) => 4000000*x+y
    )
)

runStep(__dirname, 'step1', 'example', algo1(10), 26);
runStep(__dirname, 'step1', 'real', algo1(2000000), 5525847);
runStep(__dirname, 'step2', 'example', algo2, 56000011);
runStep(__dirname, 'step2', 'real', algo2, 13340867187704);
