import { pipe } from 'fp-ts/lib/function';
import { Arrays } from './arrays';

export type Interval = {from: number, to: number};

export namespace Intervals {
    export const ALL = {from: -Infinity, to: Infinity};
    export const from = (a: number, b: number): Interval => ({from: Math.min(a, b), to: Math.max(a, b)});
    export const fromIntegersIncluded = (a: number, b: number): Interval => ({from: Math.min(a, b), to: Math.max(a, b) + 1});

    export const length = (i: Interval) => i.to - i.from;

    export const includes = (n: number) => (i: Interval) => i.from <= n && i.to > n;
    export const includedIn = (i: Interval) => (n: number) => i.from <= n && i.to > n;

    export const contains = (c: Interval) => (i: Interval) => i.from <= c.from && i.to >= c.to;
    export const containedIn = (i: Interval) => (c: Interval) => i.from <= c.from && i.to >= c.to;

    export const intersection = (...i: Interval[]): Interval | undefined => {
        const newFrom = i.reduce((max, x) => Math.max(max, x.from), -Infinity);
        const newTo = i.reduce((min, x) => Math.min(min, x.to), Infinity);
        if(newFrom >= newTo) return undefined;
        else return {from: newFrom, to: newTo};
    }
    export const intersects = (i1: Interval) => (i2: Interval) => Math.max(i1.from, i2.from) < Math.min(i1.to, i2.to);
    export const intersectionWith = (i1: Interval) => (i2: Interval) => intersection(i1, i2);

    export const exclude = (from: Interval, removed: Interval) => pipe(
        [ Intervals.from(-Infinity, removed.from), Intervals.from(removed.to, Infinity) ],
        Arrays.map(i => intersection(i, from)),
        Arrays.filterNullable
    );

    export const toString = (i: Interval) => i.from + '..' + i.to;

    export const equals = (a: Interval, b: Interval) => a.from===b.from && a.to===b.to;
    export const eq = (a: Interval) => (b: Interval) => a.from===b.from && a.to===b.to;
}
