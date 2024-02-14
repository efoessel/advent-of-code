import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Interval, Intervals, Parse, Stream } from '../../utils/@index';

const parse = flow(
    Parse.extractIntArray,
    ([x1, x2, y1, y2]) => ({
        x: Intervals.fromIntegersIncluded(x1, x2),
        y: Intervals.fromIntegersIncluded(y1, y2),
    }),
);

const inTarget = (ix: Interval, iy: Interval, x: number, y: number) => Intervals.includedIn(ix)(x) && Intervals.includedIn(iy)(y);

const test = (vx: number, vy: number, ix: Interval, iy: Interval) => pipe(
    Stream.loop(),
    Stream.reduceUntil(
        ({x, y}) => y < iy.from || inTarget(ix, iy, x, y),
        ({x, y, vx, vy}) => ({
            x: x+vx,
            y: y+vy,
            vx: Math.max(vx-1, 0),
            vy: vy - 1
        }),
        {x: 0, y: 0, vx, vy}
    ),
    ({x, y}) => inTarget(ix, iy, x, y)
)

const acceptableY = (iy: Interval) => pipe(
    Arrays.rangeI(iy.from, -iy.from),
    Arrays.filter(vy => test(0, vy, Intervals.ALL, iy))
);

const acceptableX = (ix: Interval) => pipe(
    Arrays.rangeI(1, ix.to),
    Arrays.filter(vx => pipe(
        Stream.loop(),
        Stream.reduceUntil(
            ({x, vx}) => vx <= 0 || Intervals.includedIn(ix)(x),
            ({x, vx}) => ({
                x: x+vx,
                vx: Math.max(vx-1, 0),
            }),
            {x: 0, vx}
        ),
        ({x}) => Intervals.includedIn(ix)(x)
    ))
);

const algo1 = flow(
    parse,
    ({y}) => acceptableY(y),
    Arrays.max,
    y => y * (y+1)/2
);

const algo2 = flow(
    parse,
    ({x, y}) => pipe([acceptableX(x), acceptableY(y)] as const,
        Arrays.crossProduct,
        Arrays.count(([vx, vy]) => test(vx, vy, x, y))
    )
);

runStep(__dirname, 'step1', 'example', algo1, 45);
runStep(__dirname, 'step1', 'real', algo1, 4560);
runStep(__dirname, 'step2', 'example', algo2, 112);
runStep(__dirname, 'step2', 'real', algo2, 3344);
