import { flow } from 'fp-ts/function'
import { assert } from '../../utils/run';
import { Arrays } from '../../utils/arrays';
import { Vector } from '../../utils/vectors';

const ROCKS = [
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, -1], [1, 0], [1, -1], [2, -1], [1, -2]],
    [[0, -2], [1, -2], [2, -2], [2, -1], [2, 0]],
    [[0, 0], [0, -1], [0, -2], [0, -3]],
    [[0, 0], [1, 0], [0, -1], [1, -1]],
];
const ROCK_HEIGHTS = [1, 3, 3, 4, 2];

type TetrisArea = (boolean|undefined)[][]
type State = {
    grid: TetrisArea,
    topHeight: number,
    windPtr: number,
};

function move(grid: TetrisArea, block: Vector[], move: Vector): [boolean, Vector[]] {
    let newBlockMaybe = block.map(p => Vector.add(p, move));
    if(newBlockMaybe.some(p => p[0]<0 || p[0]>6 || grid[p[0]][p[1]] === true)) {
        return [true, block];
    } else {
        return [false, newBlockMaybe];
    }
}

const doOneBlockBuilder = (winds: string) => ({grid,topHeight,windPtr}: State, blockPtr: number) => {
    let block = ROCKS[blockPtr].map(p => Vector.add(p, [2, topHeight + 3 + ROCK_HEIGHTS[blockPtr]]));
    let isBlocked = false;
    while(!isBlocked) {
        const windVector = winds.at(windPtr++ % winds.length) === '<' ? [-1, 0] : [1, 0];
        [, block] = move(grid, block, windVector);
        [isBlocked, block] = move(grid, block, [0, -1]);
    }

    block.forEach(p => grid[p[0]][p[1]] = true);
    
    return {
        grid,
        topHeight: Math.max(topHeight, Arrays.max(block.map(x => x[1]))),
        windPtr: windPtr % winds.length,
    }
}

const algo1 = flow(
    doOneBlockBuilder,
    (doOneBlock) => {
        let state: State = {
            grid: Arrays.range(0, 7).map((x) => Arrays.range(0, 10).map((y) => y===0)),
            topHeight: 0,
            windPtr: 0,
        }
        for(let i = 0 ; i < 2022 ; i++) {
            state = doOneBlock(state, i%ROCKS.length);
        }
        return state.topHeight;
    }
);

const hasStablePeriods = (pattern: number[], storedHeights: number[], targetPeriods: number) => {
    if(pattern.length < targetPeriods+1) return false;
    const from = pattern.length-targetPeriods;
    const isStable = (array: number[]) => {
        const period = array[from+1] - array[from];
        return array.every((x, i) => i<from || x-array[i-1]===period);
    }
    return isStable(pattern) && isStable(pattern.map(i => storedHeights[i]));
}

const algo2 = (targetNbOfRounds: number, targetStablePeriods: number) => flow(
    doOneBlockBuilder,
    (doOneBlock) => {
        const patterns = new Map<string, number[]>();
        const storedHeights: number[] = [];
        let maxPattern = 0;

        let state: State = {
            grid: Arrays.range(0, 7).map((x) => Arrays.range(0, 10).map((y) => y===0)),
            topHeight: 0,
            windPtr: 0,
        }
        for(let i = 0 ; ; i++) {
            state = doOneBlock(state, i%ROCKS.length);

            // store data for pattern matching on periodiv behavior
            storedHeights.push(state.topHeight);
            const key = i%ROCKS.length + '-' + state.windPtr;
            const storedOccurences = patterns.get(key) ?? [];
            storedOccurences.push(i);
            patterns.set(key, storedOccurences);

            // if it's a new longest pattern, check if it's long enough
            if(storedOccurences.length > maxPattern) {
                maxPattern = storedOccurences.length;
                if(hasStablePeriods(storedOccurences, storedHeights, targetStablePeriods)) {
                    const prevOccurence = storedOccurences[storedOccurences.length - 2]
                    return {
                        prevOccurence,
                        period: i - prevOccurence,
                        storedHeights,
                    }
                }
            }
        } 
    },
    ({ prevOccurence, period, storedHeights }) => {
        const hPeriod = storedHeights[prevOccurence + period] - storedHeights[prevOccurence];
        const nbOfPeriods = Math.floor((targetNbOfRounds - prevOccurence)/period);
        const startOfPeriodicPattern = targetNbOfRounds - nbOfPeriods*period;
        return storedHeights[startOfPeriodicPattern-1] + nbOfPeriods*hPeriod;
    }
);


assert(__dirname,
    algo1,
    // the targetStablePeriods param is a safety mechanic. Higher means algo waits more time before considering the periodic behavior is not a coincidence, but a real period.
    // 5 seems to be enough but might not be for other input data, even with 500 it's reasonably not-too-long (~10s).
    algo2(1000000000000, 5),
    [3191, 1572093023267]
);
