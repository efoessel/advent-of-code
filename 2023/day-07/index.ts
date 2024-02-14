import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', (line => {
        return {
            cards: line.split(' ')[0],
            bid: parseInt(line.split(' ')[1]),
        }
    })),
);

const combinationOrder = '54F3T2H';

const getCardCounts = flow(
    (cards: string) => cards.split(''),
    Arrays.groupByAsArray(identity),
    Arrays.map(g => g.length),
    Arrays.sortNumbers("DESC", identity)
);

const evaluate = (cardCounts: number[]) => {
    if(cardCounts[0] === 5) return '5';
    if(cardCounts[0] === 4) return '4';
    if(cardCounts[0] === 3 && cardCounts[1] === 2) return 'F';
    if(cardCounts[0] === 3) return '3';
    if(cardCounts[0] === 2 && cardCounts[1] === 2) return 'T';
    if(cardCounts[0] === 2) return '2';
    return 'H';
}

const best = (a: string, b: string, ref: string) => ref.indexOf(a) - ref.indexOf(b);
const compare = (cardsOrder: string) => (b: {cards: string, cardCounts: number[]}, a: {cards: string, cardCounts: number[]}) =>
    best(evaluate(a.cardCounts), evaluate(b.cardCounts), combinationOrder)
    || best(a.cards[0], b.cards[0], cardsOrder)
    || best(a.cards[1], b.cards[1], cardsOrder)
    || best(a.cards[2], b.cards[2], cardsOrder)
    || best(a.cards[3], b.cards[3], cardsOrder)
    || best(a.cards[4], b.cards[4], cardsOrder);

const algo1 = flow(
    parse,
    Arrays.map(({cards, bid}) => ({cards, bid, cardCounts: getCardCounts(cards)})),
    (l) => l.sort(compare('AKQJT98765432')),
    Arrays.map((l, i) => l.bid * (i+1)),
    Arrays.sum
);

const getCardCounts2 = (cards: string) => {
    if(cards === 'JJJJJ') return [5];
    const withoutJs = cards.replaceAll(/J/g, '');
    const [head, ...tail] = getCardCounts(withoutJs);
    return [head + 5-withoutJs.length, ...tail];
}

const algo2 = flow(
    parse,
    Arrays.map(({cards, bid}) => ({cards, bid, cardCounts: getCardCounts2(cards)})),
    (l) => l.sort(compare('AKQT98765432J')),
    Arrays.map((l, i) => l.bid * (i+1)),
    Arrays.sum
)

runStep(__dirname, 'step1', 'example', algo1, 6440);
runStep(__dirname, 'step1', 'real', algo1, 254024898);
runStep(__dirname, 'step2', 'example', algo2, 5905);
runStep(__dirname, 'step2', 'real', algo2, 254115617);
