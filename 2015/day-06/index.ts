import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Parse, parseBlocks } from '../../utils/@index';
import { PG2D } from '../../utils/pixel-geometry-2d';

type Cmd = 'turn on'|'turn off'|'toggle';

const parse = flow(
    parseBlocks('\n', (line) => {
        const cmd = line.match(/turn on|turn off|toggle/)![0] as Cmd
        const [ax, ay, bx, by] = Parse.extractIntArray(line);
        return { cmd, sq: PG2D.Square.fromAngles([ax, ay], [bx, by]) };
    }),
);

function getValue(cmd: Cmd, prevValue?: number) {
    switch(cmd) {
        case 'turn on': return 1;
        case 'turn off': return 0;
        case 'toggle' : return 1 - (prevValue ?? 0);
    }
}

function getValue2(cmd: Cmd, prevValue: number = 0) {
    switch(cmd) {
        case 'turn on': return prevValue + 1;
        case 'turn off': return Math.max(prevValue-1, 0);
        case 'toggle' : return prevValue + 2;
    }
}

const algo = (getValue: (cmd: Cmd, prev?: number)=>number) => flow(
    parse,
    // it works, but it's about 100x slower...
    /*Arrays.reduce((lights, {cmd, sq}) =>  {
        return Arrays.range(sq[0][0], sq[1][0]+1).reduce(
            (lights, x) => Arrays.range(sq[0][1], sq[1][1]+1).reduce(
                (lights, y) => lights.set(`${x},${y}`, getValue(cmd, lights.get(`${x},${y}`))),
                lights,
            ),
            lights,
        );
    }, Immutable.Map<string, number>([])),
    m => m.reduce((sum, v) => sum + v, 0)
    */
    
    (commands) => {
        const array: number[][] = Arrays.range(0, 1000).map(() => []);
        commands.forEach(({cmd, sq}) => {
            for(let i = sq[0][0] ; i <= sq[1][0] ; i++) {
                for(let j = sq[0][1] ; j <= sq[1][1] ; j++) {
                    array[i][j] = getValue(cmd, array[i][j]);
                }
            }
        });
        return array;
    },
    Arrays.map(Arrays.sum),
    Arrays.sum
    
);

runStep(__dirname, 'step1', 'example', algo(getValue), 500000);
runStep(__dirname, 'step1', 'real', algo(getValue), 377891);
runStep(__dirname, 'step2', 'example', algo(getValue2), 1500000);
runStep(__dirname, 'step2', 'real', algo(getValue2), 14110788);
