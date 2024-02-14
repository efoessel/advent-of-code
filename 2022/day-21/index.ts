import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { parseBlocks } from '../../utils/@index';

type S = number | {l: string, r: string, op: string};

const parse = flow(
    parseBlocks('\n', (line):[string, S] => {
        const numberMatcher = /(\w+): (\d+)/.exec(line);
        if(numberMatcher !== null) {
            return [numberMatcher[1], parseInt(numberMatcher[2])];
        }
        const opMatcher = /(\w+): (\w+) (\+|\*|-|\/) (\w+)/.exec(line);
        if(opMatcher != null) {
            return [opMatcher[1], {l: opMatcher[2], r: opMatcher[4], op: opMatcher[3]}]
        }
        throw new Error('not parsed '+line)
    }),
    Object.fromEntries
);

function evaluate(data: Record<string, S>, ptr: string): number {
    const val = data[ptr];
    if(typeof val === 'number') {
        return val;
    } else {
        switch(val.op) {
            case '+': return evaluate(data, val.l) + evaluate(data, val.r);
            case '*': return evaluate(data, val.l) * evaluate(data, val.r);
            case '/': return evaluate(data, val.l) / evaluate(data, val.r);
            case '-': return evaluate(data, val.l) - evaluate(data, val.r);
        }
    }
    throw new Error("unknown op")
}

const algo1 = flow(
    parse,
    (data) => evaluate(data, 'root')
);

function newton(data: Record<string, S>, ptr: number, maxStep: number): number {
    if(maxStep === 0 || Math.abs(ptr) === Infinity) return NaN;
    const atPtr = evaluate({...data, humn: ptr}, 'root');
    if(atPtr === 0) return ptr;
    const diff = atPtr - evaluate({...data, humn: ptr+1}, 'root');
    return newton(data, Math.round(ptr + 0.95 * atPtr/diff), maxStep - 1);
}

const algo2 = flow(
    parse,
    (data) => ({...data, root: {...data['root'], op: '-'}}),
    (data) => {
        const from = 0, to = 1000000000000000;
        for(;;) { // seems to almost always succeed at the first try
            const ptr = Math.random()*(to-from)+to;
            const tmp = newton(data, ptr, 100)
            if(!isNaN(tmp)) return tmp;
        }
    }
);

runStep(__dirname, 'step1', 'example', algo1, 152);
runStep(__dirname, 'step1', 'real', algo1, 286698846151845);
runStep(__dirname, 'step2', 'example', algo2, 301);
runStep(__dirname, 'step2', 'real', algo2, 3759566892641);
