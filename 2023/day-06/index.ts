import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, Strings } from '../../utils/@index';


const solve = ([time, goal]: number[]) => {
    const delta = time * time - 4 * goal;
    const sol1 = Math.ceil((time - Math.sqrt(delta))/2);
    const sol2 = Math.floor((time + Math.sqrt(delta))/2);
    const m1 = goal === sol1 * (time - sol1) ? 1 : 0;
    const m2 = goal === sol2 * (time - sol2) ? 1 : 0;
    return Math.floor(sol2) - Math.ceil(sol1) + 1 - m1 - m2;
}

const algo1 = flow(
    Strings.split('\n'),
    ([time, dist]) => Arrays.zip([
        Parse.extractIntArray(time),
        Parse.extractIntArray(dist)
    ]),
    Arrays.map(solve),
    Arrays.prod
);

const algo2 = flow(
    Strings.split('\n'),
    Arrays.map(l => parseInt(l.replaceAll(/[^\d]/g, ''))),
    solve,
)

runStep(__dirname, 'step1', 'example', algo1, 288);
runStep(__dirname, 'step1', 'real', algo1, 5133600);
runStep(__dirname, 'step2', 'example', algo2, 71503);
runStep(__dirname, 'step2', 'real', algo2, 40651271);
