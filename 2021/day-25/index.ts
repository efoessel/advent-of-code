import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Matrices, Objects, Strings } from '../../utils/@index';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(Strings.split('')),
    Objects.apply({
        east: flow(Matrices.filterPoints(c => c === '>'), asMap),
        south: flow(Matrices.filterPoints(c => c === 'v'), asMap),
        width: Matrices.nbCols,
        height: Matrices.nbRows,
    }),
);

function asMap(cucumbers: (readonly [number, number])[]) {
    const m = new Map<string, readonly [number, number]>();
    cucumbers.forEach(p => m.set(p.toString(), p));
    return m;
}

type SubState = Map<string, readonly [number, number]>;
type State = {
    east: SubState, south: SubState,
    width: number, height: number
}

function moveSingleDirection(s: State, cucumbers: SubState, dir: [number, number]) {
    const res: SubState = new Map();
    let anyMoved = false;
    for(const [k,[r, c]] of cucumbers) {
        const newPos = [(r+dir[0])%s.height, (c+dir[1])%s.width] as const;
        const newPosKey = newPos.toString();
        if(s.east.has(newPosKey) || s.south.has(newPosKey)) {
            res.set(k, [r, c]);
        } else {
            res.set(newPosKey, newPos);
            anyMoved = true;
        }
    }
    return [res, anyMoved] as const;
}

function move(s: State) {
    const [east, anyMoved1] = moveSingleDirection(s, s.east, [0, 1]);
    const [south, anyMoved2] = moveSingleDirection({...s, east }, s.south, [1, 0]);
    return [{...s, east, south }, anyMoved1 || anyMoved2] as const
}

const algo1 = flow(
    parse,
    (s) => {
        let cnt=0, anyMoved = true;
        while(anyMoved) {
            [s, anyMoved] = move(s);
            cnt++;
        }
        return cnt;
    }
);


runStep(__dirname, 'step1', 'example', algo1, 58);
runStep(__dirname, 'step1', 'real', algo1, 278);
