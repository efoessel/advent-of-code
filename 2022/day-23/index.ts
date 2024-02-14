import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { parseBlocks } from '../../utils/@index';

type Point = readonly [number, number];
const directions = ['U', 'D', 'L', 'R'] as const;
type Direction = typeof directions[number];

const parse = flow(
    parseBlocks('\n', parseBlocks('', identity)),
    (grid) => {
        const res = new Map<string, Point>();
        grid.forEach((line, y) => {
            line.forEach((cell, x) => {
                if(cell === '#') {
                    res.set([x, y].toString(), [x, y]);
                }
            });
            return res;
        });
        return res;
    }
);

function getAllNeighbors(x: number, y: number):  Point[] {
    return [-1, 0, 1].flatMap(a => [-1, 0, 1].map(b => ([x+a, y+b] as const))).filter(([a, b]) => a!==x || b!==y);
}

function getNeighborsInDirection(x: number, y: number, dir: Direction): Point[] {
    switch(dir) {
        case 'U': return [-1, 0, 1].map(d => ([x+d, y-1]));
        case 'D': return [-1, 0, 1].map(d => ([x+d, y+1]));
        case 'L': return [-1, 0, 1].map(d => ([x-1, y+d]));
        case 'R': return [-1, 0, 1].map(d => ([x+1, y+d]));
    }
}

function moveInDir(x: number, y: number, dir: Direction): Point {
    switch(dir) {
        case 'U': return [x, y-1];
        case 'D': return [x, y+1];
        case 'L': return [x-1, y];
        case 'R': return [x+1, y];
    }
}

function getProposition(grid: Map<string, Point>, [x, y]: Point, round: number) {
    if(getAllNeighbors(x, y).every((p) => !grid.has(p.toString()))) {
        return undefined;
    }
    for(let d = 0 ; d < 4 ; d++) {
        const dir = directions[(round+d)%4];
        if(getNeighborsInDirection(x, y, dir).every((p) => !grid.has(p.toString()))) {
            return moveInDir(x, y, dir);
        }
    }
}

function doOneRound(elves: Map<string, Point>, round: number) {
    const consideredPositions = new Map<string, number>();
    const propositions = new Map<Point, Point>();
    // step 1
    elves.forEach((e) => {
        const prop = getProposition(elves, e, round);
        if(prop === undefined) return;
        consideredPositions.set(prop.toString(), (consideredPositions.get(prop.toString()) ?? 0) +1);
        propositions.set(e, prop);
    });

    // step 2
    const newElves = new Map<string, Point>();
    let anyMoved = false;
    elves.forEach((e) => {
        const prop = propositions.get(e);
        if(prop === undefined || consideredPositions.get(prop.toString())! > 1) {
            newElves.set(e.toString(), e);
        } else {
            newElves.set(prop.toString(), prop);
            anyMoved = true;
        }
    });

    return [anyMoved, newElves] as const;
}

function computeExploredArea(elves: Point[]) {
    const minx = Math.min(...elves.map(e => e[0]));
    const miny = Math.min(...elves.map(e => e[1]));
    const maxx = Math.max(...elves.map(e => e[0]));
    const maxy = Math.max(...elves.map(e => e[1]));
    return (maxx - minx + 1)*(maxy - miny +1)-elves.length;
}

const algo1 = (nbRounds : number) => flow(
    parse,
    (elves) => {
        for(let round = 0 ; round < nbRounds ; round++) {
            [,elves] = doOneRound(elves, round);
        }
        return new Array(...elves.values());
    },
    computeExploredArea,
);

const algo2 = flow(
    parse,
    (elves) => {
        let round: number, anyMoved = true;
        for(round = 0 ; anyMoved ; round++) {
            [anyMoved, elves] = doOneRound(elves, round);
        }
        return round;
    },
);

runStep(__dirname, 'step1', 'example', algo1(10), 110);
runStep(__dirname, 'step1', 'real', algo1(10), 4052);
runStep(__dirname, 'step2', 'example', algo2, 20);
runStep(__dirname, 'step2', 'real', algo2, 978, true);
