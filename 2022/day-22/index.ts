import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Parse, parseBlocks } from '../../utils/@index';

type Dir = 'L'|'R'|undefined;

const parse = flow(
    (str: string) => {
        const [map, path] = str.split('\n\n');
        return {
            map: parseBlocks('\n', l => parseBlocks('', identity)(l.padEnd(150, ' ')))(map),
            path: path.match(/(\d+\D?)/g)!.map(s => ({nb: Parse.extractInt(s), dir: s.substring(s.length-1) as Dir}))
        }
    }
);

const vectDir = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
];


const algo1 = flow(
    parse,
    ({map, path}) => {
        let x = map[0].indexOf('.');
        let y = 0;
        let dir = 0;

        for(let ptr = 0 ; ptr < path.length ; ptr++) {
            const step = path[ptr];
            const vdir = vectDir[dir];
            for(let n = 0 ; n < step.nb ; n++) {
                let nextx = (x + vdir[0] + map[0].length) % map[0].length, nexty = (y + vdir[1] + map.length) % map.length;
                while(map[nexty][nextx] == ' ') {
                    nextx = (nextx + vdir[0] + map[0].length) % map[0].length;
                    nexty = (nexty + vdir[1] + map.length) % map.length;
                }
                if(map[nexty][nextx] == '#') {
                    break;
                } else {
                    x = nextx;
                    y = nexty;
                }
            }
            if(step.dir === 'L') {
                dir = (dir + 3)%4;
            } else if(step.dir === 'R') {
                dir = (dir + 1)%4;
            }
            // console.log(x, y, dir)
        }

        return [x, y, dir];
    },

    ([x, y, dir]) => 1000*(y+1)+4*(x+1)+dir
);

const cubeSize = 50
const region = (x: number, y: number) => Math.floor(y/cubeSize)*3+Math.floor(x/cubeSize);

function doStep(map: string[][], x: number, y: number, dir: number): [number, number, number] {
    const r0 = region(x, y);
    const vdir = vectDir[dir];
    let nextx = (x + vdir[0] + map[0].length) % map[0].length, nexty = (y + vdir[1] + map.length) % map.length;
    let newDir = dir;
    const r1 = region(nextx, nexty);

    if(r0 !== r1) {
        if(r0 === 1) {
            if(r1 === 0) {
                nextx = 0;
                nexty = 149 - y;
                newDir = 0;
            } else if(r1 === 10) {
                nextx = 0;
                nexty = 100 + x;
                newDir = 0;
            }
        } else if(r0 === 2) {
            if(r1===11) {
                nextx = x - 100;
                nexty = 199;
                newDir = 3;
            } else if(r1 === 0) {
                nextx = 99;
                nexty = 149-y;
                newDir = 2;
            } else if(r1 === 5) {
                nextx = 99;
                nexty = x - 50;
                newDir = 2;
            }
        } else if(r0 === 4) {
            if(r1===3) {
                nexty=100;
                nextx=y-50;
                newDir = 1;
            } else if(r1 === 5) {
                nexty = 49;
                nextx = y + 50;
                newDir = 3;
            }
        } else if (r0===6) {
            if(r1===3) {
                nextx = 50;
                nexty = 50+x;
                newDir = 0;
            } else if(r1===8) {
                nextx = 50;
                nexty = 149-y;
                newDir = 0;
            }
        } else if (r0 === 7) {
            if(r1 === 8) {
                nextx = 149;
                nexty = 149 - y;
                newDir = 2;
            } else if(r1 === 10) {
                nextx = 49;
                nexty = 100+x;
                newDir = 2;
            }
        } else if( r0 === 9) {
            if(r1===11) {
                nexty = 0;
                nextx = y - 100;
                newDir = 1;
            } else if(r1===10) {
                nexty = 149;
                nextx = y - 100;
                newDir = 3;
            } else if(r1===0) {
                nexty=0;
                nextx=x+100;
                newDir = 1;
            }
        }
    }

    return [nextx, nexty, newDir];
}

const algo2 = flow(
    parse,
    ({map, path}) => {
        let x = map[0].indexOf('.');
        let y = 0;
        let dir = 0;

        for(let ptr = 0 ; ptr < path.length ; ptr++) {
            const step = path[ptr];
            for(let n = 0 ; n < step.nb ; n++) {
                const [nextx, nexty, nextDir] = doStep(map, x, y, dir);
                if(map[nexty][nextx] == '#') {
                    break;
                } else {
                    [x, y, dir] = [nextx, nexty, nextDir];
                }
            }
            if(step.dir === 'L') {
                dir = (dir + 3)%4;
            } else if(step.dir === 'R') {
                dir = (dir + 1)%4;
            }
        }

        return [x, y, dir];
    },

    ([x, y, dir]) => 1000*(y+1)+4*(x+1)+dir
);

// assert2(__dirname, 'step2', algo2, {'example': 6032, 'real': 190066});
// assert2(__dirname, 'step2', algo2, {'example': 5031, 'real': 134170});
runStep(__dirname, 'step1', 'example', algo1, 6032);
runStep(__dirname, 'step1', 'real', algo1, 190066);
// runStep(__dirname, 'step2', 'example', algo2, 5031);
runStep(__dirname, 'step2', 'real', algo2, 134170);
