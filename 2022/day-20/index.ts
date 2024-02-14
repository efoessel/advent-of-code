import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, basicParseInt, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', basicParseInt),
);

type C = {n: number, originalIndex: number}

function decrypt(source: C[]) {
    const array = [...source];
    for(let nb = 0 ; nb < array.length ; nb++) {
        const i = array.findIndex(a => a.originalIndex === nb);
        const [num] = array.splice(i, 1);
        const finalIndex = ((i + num.n) % array.length + array.length) % array.length;
        if(finalIndex === 0) {
            array.push(num);
        } else {
            array.splice(finalIndex, 0, num);
        }
    }
    return array;
}

const algo = (prodBy: number, nbCycles: number) => flow(
    parse,
    Arrays.map(((num, i) => ({n: num*prodBy, originalIndex: i}))),
    (array) => Arrays.range(0, nbCycles).reduce(tmp => decrypt(tmp), array),
    Arrays.map(c => c.n),
    (array) => {
        const zero = array.indexOf(0);
        return [array[(zero+1000)%array.length], array[(zero+2000)%array.length], array[(zero+3000)%array.length]];
    },
    Arrays.sum
);

runStep(__dirname, 'step1', 'example', algo(1, 1), 3);
runStep(__dirname, 'step1', 'real', algo(1, 1), 14888);
runStep(__dirname, 'step2', 'example', algo(811589153, 10), 1623178306);
runStep(__dirname, 'step2', 'real', algo(811589153, 10), 3760092545849);
