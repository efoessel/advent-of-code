import { flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import { Option } from 'fp-ts/lib/Option';

type mapFn<T, U> = (elem: T) => U;

export class Sequence<T> {
    constructor(private it: () => Option<T>) {
    }

    public map<U>(fn: mapFn<T, U>) {
        return new Sequence(flow(
            this.it,
            O.map(fn)
        ));
    }

    public filter(fn: mapFn<T, boolean>) {
        return new Sequence(() => {
            let v: Option<T>;
            while(!O.isNone(v = this.it()) ) {
                if(fn(v.value)) return v;
            }
            return O.none;
        })
    }

    public reduce<U>(fn: (acc: U, curr: T) => U, acc: U) {
        let v: Option<T>;
        while(!O.isNone(v = this.it()) ) {
            acc = fn(acc, v.value);
        }
        return acc;
    }

    public reduceUntil<U, F>(stop: (acc: U) => boolean, fn: (acc: U, curr: T) => U, acc: U) {
        let v: Option<T>;
        while(!stop(acc) && !O.isNone(v = this.it()) ) {
            acc = fn(acc, v.value);
        }
        return acc;
    }

    public static range(start: number, end: number) {
        let cnt = start;
        return new Sequence<number>(() => cnt + 1 > end ? O.none : O.some(cnt++));
    }

    public static loop() {
        return new Sequence<void>(() => O.some(undefined));
    }

    public collectToArray() {
        let res: T[] = [];
        let v: Option<T>;
        while(!O.isNone(v = this.it()) ) {
            res.push(v.value)
        }
        return res;
    }
}
