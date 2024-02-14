import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, Strings, Vector, memo, Stream } from '../../utils/@index';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(Parse.extractIntArray),
    ([[,p1], [,p2]]) => ({
        pos1: p1, pos2: p2
    })
);



const algo1 = flow(
    parse,
    ({pos1, pos2}) => Stream.loopUntil(
        ({score1, score2}) => Math.max(score1, score2) >= 1000,
        ({pos1, pos2, score1, score2, turn}) => {
            const roll = (turn % 100) + ((turn+1) % 100) + ((turn+2) % 100) + 3;
            if(turn % 2 === 0) {
                const newPos1 = (pos1 + roll - 1)%10 + 1;
                return {pos1: newPos1, score1: score1+newPos1, pos2, score2, turn: turn+3};
            } else {
                const newPos2 = (pos2 + roll - 1)%10 + 1;
                return {pos2: newPos2, score2: score2+newPos2, pos1, score1, turn: turn+3};
            }
        },
        { pos1, pos2, score1: 0, score2: 0, turn: 0}
    ),
    ({score1, score2, turn}) => Math.min(score1, score2) * turn
);

const ROLLS = pipe(
    Stream.fromCrossProduct([1, 2, 3], [1, 2, 3], [1, 2, 3])
        .map(Arrays.sum)
        .countElements(),
    m => new Array(...m.entries())
);

const play = memo(
    (pos1: number, score1: number, pos2: number, score2: number): [number, number] => {
        return pipe(ROLLS,
            Arrays.map(([roll, cnt]): [number, number] => {
                const newPos1 = (pos1 + roll - 1) % 10 + 1;
                const newScore1 = score1 + newPos1;
                if(newScore1 >= 21) return [cnt, 0];
                const [w2, w1] = play(pos2, score2, newPos1, newScore1);
                return [cnt*w1, cnt*w2];
            }),
            (res) => Vector.addW(...res)
        )
    },
    (...args: unknown[]) => args.toString()
)

const algo2 = flow(
    parse,
    ({pos1, pos2}) => play(pos1, 0, pos2, 0),
    Arrays.max
)

runStep(__dirname, 'step1', 'example', algo1, 739785);
runStep(__dirname, 'step1', 'real', algo1, 711480);
runStep(__dirname, 'step2', 'example', algo2, 444356092776315);
runStep(__dirname, 'step2', 'real', algo2, 265845890886828);
