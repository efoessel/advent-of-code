import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Stream, parseBlocks } from '../../utils/@index';

type Point = {x: number, y: number};

const parse = flow(
    parseBlocks('\n', (line => {
        return line
    })),
);

const getPipe = (maze: string[], pos: Point) => maze[pos.y].at(pos.x)!

const findS = (maze: string[]) => {
    const y = maze.findIndex(l => l.includes('S'));
    const x = maze[y].indexOf('S');
    return {x, y};
}

const connectedTo = (maze: string[], pos: Point) => ({
    '|': [{x: pos.x, y: pos.y-1}, {x: pos.x, y: pos.y+1}],
    '-': [{x: pos.x-1, y: pos.y}, {x: pos.x+1, y: pos.y}],
    'L': [{x: pos.x, y: pos.y-1}, {x: pos.x+1, y: pos.y}],
    'J': [{x: pos.x, y: pos.y-1}, {x: pos.x-1, y: pos.y}],
    '7': [{x: pos.x, y: pos.y+1}, {x: pos.x-1, y: pos.y}],
    'F': [{x: pos.x, y: pos.y+1}, {x: pos.x+1, y: pos.y}],
}[getPipe(maze, pos)]);

const findNext = (maze: string[], prev: Point, pos: Point) =>
    connectedTo(maze, pos)!.find(({x, y}) => x !== prev.x || y !== prev.y)!

const findFirst = (maze: string[], s: Point) => ([
    {x: s.x+1, y: s.y},
    {x: s.x-1, y: s.y},
    {x: s.x, y: s.y+1},
    {x: s.x, y: s.y-1},
].filter(({x, y}) => x > 0 && y > 0 && x < maze[0].length && y < maze.length)
.find(p => connectedTo(maze, p)?.some(({x, y}) => x === s.x && y === s.y))!)

const triangleArea = (s: Point, from: Point, to: Point) => {
    if(from.x === to.x) {
        return (to.y-from.y)*(to.x - s.x)/2;
    } else {
        return (to.x-from.x)*(s.y - to.y)/2;
    }
}

const explore = (maze: string[]) => {
    const s = findS(maze);
    return Stream.loopUntil(
        ({pos}) => getPipe(maze, pos) === 'S',
        ({pos, cnt, prev, area}) => {
            const next = findNext(maze, prev, pos);
            return {
                prev: pos,
                cnt: cnt + 1,
                pos: next,
                area: area + triangleArea(s, pos, next)
            }
        },
        {pos: findFirst(maze, s), prev: s, cnt: 1, area: 0}
    );
};

const algo1 = flow(
    parse,
    explore,
    ({cnt}) => cnt / 2
);

const algo2 = flow(
    parse,
    explore,
    ({cnt, area}) => Math.abs(area) + 1 - cnt/2
);

runStep(__dirname, 'step1', 'example', algo1, 4);
runStep(__dirname, 'step1', 'example1', algo1, 8);
runStep(__dirname, 'step1', 'real', algo1, 6846);
runStep(__dirname, 'step2', 'example', algo2, 1);
runStep(__dirname, 'step1', 'example2', algo2, 4);
runStep(__dirname, 'step1', 'example3', algo2, 8);
runStep(__dirname, 'step2', 'real', algo2, 325);
