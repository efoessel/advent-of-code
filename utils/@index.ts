export * from './arithmetics';
export * from './arrays';
export * from './interval';
export * from './grids';
export * from './objects';
export * from './parse';
export * from './path-finder';
export * from './strings';
export * from './containers/stream';
export * from './types';
export * from './geometry/vectors';
export * from './memo';
export * from './logic';


let depth = 0;
let doLog = true;
export const skipLog = () => doLog = false;

export const log = <T>(x: T) => {
    doLog && console.log('  '.repeat(depth)+':', x);
    return x;
}

export const logW = <T extends unknown[], U>(prefix: string, fn: (...x: T) => U) => (...x: T) => {
    doLog && console.log('  '.repeat(depth++) + prefix, 'input:', x);
    const res = fn(...x);
    doLog && console.log('  '.repeat(--depth) + prefix, 'output:', res);
    return res;
};

/**
 * applies all arguments except first in order to get a function of the first argument only
 * const res = Arrays.map(array, mapFn);
 * const res = f(Arrays.map)(mapFn)(array)
 */ 
export const f = <F, T extends unknown[], U>(func: (f: F, ...others: T) => U) => (...others: T) => (f: F) => func(f, ...others);
