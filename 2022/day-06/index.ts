import { flow } from 'fp-ts/function'
import { runStep} from '../../utils/run';
import { Arrays } from '../../utils/arrays';


const algo = (markerSize: number) => flow(
    (str: string) => str.split(''),
    Arrays.window(0, markerSize),
    Arrays.map(Arrays.isSet),
    sizes => sizes.indexOf(true) + markerSize
)

runStep(__dirname, 'step1', 'example', algo(4), 7);
runStep(__dirname, 'step1', 'real', algo(4), 1953);
runStep(__dirname, 'step2', 'example', algo(14), 19);
runStep(__dirname, 'step2', 'real', algo(14), 2301);
