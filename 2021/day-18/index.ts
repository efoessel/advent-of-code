import { flow } from 'fp-ts/function'
import { assertJSONEqual, runStep } from '../../utils/run';
import { Arrays, BiOperator, Mapper, Operator, Strings } from '../../utils/@index';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(l => JSON.parse(l) as SnailfishNumber)
);

type SnailfishNumber = number | [SnailfishNumber, SnailfishNumber];

const addToTheLeft = (s: SnailfishNumber, toAdd: number): SnailfishNumber => Array.isArray(s) ? [addToTheLeft(s[0], toAdd), s[1]] : s+toAdd;
const addToTheRight = (s: SnailfishNumber, toAdd: number): SnailfishNumber => Array.isArray(s) ? [s[0], addToTheRight(s[1], toAdd)] : s+toAdd;

const explode_aux = (s: SnailfishNumber, depth: number): {s: SnailfishNumber, left: number, right: number} => {
    if(Array.isArray(s)) {
        if(depth === 4) {
            return {
                s: 0,
                left: s[0] as number,
                right: s[1] as number,
            };
        } else {
            const left = explode_aux(s[0], depth+1);
            if(left.s !== s[0]) {
                return {
                    s: [left.s, addToTheLeft(s[1], left.right)],
                    left: left.left,
                    right: 0,
                }
            }
            const right = explode_aux(s[1], depth+1);
            if(right.s !== s[1]) {
                return {
                    s: [addToTheRight(s[0], right.left), right.s],
                    left: 0,
                    right: right.right,
                }
            }
            return { s, left: 0, right: 0 };
        }
    } else {
        return { s, left: 0, right: 0 }
    }
}

const explode: Operator<SnailfishNumber> = (s) => explode_aux(s, 0).s;

assertJSONEqual(explode([[[[[9,8],1],2],3],4]), [[[[0,9],2],3],4]);
assertJSONEqual(explode([7,[6,[5,[4,[3,2]]]]]), [7,[6,[5,[7,0]]]]);
assertJSONEqual(explode([[6,[5,[4,[3,2]]]],1]), [[6,[5,[7,0]]],3]);
assertJSONEqual(explode([[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]), [[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]);
assertJSONEqual(explode([[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]), [[3,[2,[8,0]]],[9,[5,[7,0]]]]);

const split: Operator<SnailfishNumber> = (s) => {
    if(typeof s === 'number') {
        return s >= 10 ? [Math.floor(s/2), Math.ceil(s/2)] : s;
    } else {
        const left = split(s[0]);
        if(left != s[0]) return [left, s[1]];
        const right = split(s[1]);
        if(right != s[1]) return [s[0], right];
        return s;
    }
}

assertJSONEqual(split(10), [5, 5]);
assertJSONEqual(split(11), [5, 6]);
assertJSONEqual(split([[[[10,1],2],3],4]), [[[[[5, 5],1],2],3],4]);
assertJSONEqual(split([7,[6,[5,[10,2]]]]), [7,[6,[5,[[5, 5],2]]]]);

const reduce: Operator<SnailfishNumber> = (s) => {
    let [prev, curr]: SnailfishNumber[] = [-1, s];
    while(prev !== curr) {
        while(prev !== curr) {
            [prev, curr] = [curr, explode(curr)];
        }
        [prev, curr] = [curr, split(curr)];
    }
    return curr;
}

const add: BiOperator<SnailfishNumber> = (a, b) => reduce([a, b]);

assertJSONEqual(add([[[[4,3],4],4],[7,[[8,4],9]]], [1, 1]), [[[[0,7],4],[[7,8],[6,0]]],[8,1]]);

const magnitude: Mapper<SnailfishNumber, number> = s => {
    if(typeof s === 'number') return s;
    return magnitude(s[0])*3 + magnitude(s[1])*2
}

assertJSONEqual(magnitude([[1,2],[[3,4],5]]), 143);
assertJSONEqual(magnitude([[[[0,7],4],[[7,8],[6,0]]],[8,1]]), 1384);
assertJSONEqual(magnitude([[[[1,1],[2,2]],[3,3]],[4,4]]), 445);
assertJSONEqual(magnitude([[[[3,0],[5,3]],[4,4]],[5,5]]), 791);
assertJSONEqual(magnitude([[[[5,0],[7,4]],[5,5]],[6,6]]), 1137);
assertJSONEqual(magnitude([[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]), 3488);

const algo1 = flow(
    parse,
    nums => nums.reduce(add),
    magnitude
);

const algo2 = flow(
    parse,
    Arrays.getPairs,
    Arrays.flatMap(([a, b]) => [add(a, b), add(b, a)]),
    Arrays.map(magnitude),
    Arrays.max
)

runStep(__dirname, 'step1', 'example', algo1, 4140);
runStep(__dirname, 'step1', 'real', algo1, 3691);
runStep(__dirname, 'step2', 'example', algo2, 3993);
runStep(__dirname, 'step2', 'real', algo2, 4756);
