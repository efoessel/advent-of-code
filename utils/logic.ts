

export namespace Logic {
    type F<P extends unknown[], R> = (...args: P) => R;

    export const bool = <P extends unknown[], R>(fn: F<P, R>) =>
        (...args: P): boolean => Boolean(fn(...args));

    export const not = <P extends unknown[]>(fn: F<P, boolean>) =>
        (...args: P): boolean => !fn(...args);

    export const and = <P extends unknown[]>(...fns: F<P, boolean>[]) =>
        (...args: P): boolean => fns.every(fn => fn(...args));

    export const or = <P extends unknown[]>(...fns: F<P, boolean>[]) =>
        (...args: P): boolean => fns.some(fn => fn(...args));

    export const eq = <T>(a: T) => (b: T) => a === b;

    export const deepEq = <T>(a: T) => (b: T) => JSON.stringify(a) === JSON.stringify(b);

    export const neq = <T>(a: T) => (b: T) => a !== b;
}