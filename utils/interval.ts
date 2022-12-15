import { Arrays } from './arrays';

export class Interval {
    public readonly from: number;
    public readonly to: number;

    // always from <= to
    constructor(
        from: number,
        to: number,
    ) {
        this.from = Math.min(from, to);
        this.to = Math.max(from, to);
    }

    get length() {
        return this.to - this.from + 1;
    }

    contains(val: number) {
        return this.from <= val && this.to >= val;
    }

    containedIn(other: Interval) {
        return this.from >= other.from && this.to <= other.to;
    }

    overlaps(other: Interval) {
        return this.intersection(other) !== undefined;
    }

    intersection(range: Interval) {
        const newFrom = Math.max(this.from, range.from);
        const newTo = Math.min(this.to, range.to);
        if(newFrom > newTo) return undefined;
        else return new Interval(newFrom, newTo);
    }

    exclude(range: Interval) {
        const reverse = [
            new Interval(-Infinity, range.from - 1),
            new Interval(range.to+1, Infinity),
        ]
        return Arrays.filterUndef(reverse.map(r => r.intersection(this)));
    }

    toString() {
        return this.from + '..' + this.to;
    }

    equals(other: unknown) {
        return other instanceof Interval
            && this.from === other.from
            && this.to === other.to
    }
}