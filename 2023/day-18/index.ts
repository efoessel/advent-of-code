import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Vector, parseBlocks } from '../../utils/@index';

type Dir = 'U'|'L'|'R'|'D';
type State = {
    pos: Vector;
    area: number;
    length: number;
};

const parse = flow(
    parseBlocks('\n', flow(
        line => line.split(' '),
        ([dir, len, color]) => ({
            dir: dir as Dir,
            len: parseInt(len),
            color,
        })
    )),
);

const triangleArea = (s: Vector, from: Vector, to: Vector) => {
    if(from[0] === to[0]) {
        return (to[1]-from[1])*(to[0] - s[0])/2;
    } else {
        return (to[0]-from[0])*(s[1] - to[1])/2;
    }
}

const getMoveDir = (dir: Dir) => ({
    'U': [0, -1],
    'D': [0, 1],
    'L': [-1, 0],
    'R': [1, 0],
}[dir]);

const move = (state: State, dir: Dir, len: number) => {
    const newPos = Vector.add(state.pos, Vector.mult(len, getMoveDir(dir)));
    return {
        pos: newPos,
        area: state.area + triangleArea([0, 0], state.pos, newPos),
        length: state.length + len
    }
}

const algo1 = flow(
    parse,
    Arrays.reduce(
        (state, {dir, len}) => move(state, dir, len),
        {pos: [0, 0], area: 0, length: 0}
    ),
    ({area, length}) => Math.abs(area) + length/2 + 1
);

const algo2 = flow(
    parse,
    Arrays.map(({color}) => ({
        len: parseInt('0x'+color.substring(2, 7)),
        dir: (['R', 'D', 'L', 'U'] as const)[parseInt(color.charAt(7))]
    })),
    Arrays.reduce(
        (state, {dir, len}) => move(state, dir, len),
        {pos: [0, 0], area: 0, length: 0}
    ),
    ({area, length}) => Math.abs(area) + length/2 + 1
)

runStep(__dirname, 'step1', 'example', algo1, 62);
runStep(__dirname, 'step1', 'real', algo1, 39194);
runStep(__dirname, 'step2', 'example', algo2, 952408144115);
runStep(__dirname, 'step2', 'real', algo2, 78242031808225);
