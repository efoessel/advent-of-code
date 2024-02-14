import { identity } from 'fp-ts/lib/function';
import { Arrays } from './arrays';


export namespace Strings {
    export const intersection = (strings: readonly string[]) => Arrays.intersectionUsing(identity)(strings.map(str => str.split('')));

    export const split = (separator: string) => (x: string) => x.split(separator);

    export const length = (x: string) => x.length;

    /**
     * Split a string in n equal parts if it is possible.
     * Otherwise, last item will be truncated (and then when it's empty, previous ones)
     */
    export const splitIn = (count: number) => (str: string) => {
        const step = Math.ceil(str.length/count);
        return Arrays.range(0, count).map((v, i) => str.substring(i*step, (i+1)*step))
    }

// console.log(splitIn(3)('a'));
// console.log(splitIn(3)('ab'));
// console.log(splitIn(3)('abc'));
// console.log(splitIn(3)('abcd'));
// console.log(splitIn(3)('abcde'));
// console.log(splitIn(3)('abcdef'));
// console.log(splitIn(3)('abcdefg'));

}