import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, parseBlocks } from '../../utils/@index';

type Blueprint = {
    id: number,
    oreCost: number,
    clayCost: number,
    obsidianCost: [number, number],
    geodeCost: [number, number],
}

const parse = flow(
    parseBlocks('\n', (line): Blueprint => {
        const nums = Parse.extractIntArray(line);
        return {
            id: nums[0],
            oreCost: nums[1],
            clayCost: nums[2],
            obsidianCost: [nums[3], nums[4]],
            geodeCost: [nums[5], nums[6]],
        }
    }),
);

type S = Readonly<{
    oreRobots: number,
    clayRobots: number,
    obsidianRobots: number,
    geodeRobots: number,
    ore: number,
    clay: number,
    obsidian: number,
    geode: number
}>;

let cnt = 0;
function explore(blueprint: Blueprint, start: S, time: number) {
    const maxOreCost = Math.max(blueprint.oreCost, blueprint.clayCost, blueprint.obsidianCost[0], blueprint.geodeCost[0]);
    
    // manual pseudo-queue because js arrays as queue suck
    // would work with a simple alive array with pop / push & out-of order time exploration, but it would require to add time to the state for the set, which is much less efficient overall
    let alive = [start], nextAlive: S[] = [];
    const visited = new Set<string>();

    while(time > 0) {
        const curr = alive.pop();
        if(curr === undefined) {
            [alive, nextAlive] = [nextAlive, []];
            time -= 1;
            continue;
        }
        
        const geodeRobots = curr.geodeRobots,
            geode = curr.geode,
            // since we can't build more that one robot per round, there is no point in having more than the max cost for each resource
            oreRobots = Math.min(curr.oreRobots, maxOreCost),
            clayRobots = Math.min(curr.clayRobots, blueprint.obsidianCost[1]),
            obsidianRobots = Math.min(curr.obsidianRobots, blueprint.geodeCost[1]),
            // no point in having more ore that can be spent until the end
            ore = Math.min(curr.ore, maxOreCost*time - oreRobots*(time-1)),
            clay = Math.min(curr.clay, blueprint.obsidianCost[1]*time - clayRobots*(time-1)),
            obsidian = Math.min(curr.obsidian, blueprint.geodeCost[1]*time - obsidianRobots*(time-1));

        const currKey = [oreRobots,clayRobots,obsidianRobots,geodeRobots,ore,clay,obsidian,geode].toString();
        if(visited.has(currKey)) continue;
        visited.add(currKey);

        if(ore >= blueprint.oreCost) {
            nextAlive.push({
                oreRobots: oreRobots+1,clayRobots,obsidianRobots,geodeRobots,
                ore: ore+oreRobots-blueprint.oreCost,
                clay: clay+clayRobots,
                obsidian: obsidian+obsidianRobots,
                geode:geode+geodeRobots
            });
        }
        if(ore >= blueprint.clayCost) {
            nextAlive.push({
                oreRobots,clayRobots:clayRobots+1,obsidianRobots,geodeRobots,
                ore: ore+oreRobots-blueprint.clayCost,
                clay: clay+clayRobots,
                obsidian: obsidian+obsidianRobots,
                geode:geode+geodeRobots
            });
        }
        if(ore >= blueprint.obsidianCost[0] && clay >= blueprint.obsidianCost[1]) {
            nextAlive.push({
                oreRobots,clayRobots,obsidianRobots:obsidianRobots+1,geodeRobots,
                ore: ore+oreRobots-blueprint.obsidianCost[0],
                clay: clay+clayRobots-blueprint.obsidianCost[1],
                obsidian: obsidian+obsidianRobots,
                geode:geode+geodeRobots
            });
        }
        if(ore >= blueprint.geodeCost[0] && obsidian >= blueprint.geodeCost[1]) {
            nextAlive.push({
                oreRobots,clayRobots,obsidianRobots,geodeRobots: geodeRobots+1,
                ore: ore+oreRobots-blueprint.geodeCost[0],
                clay:clay+clayRobots,
                obsidian:obsidian+obsidianRobots-blueprint.geodeCost[1],
                geode:geode+geodeRobots
            });
        }
        nextAlive.push({
            oreRobots,clayRobots,obsidianRobots,geodeRobots,
            ore: ore+oreRobots,
            clay: clay+clayRobots,
            obsidian: obsidian+obsidianRobots,
            geode:geode+geodeRobots
        });

        if(++cnt % 1000000 === 0) {
            // console.log('running...', cnt/1000000+'M', 'states explored');
        }
    }
    return Arrays.max(alive.map(a => a.geode));
}

const initialState: S = {
    oreRobots: 1,
    clayRobots: 0,
    obsidianRobots: 0,
    geodeRobots: 0,
    ore: 0,
    clay: 0,
    obsidian: 0,
    geode: 0
};

const algo1 = flow(
    parse,
    Arrays.map((blueprint) => explore(blueprint, initialState, 24) * blueprint.id),
    Arrays.sum
);

const algo2 = flow(
    parse,
    (arr) => arr.slice(0, 3),
    Arrays.map((blueprint) => explore(blueprint, initialState, 32)),
    Arrays.prod
);

runStep(__dirname, 'step1', 'example', algo1, 33);
runStep(__dirname, 'step1', 'real', algo1, 1981);
runStep(__dirname, 'step2', 'example', algo2, 62*56, true);
runStep(__dirname, 'step2', 'real', algo2, 10962, true);
