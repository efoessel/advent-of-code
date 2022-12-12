import { flow, pipe } from 'fp-ts/function'
import { assert } from '../../utils/run';
import { basicParseInt, parseBlocks } from '../../utils/parse';
import { Arrays } from '../../utils/arrays';
import { Grid } from '../../utils/grid';

const parse = flow(
    parseBlocks('\n', parseBlocks('', basicParseInt)),
    grid => new Grid(grid, false),
);

const algo1 = flow(
    parse,
    (grid) => grid.filter((val, p) => {
        return pipe(Grid.SIDES,
            Arrays.map(dir => grid.getCellsInDirection(p, dir).map(c => c.value)),
            Arrays.some(arr => arr.every(t => t < val))
        )
    }).length,
);

function score(tree: number, direction: number[]) {
    const tmp = direction.findIndex(t => t>=tree);
    if(tmp === -1) return direction.length;
    else return tmp+1;
}

const algo2 = flow(
    parse,
    (grid) => grid.map((val, p) => {
        return pipe(Grid.SIDES,
            Arrays.map(dir => grid.getCellsInDirection(p, dir).map(c => c.value)),
            Arrays.map(score.bind(null, val)),
            Arrays.prod
        )
    })
    .reduce((max, v) => Math.max(max, v), -Infinity)
);


assert(__dirname, algo1, algo2, [1818, 368368]);
