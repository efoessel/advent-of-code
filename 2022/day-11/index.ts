import { flow, identity, pipe } from 'fp-ts/function'
import { assert, run } from '../../utils/run';
import { Parse, parseBlocks } from '../../utils/parse';
import { Arrays } from '../../utils/arrays';
import { Arithmetics } from '../../utils/arithmetics';
import { objects } from '../../utils/objects';

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

const moveOneItem = (currentMonkey: Monkey, reliefMethod: (worry: number) => number) => (moves: Record<string, number[]>, item: number) => {
    const after = pipe(
        item,
        currentMonkey.operation,
        reliefMethod,
    );
    const nextMonkeyId = after % currentMonkey.divisibleBy === 0 ? currentMonkey.ifTrue : currentMonkey.ifFalse
    return {
        ...moves,
        [nextMonkeyId]: moves[nextMonkeyId].concat([after]),
    };
}

const algo = (rounds: number, reliefMethodBuilder: (monkeys: Monkey[]) => ((worry: number) => number)) => flow(
    parse,
    (monkeys) => {
        const reliefMethod = reliefMethodBuilder(monkeys);
        return Arrays.range(0, rounds).flatMap(() => Arrays.range(0, monkeys.length)).reduce((monkeys, currentMonkeyIdx) => {
            const currentMonkey = monkeys[currentMonkeyIdx];
            const moves = currentMonkey.items.reduce(moveOneItem(currentMonkey, reliefMethod), objects.map(() => [])(monkeys) as Record<string, number[]>);
            return monkeys.map(m => {
                return m === currentMonkey
                    ? {
                        ...currentMonkey,
                        cnt: currentMonkey.cnt + currentMonkey.items.length,
                        items: []
                    }
                    : {
                        ...m,
                        items: m.items.concat(moves[m.id])
                    };
            });
        }, monkeys);
    },
    Arrays.map(monkey => monkey.cnt),
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