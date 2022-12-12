import { flow, identity } from 'fp-ts/function'
import { assert, run } from '../../utils/run';
import { basicParseInt, castTo, parseBlocks } from '../../utils/parse';
import { Arrays } from '../../utils/arrays';


const algo = (markerSize: number) => flow(
    (str: string) => str.split(''),
    Arrays.window(0, markerSize),
    Arrays.map((w) => Arrays.isSet(w)),
    sizes => sizes.indexOf(true) + markerSize
)

assert(__dirname, algo(4), algo(14), [1953, 2301]);
