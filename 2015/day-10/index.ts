import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';

const lookAndSay = (s: string) => [...s.matchAll(/(.)\1*/g)].map(x => `${x[0].length}${x[0].at(0)}`).join('');

const iterate = (n: number): (s: string) => string => n === 0 ? identity : flow(lookAndSay, iterate(n-1));

const algo = (n: number) => flow(
    iterate(n),
    s => s.length,
);

runStep(__dirname, 'step1', 'real', algo(40), 329356);
runStep(__dirname, 'step2', 'real', algo(50), 4666278, true);
