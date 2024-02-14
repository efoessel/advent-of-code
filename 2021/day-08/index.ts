import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, Strings } from '../../utils/@index';
import { Matrices } from '../../utils/grids';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(flow(
        Strings.split(' | '),
        Arrays.map(Strings.split(' ')),
        Matrices.map(Strings.split('')),
        ([base, output]) => ({base, output}),
    ))
);

const algo1 = flow(
    parse,
    Arrays.map(flow(
        Objects.pluck('output'),
        Arrays.count(flow(
            Arrays.length,
            (l) => [2, 3, 4, 7].includes(l)
        ))
    )),
    Arrays.sum
);

type Segment = 'a'|'b'|'c'|'d'|'e'|'f'|'g';
type SegmentedNumber = keyof typeof SEGMENTS_TO_NUMBERS_MAPPING;
type Pattern = string[];
type Mapping = Record<string, string>;
const SEGMENTS = 'abcdefg'.split('');
const SEGMENTS_TO_NUMBERS_MAPPING = {
    'abcefg': '0',
    'cf': '1',
    'acdeg': '2',
    'acdfg': '3',
    'bcdf': '4',
    'abdfg': '5',
    'abdefg': '6',
    'acf': '7',
    'abcdefg': '8',
    'abcdfg': '9',
}

function superSmartPatternMatcher(patterns: Pattern[]) {
    function not(pattern: Pattern) {
        return SEGMENTS.filter(char => !pattern.includes(char))
    }

    const res = {} as Mapping;

    const one = patterns.find(p => p.length == 2)!;
    const seven = patterns.find(p => p.length == 3)!;
    const four = patterns.find(p => p.length == 4)!;
    const fiveSegments = patterns.filter(p => p.length == 5); // 3, 2 or 5

    const frequencies = SEGMENTS.map(char => ({
        char,
        count: patterns.filter(p => p.includes(char)).length,
    }));

    res.b = frequencies.find(freq => freq.count === 6)!.char;
    res.e = frequencies.find(freq => freq.count === 4)!.char;
    res.f = frequencies.find(freq => freq.count === 9)!.char;
    res.c = Arrays.intersectionUsing(identity)([one, not([res.f])])[0];
    res.a = Arrays.intersectionUsing(identity)([seven, not(four)])[0];
    res.d = Arrays.intersectionUsing(identity)([four, not([res.b]), not(one)])[0];
    res.g = Arrays.intersectionUsing(identity)([...fiveSegments, not(four), not(seven)])[0];
    
    return res;
}

function translate(pattern: Pattern, mapping: Mapping) {
    const decrypted = pattern.map(char => mapping[char as Segment]).sort().join('');
    if(decrypted in SEGMENTS_TO_NUMBERS_MAPPING) {
        return SEGMENTS_TO_NUMBERS_MAPPING[decrypted as SegmentedNumber];
    } else {
        throw new Error('Something went wrong, decrypted value doesn\'t exist '+decrypted);
    }
}

const algo2 = flow(
    parse,
    Arrays.map(({base, output}) => {
        const mapping = superSmartPatternMatcher(base);
        const reversedMapping = Object.fromEntries(Object.entries(mapping).map(([k, v]) => [v, k]));
        return output.map(o => translate(o, reversedMapping))
    }),
    Arrays.map(flow(Arrays.join(''), parseInt)),
    Arrays.sum
)

runStep(__dirname, 'step1', 'example', algo1, 26);
runStep(__dirname, 'step1', 'real', algo1, 514);
runStep(__dirname, 'step2', 'example', algo2, 61229);
runStep(__dirname, 'step2', 'real', algo2, 1012272);
