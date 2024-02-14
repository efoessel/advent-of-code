import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n\n', block => block.split('\n')),
);

const findHrzSymmetry = (lines: string[]) => pipe(
    Arrays.range(0, lines.length-1),
    Arrays.map(i => Arrays.rangeI(0, Math.min(i, lines.length - i - 2))
        .every(j => lines[i-j] === lines[i+j+1])),
    Arrays.filterIdx(identity),
);

const findHrzAlmostSymmetry = (lines: string[]) => pipe(
    Arrays.range(0, lines.length-1),
    Arrays.map(i => {
        const m = Math.min(i, lines.length - i - 2);
        const fails = Arrays.rangeI(0, m).filter(j => lines[i-j] !== lines[i+j+1]);
        return fails.length === 1 && Arrays.zip([
            lines[i-fails[0]].split(''),
            lines[i+fails[0]+1].split('')
        ]).filter(([c, d]) => c != d).length === 1
        
    }),
    Arrays.filterIdx(identity),
);

const transpose = (lines: string[]) => pipe(
    Arrays.range(0, lines[0].length),
    Arrays.map(i => Arrays.range(0, lines.length).map(j => lines[j].at(i)).join('')),
);

const findSymmetries = (method: typeof findHrzSymmetry) => (lines: string[]): ['V'|'H', number] => {
    const hrz = method(lines)[0];
    if(hrz === undefined) {
        return ['V', method(transpose(lines))[0]]
    } else {
        return ['H', hrz]
    }
}

const algo = (method: typeof findHrzSymmetry) => flow(
    parse,
    Arrays.map(flow(
        findSymmetries(method),
        ([c, n]) => c === 'V' ? n+1 : 100*(n+1)
    )),
    Arrays.sum
);

runStep(__dirname, 'step1', 'example', algo(findHrzSymmetry), 405);
runStep(__dirname, 'step1', 'real', algo(findHrzSymmetry), 35360);
runStep(__dirname, 'step2', 'example', algo(findHrzAlmostSymmetry), 400);
runStep(__dirname, 'step2', 'real', algo(findHrzAlmostSymmetry), 36755);
