import { flow, identity } from 'fp-ts/function'
import { assert } from '../../utils/run';
import { Parse, parseBlocks } from '../../utils/parse';
import { Arrays } from '../../utils/arrays';
import { Arithmetics } from '../../utils/arithmetics';
import { Sequence } from '../../utils/sequence';

type Monkey = {
    id: number,
    items: number[],
    operation: (old: number) => number,
    divisibleBy: number,
    ifTrue: number,
    ifFalse: number,
    cnt: number,
}

const parseOperation = (str: string) => {
    const [aStr, op, bStr] = str.split(' ');
    const a = parseInt(aStr);
    const b = parseInt(bStr);
    const getA = aStr === 'old' ? identity : () => a;
    const getB = bStr === 'old' ? identity : () => b;
    switch(op) {
        case '+': return (old: number) => getA(old) + getB(old);
        case '*': return (old: number) => getA(old) * getB(old);
        case '-': return (old: number) => getA(old) - getB(old);
    }
    throw new Error('Unknown operator');
}

const parse = flow(
    parseBlocks('\n\n', (block) => {
        const lines = block.split('\n');
        return {
            id: Parse.extractInt(lines[0]),
            items: Parse.extractIntArray(lines[1]),
            operation: parseOperation(Parse.extractRegexp(/  Operation: new = (.*)/)(lines[2])),
            divisibleBy: Parse.extractInt(lines[3]),
            ifTrue: Parse.extractInt(lines[4]),
            ifFalse: Parse.extractInt(lines[5]),
            cnt: 0,
        } as Monkey;
    }),
);

const algo = (rounds: number, reliefMethodBuilder: (monkeys: Monkey[]) => ((worry: number) => number)) => flow(
    parse,
    (monkeys) => {
        const reliefMethod = reliefMethodBuilder(monkeys);
        const allItems = monkeys.flatMap((m, monkeyId) => m.items.map(item => ({monkeyId, item})));

        return allItems.reduce((monkeyCnt, {monkeyId, item}) => {
            return Sequence.loop().reduceUntil(({loopCnt}) => loopCnt>=rounds, ({monkeyCnt, monkeyId, item, loopCnt}) => {
                const currentMonkey = monkeys[monkeyId];
                const newWorry = reliefMethod(currentMonkey.operation(item));
                const newMonkeyId = newWorry % currentMonkey.divisibleBy === 0 ? currentMonkey.ifTrue : currentMonkey.ifFalse;
                return {
                    monkeyCnt: [...monkeyCnt.slice(0, monkeyId), monkeyCnt[monkeyId] + 1, ...monkeyCnt.slice(monkeyId+1)],
                    monkeyId: newMonkeyId,
                    item: newWorry,
                    loopCnt: loopCnt + (newMonkeyId > monkeyId ? 0 : 1),
                };
            }, {monkeyCnt, monkeyId, item, loopCnt: 0}).monkeyCnt;
        }, monkeys.map(() => 0));
    },
    Arrays.sortNumbers('DESC', identity),
    (arr) => arr[0]*arr[1]
);

assert(__dirname,
    algo(20, () => (worry) => Math.floor(worry/3)),
    algo(10000, (monkeys) => {
        const lcm = Arithmetics.lcm(...monkeys.map(m => m.divisibleBy));
        return (worry) => worry % lcm;
    }),
    [99852, 25935263541]
);