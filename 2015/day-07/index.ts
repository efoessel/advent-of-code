import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { parseBlocks } from '../../utils/@index';

type ResolveFunction = (name: string) => number;

const resolver = (defs: Map<string, (resolve: ResolveFunction) => number>) => {
    const state = new Map<string, number>();
    const resolve = (name: string): number => {
        if(!isNaN(parseInt(name))) return parseInt(name);
        if(state.has(name)) return state.get(name)!;
        else {
            const tmp = defs.get(name)?.(resolve) ?? -1;
            state.set(name, tmp);
            return tmp;
        } 
    }
    return resolve;
}

const parse = flow(
    parseBlocks('\n', flow(
        (s) => s.split(' '),
        (words): readonly [string, (resolve: ResolveFunction) => number] => {
            if(words[1] === '->') {
                return [words[2], (r) => r(words[0])]
            } else if(words[0] === 'NOT') {
                return [words[3], (r) => 65535 - r(words[1])]
            } else if(words[1] === 'AND') {
                return [words[4], (r) => r(words[0]) & r(words[2])]
            } else if(words[1] === 'OR') {
                return [words[4], (r) => r(words[0]) | r(words[2])]
            } else if(words[1] === 'LSHIFT') {
                return [words[4], (r) => (r(words[0]) << parseInt(words[2])) % 65536]
            } else if(words[1] === 'RSHIFT') {
                return [words[4], (r) => r(words[0]) >> parseInt(words[2])]
            }
            throw 'Unexpected pattern: '+words.toString()
        }
    )),
    (entries) => new Map(entries)
);

const algo1 = flow(
    parse,
    (defs) => resolver(defs)('a')
);

const algo2 = flow(
    parse,
    (defs) => {
        const a = resolver(defs)('a');
        defs.set('b', () => a);
        return resolver(defs)('a')
    }
);

runStep(__dirname, 'step1', 'real', algo1, 956);
runStep(__dirname, 'step2', 'real', algo2, 40149);
