import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, findTargetBFS, parseBlocks } from '../../utils/@index';

type Point = {x: number, y: number};

const selectColumn = (array: string[][], x: number) => array.map((_, y) => array[y][x]);

const shiftedMod = (a: number, d: number) => ((a-1)%(d-2) + (d-2))%(d-2) + 1;

const parse = parseBlocks('\n', parseBlocks('', identity));

const makeNavigationMethods = (lines: string[][]) => {
    const width = lines[0].length;
    const height = lines.length;
    const columns = Arrays.range(0, width).map((x) => selectColumn(lines, x));

    function hasBlizzard (p: Point, t: number) {
        return lines[p.y][shiftedMod(p.x + t, width)] === '<'
            || lines[p.y][shiftedMod(p.x - t, width)] === '>'
            || columns[p.x][shiftedMod(p.y + t, height)] === '^'
            || columns[p.x] [shiftedMod(p.y - t, height)] === 'v'
    }

    const isWall = (p: Point) => p.x === 0  || p.x === width - 1
            || p.y === 0 && p.x !== 1 || p.y < 0
            || p.y === height-1 && p.x !== width - 2 || p.y >= height;

    return {
        isExit: (p: Point) => p.x === width-2 && p.y === height-1,
        isEntrance: (p: Point) => p.x === 1 && p.y === 0,
        getNextStates: (startingTime: number) => (state: Point, t: number): Point[] => {
            return [
                {x: state.x, y:state.y},
                {x: state.x+1, y:state.y},
                {x: state.x-1, y:state.y},
                {x: state.x, y:state.y+1},
                {x: state.x, y:state.y-1},
            ].filter(p => !isWall(p) && !hasBlizzard(p, startingTime+t+1))
        }
    };
};

const getStateKey = (s: Point, t: number) => `${s.x},${s.y},${t}`;

const algo1 = flow(
    parse,
    makeNavigationMethods,
    (methods) => findTargetBFS<Point>(
        [{x: 1, y: 0}],
        methods.isExit,
        methods.getNextStates(0),
        getStateKey,
    )!,
    (([time]) => time)
);

const algo2 = flow(
    parse,
    makeNavigationMethods,
    (methods) => {
        const goto = (to: (p: Point) => boolean) => ([startingTime, from]: [number, Point]) => pipe(
            findTargetBFS<Point>(
                [from], to,
                methods.getNextStates(startingTime),
                getStateKey,
            )!,
            ([time, p]): [number, Point] => [time + startingTime, p]
        );

        return pipe(
            [0, {x: 1, y: 0}],
            goto(methods.isExit),
            goto(methods.isEntrance),
            goto(methods.isExit),
            ([time]) => time,
        );
    },
);

runStep(__dirname, 'step1', 'example', algo1, 18);
runStep(__dirname, 'step1', 'real', algo1, 297);
runStep(__dirname, 'step2', 'example', algo2, 54);
runStep(__dirname, 'step2', 'real', algo2, 856);
