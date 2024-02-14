import { createHash } from 'crypto';
import { flow, identity } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Stream, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', identity),
);

const md5 = (str: string) => createHash('md5').update(str).digest("hex")

const algo = (prefix: string) => flow(
    parse,
    Arrays.map((input) => {
        return Stream.fromRange(1, Infinity)
            .filter(v => md5(input+v).startsWith(prefix))
            .first();
    })
);

runStep(__dirname, 'step1', 'example', algo('00000'), [ 609043, 1048970 ], true);
runStep(__dirname, 'step1', 'real', algo('00000'), [ 117946 ], true);
runStep(__dirname, 'step2', 'example', algo('000000'), [ 6742839, 5714438 ], true);
runStep(__dirname, 'step2', 'real', algo('000000'), [ 3938038 ], true);
