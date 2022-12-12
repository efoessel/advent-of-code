import { flow } from 'fp-ts/function'
import { Interval } from '../../utils/interval';
import { assert } from '../../utils/run';
import { basicParseInt, parseBlocks } from '../../utils/parse';
import { Arrays } from '../../utils/arrays';

const parse = flow(
    parseBlocks('\n', parseBlocks(',', flow(
        parseBlocks('-', basicParseInt),
        ([f, t]) => new Interval(f, t)
    ))),
);

const algo1 = flow(
    parse,
    Arrays.count(([a, b]) => a.containedIn(b) || b.containedIn(a)),
);

const algo2 = flow(
    parse,
    Arrays.count(([a, b]) => a.overlaps(b)),
);

assert(__dirname, algo1, algo2, [305, 811]);