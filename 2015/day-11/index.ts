import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Stream } from '../../utils/@index';

const VALID_STRAIGHTS = pipe(
    Arrays.range(0, 26),
    Arrays.map(x => String.fromCharCode('a'.charCodeAt(0) + x)),
    Arrays.filter(x => !'iol'.includes(x)),
    Arrays.windowStrict(3),
    Arrays.map(x => x.join(''))
);
const containsValidStraight = (s: string) => VALID_STRAIGHTS.some(straight => s.includes(straight));

const containsTwoPairs = (s: string) => {
    const pairs = [...s.matchAll(/(.)\1/g)];
    return Arrays.asSet(pairs.map(([x]) => x)).length >= 2;
};

const isValid = (pwd: string) => containsValidStraight(pwd) && containsTwoPairs(pwd);

const incrementOneLetter = (c: string) => String.fromCharCode(c.charCodeAt(0) + ('hnm'.includes(c)?2:1));

const increment = (s: string): string => s.at(-1) === 'z'
    ? increment(s.substring(0, s.length-1)) + 'a'
    : s.substring(0, s.length-1) + incrementOneLetter(s.at(-1)!);

const algo1 = (pwd: string) => Stream.loop().reduceUntil(isValid, increment, pwd);

const algo2 = flow(algo1, increment, algo1);

runStep(__dirname, 'step1', 'example', algo1, 'abcdffaa');
runStep(__dirname, 'step1', 'real', algo1, 'hxbxxyzz');
runStep(__dirname, 'step2', 'example', algo2, 'abcdffbb');
runStep(__dirname, 'step2', 'real', algo2, 'hxcaabcc');
