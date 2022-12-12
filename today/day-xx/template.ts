import { flow, identity, pipe } from 'fp-ts/function'
import { run, assert } from '../../utils/run';
import { basicParseInt, castTo, parseBlocks } from '../../utils/parse';
import { Arrays } from '../../utils/arrays';
import { objects } from '../../utils/objects';

const parse = flow(
    parseBlocks('\n', identity),
    Arrays.filter(line => line.trim() !== '')
);

const algo1 = flow(
    parse,
);

run(__dirname, algo1);
