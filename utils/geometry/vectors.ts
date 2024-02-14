export type Vector = readonly number[];

export namespace Vector {
    type RoSameVector<T extends Vector, V = number> = {readonly [I in keyof T]: V};
    type SameVector<T extends Vector, V = number> = {-readonly [I in keyof T]: V};

    const checkSize2 = (...a: Vector[]) => {
        if(a.length === 0) throw 'Missing input';
        if(a.some(b => b.length !== a[0].length)) throw 'Non-matching vector sizes';
    }

    const checkSize = (a: Vector, ...others: Vector[]) => {
        if(others.some(b => b.length !== a.length)) throw 'Non-matching vector sizes';
    }

    export function add<const T extends Vector>(a: T, ...others: RoSameVector<T>[]): SameVector<T> {
        checkSize(a, ...others);
        return a.map((ai, i) => others.reduce((sum, aj) => sum + aj[i], ai)) as SameVector<T>;
    }

    export function addW<const T extends Vector>(...input: T[]): SameVector<T> {
        checkSize2(...input);
        return input[0].map((ai, i) => input.reduce((sum, aj) => sum + aj[i], 0)) as SameVector<T>;
    }
    

    export function sub<const T extends Vector>(a: T, b: RoSameVector<T>): SameVector<T> {
        checkSize(a, b);
        return a.map((v, i) => v - b[i]) as SameVector<T>;
    }

    export function mult<const T extends Vector>(lambda: number, a: T): SameVector<T> {
        return a.map(ai => lambda*ai) as SameVector<T>
    }

    export function multEach<const T extends Vector>(a: T, b: RoSameVector<T>): SameVector<T> {
        checkSize(a, b);
        return a.map((v, i) => v * b[i]) as SameVector<T>;
    }

    export function div<const T extends Vector>(lambda: number, a: T) {
        return a.map(ai => ai/lambda) as SameVector<T>
    }

    export function divEach<const T extends Vector>(a: T, b: RoSameVector<T>): SameVector<T> {
        checkSize(a, b);
        return a.map((v, i) => v / b[i]) as SameVector<T>;
    }

    export function mod<const T extends Vector>(lambda: number, a: T): SameVector<T> {
        return a.map(ai => ai%lambda) as SameVector<T>;
    }

    export function modEach<const T extends Vector>(a: T, b: RoSameVector<T>): SameVector<T> {
        checkSize(a, b);
        return a.map((v, i) => v % b[i]) as SameVector<T>;
    }

    export function dotProd<const T extends Vector>(a: T, b: RoSameVector<T>): number {
        checkSize(a, b);
        return a.reduce((sum, v, i) => sum + v * b[i], 0);
    }

    export function sign<const T extends Vector>(a: T): SameVector<T, -1|0|1> {
        return a.map((ai) => Math.sign(ai)) as SameVector<T, -1|0|1>;
    }

    export function abs<const T extends Vector>(a: T): SameVector<T> {
        return a.map((ai) => Math.abs(ai)) as SameVector<T>;
    }

    export function manhattanDist<const T extends Vector>(a: T, b: RoSameVector<T>): number {
        return Vector.norm1(Vector.sub(a, b));
    }

    export function norm1(a: Vector): number {
        return a.reduce((sum, ai) => sum + Math.abs(ai), 0);
    }

    export function norm2(a: Vector): number {
        return Math.hypot(...a);
    }

    export function normInf(a: Vector): number {
        return Math.max(...abs(a));
    }

    export function zero(dim: 1): [0];
    export function zero(dim: 2): [0, 0];
    export function zero(dim: 3): [0, 0, 0];
    export function zero(dim: number): 0[];
    export function zero(dim: number): 0[] {
        return new Array(dim).fill(0);
    }

    export function newVect<N extends number>(dim: 1, val: N): [N];
    export function newVect<N extends number>(dim: 2, val: N): [N, N];
    export function newVect<N extends number>(dim: 3, val: N): [N, N, N];
    export function newVect<N extends number>(dim: number, val: N): N[];
    export function newVect<N extends number>(dim: number, val: N): N[] {
        return new Array(dim).fill(val);
    }

    export function toString(a: Vector) {
        return a.join(',');
    }

    export function equals(a: Vector, b: Vector) {
        return a.length == b.length && a.every((ai, i) => ai === b[i]);
    }

    export function eq(a: Vector) {
        return (b: Vector) => Vector.equals(a, b);
    }

    export function isZero(a: Vector) {
        return a.every((ai) => ai === 0);
    }

    export function nonZero(a: Vector) {
        return a.some((ai) => ai !== 0);
    }
}
