import { flow, identity, pipe } from 'fp-ts/function'
import { run, assert } from '../../utils/run';
import { basicParseInt, castTo, parseBlocks, Parse } from '../../utils/parse';
import { Arrays } from '../../utils/arrays';
import { Objects } from '../../utils/objects';
import { Arithmetics } from '../../utils/arithmetics';
import { Grid } from '../../utils/grid';
import { Interval } from '../../utils/interval';
import { Sequence } from '../../utils/sequence';
import { Vector } from '../../utils/vectors';

const parse = flow(
    parseBlocks('\n', identity),
    Arrays.filter(line => line.trim() !== '')
);

const algo1 = flow(
    parse,
);

run(__dirname, algo1);
