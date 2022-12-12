import { Arrays } from './arrays';

export const strings = {
    intersection: (strings: string[]) => Arrays.intersection(strings.map(str => str.split('')))
}