export type Mapper<T, R> = (v: T) => R;
export type BiMapper<T, R> = (a: T, b: T) => R;

export type Operator<T> = Mapper<T, T>;
export type BiOperator<T> = BiMapper<T, T>;

export type Consumer<T> = Mapper<T, void>;
export type BiConsumer<T> = BiMapper<T, void>;

export type Predicate<T> = Mapper<T, boolean>;

export type Lazy<T> = () => T;
export type TypeGuard<T, U extends T> = (v: T) => v is U;

export const isDefined = <T>(t: T): t is NonNullable<T> => t !== undefined && t !== null;

export const isFieldDefined = <T, K extends keyof T>(k: K) => (t: T): t is T & {[k in K]: NonNullable<T[k]>} => t[k] !== undefined && t[k] !== null;

export const assertDefined = <T>(t: T): NonNullable<T> => {
    if(isDefined(t)) return t;
    throw 'Unexpected undefined value: '+t;
}
