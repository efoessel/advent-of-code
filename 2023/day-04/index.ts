import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', (line => {
        const x = line.split(/[:|]/);
        const id = x[0].substring(5);
        const winning = x[1].trim().split(/\s+/).map(x => parseInt(x));
        const played = x[2].trim().split(/\s+/).map(x => parseInt(x));
        return {
            id, winning, played
        }
    })),
);

const algo1 = flow(
    parse,
    Arrays.map(flow(
        card => card.played.filter(x => card.winning.includes(x)),
        Arrays.length,
        x => x ? Math.pow(2, x - 1) : 0
    )),
    Arrays.sum
);

const algo2 = flow(
    parse,
    Arrays.map(flow(
        card => card.played.filter(x => card.winning.includes(x)),
        Arrays.length,
    )),
    (cards) => cards.reduce((counts, card, cardId) => {
        const adder = (i: number) => i > cardId && i <= cardId + card ? 1: 0;
        return counts.map((c, i) => c + counts[cardId] * adder(i))
    }, Array.from({length: cards.length}, () => 1)),
    Arrays.sum
)

runStep(__dirname, 'step1', 'example', algo1, 13);
runStep(__dirname, 'step1', 'real', algo1, 21821);
runStep(__dirname, 'step2', 'example', algo2, 30);
runStep(__dirname, 'step2', 'real', algo2, 5539496);
