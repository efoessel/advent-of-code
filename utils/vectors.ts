import { Arrays } from './arrays';

export type Vector = number[];

export namespace Vector {
    export function add(...a: Vector[]): Vector {
        return Arrays.zip(...a).map(Arrays.sum);
    }
    export function sub(a: Vector, b: Vector): Vector {
        return Arrays.zip(a, b).map(([ai, bi]) => ai-bi);
    }
    export function mult(lambda: number, a: Vector) {
        return a.map(ai => lambda*ai)
    }
    export function multEach(a: Vector, b: Vector) {
        return Arrays.zip(a, b).map(([ai, bi]) => ai*bi);
    }
    export function div(lambda: number, a: Vector) {
        return a.map(ai => ai/lambda)
    }
    export function divEach(a: Vector, b: Vector) {
        return Arrays.zip(a, b).map(([ai, bi]) => ai/bi);
    }
    export function mod(lambda: number, a: Vector) {
        return a.map(ai => ai%lambda)
    }
    export function modEach(a: Vector, b: Vector) {
        return Arrays.zip(a, b).map(([ai, bi]) => ai%bi);
    }
    export function prod(a: Vector, b: Vector): Vector {
        return Arrays.zip(a, b).map(([ai, bi]) => ai*bi);
    }
    export function sign(a: Vector): Vector {
        return a.map((ai) => Math.sign(ai));
    }
    export function abs(a: Vector): Vector {
        return a.map((ai) => Math.abs(ai));
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
    export function zero(dim: number) {
        return Arrays.range(0, dim).map(() => 0);
    }
    export function ones(dim: number) {
        return Arrays.range(0, dim).map(() => 1);
    }
    export function toString(a: Vector) {
        return a.join(',');
    }
}
