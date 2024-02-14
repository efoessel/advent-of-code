import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Vector, Parse, parseBlocks } from '../../utils/@index';


const parse = flow(
    parseBlocks('\n', parseBlocks(' -> ', Parse.extractIntArray)),
    
    (lines) => {
        const maxY = Arrays.max(lines.flatMap(line => line.map(pt => pt[1])));
        const blocked = new Set<string>();

        lines.forEach(line => line.reduce((prev, curr) => {
            Arrays.rangeI(prev[0], curr[0])
                .flatMap((x) =>  Arrays.rangeI(prev[1], curr[1]).map((y) => ([x, y])))
                .forEach(p => blocked.add(p.toString()))
            return curr;
        }));
        
        return {
            maxY,
            blocked,
        };
    }
);


// Depth-first exploration, counting the places we have to go back
function findTheAbyss(blocked: Set<string>, maxY: number, start: Vector) {
    type S = {found: boolean, cnt: number, explored: Set<string>};

    function findTheAbyssInternal(explored: Set<string>, p: Vector): S {
        if(blocked.has(p.toString()) || explored.has(p.toString())) {
            return { found: false, cnt: 0, explored };
        } else if(p[1] > maxY) {
            return { found: true, cnt: 0, explored };
        }
    
        const fromHere = [0, -1, 1].reduce((prev, dir) => {
            if(prev.found) return prev;
            const curr = findTheAbyssInternal(prev.explored, Vector.add(p, [dir, 1]));
            return {
                ...curr,
                cnt: prev.cnt + curr.cnt,
            };
        }, {found: false, cnt: 0, explored} as S);
    
        return {
            found: fromHere.found,
            cnt: fromHere.cnt + (fromHere.found?0:1),
            explored: fromHere.explored.add(p.toString()), // pretend it's an immutable set addition
        };
    }

    return findTheAbyssInternal(new Set(), start);
}

const algo1 = flow(
    parse,
    ({maxY, blocked}) => findTheAbyss(blocked, maxY, [500, 0]).cnt
);

// Breadth-first exploration, just count the number of reachable positions
function findReachable(blocked: Set<string>, maxY: number, start: Vector) {
    function findReachableInternal(y: number, xs: number[]): number {
        if(y === maxY + 1) return 0;
        const nextLine = pipe(
            xs,
            Arrays.flatMap(x => ([x-1, x, x+1])),
            Arrays.asSet,
            Arrays.filter(x => !blocked.has([x, y+1].toString()))
        );
        return nextLine.length + findReachableInternal(y+1, nextLine);
    }

    return findReachableInternal(start[1], [start[0]]) + 1;
}

const algo2 = flow(
    parse,
    ({maxY, blocked}) => findReachable(blocked, maxY, [500, 0]),
);

runStep(__dirname, 'step1', 'example', algo1, 24);
runStep(__dirname, 'step1', 'real', algo1, 843);
runStep(__dirname, 'step2', 'example', algo2, 93);
runStep(__dirname, 'step2', 'real', algo2, 27625);

// import './naive'
