import { flow } from 'fp-ts/function';
import { Arrays } from '../../utils/arrays';
import { castTo, parseBlocks } from '../../utils/parse';
import { assert } from '../../utils/run';

type Round = `${'A'|'B'|'C'} ${'X'|'Y'|'Z'}`
type ScoreMap = Record<Round, number>

const toScore: ScoreMap = {
    'A X': 4,
    'A Y': 8,
    'A Z': 3,
    'B X': 1,
    'B Y': 5,
    'B Z': 9,
    'C X': 7,
    'C Y': 2,
    'C Z': 6,
}

const toScore2: ScoreMap = {
    'A X': 3,
    'A Y': 4,
    'A Z': 8,
    'B X': 1,
    'B Y': 5,
    'B Z': 9,
    'C X': 2,
    'C Y': 6,
    'C Z': 7,
}

const algo = (scoreMap: ScoreMap) => flow(
    parseBlocks('\n', castTo<Round>),
    Arrays.map((round) => scoreMap[round]),
    Arrays.sum
)

assert(__dirname, algo(toScore), algo(toScore2), [12794, 14979]);