import { flow } from 'fp-ts/function';
import { Arrays } from '../../utils/arrays';
import { basicParseInt, parseBlocks } from '../../utils/parse';
import { assert } from '../../utils/run';

const parse = parseBlocks('\n\n', parseBlocks('\n', basicParseInt));

const base = flow(
    parse,
    Arrays.map(Arrays.sum),
    arr => arr.sort((a, b) => b-a)
)

assert(__dirname,
    (l) => base(l)[0],
    (l) => Arrays.sum(base(l).slice(0, 3)),
    [68802, 205370]
);