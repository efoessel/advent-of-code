import { flow, pipe } from 'fp-ts/function';
import { Arrays } from './arrays';
import { Vector } from './geometry/vectors';

export type Matrix<T> = readonly (readonly T[])[];
export type RWMatrix<T> = T[][];

export const DIRECTIONS = ['v', '^', '>', '<'] as const;
export type Direction = typeof DIRECTIONS[number];

export namespace Directions {
    export const apply = (d: Direction) => ([r, c]: readonly [number, number]) => {
        switch(d) {
            case '<': return [r, c-1] as const;
            case '>': return [r, c+1] as const;
            case '^': return [r-1, c] as const;
            case 'v': return [r+1, c] as const;
        }
    }
}

export namespace Matrices {
    type mapFn<T, U> = (elem: T, [row, col]: [number, number]) => U;
    type predicateFn<T> = mapFn<T, boolean>;
    type reducerFn<T, U> = (acc: U, elem: T, [row, col]: [number, number]) => U;
    // type reducerStopFn<T, U> = (acc: U, elem: T, [row, col]: [number, number]) => boolean;


    export const at = <T>(m: Matrix<T>) => ([r, c]: Vector) => m.at(r)?.at(c);

    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    export const atUnsafe = <T>(m: Matrix<T>) => ([r, c]: Vector) => m.at(r)?.at(c)!;

    export function getColumn<T>(m: Matrix<T>, c: number) {
        return m.length === 0 ? [] : m.map((_,i) => m[i][c]);
    }

    export const dim = <T>(m: Matrix<T>) => ({rows: m.length, cols: m.at(0)?.length ?? 0});

    export const nbRows = <T>(m: Matrix<T>) => m.length;
    export const nbCols = <T>(m: Matrix<T>) => m.at(0)?.length ?? 0;

    export const values = <T>(m: Matrix<T>) => Arrays.map(([r, c]: Vector) => m[r][c]);

    export const map = <T, U>(fn: mapFn<T, U>) => {
        return (arr: Matrix<T>): RWMatrix<U> => arr.map((l, i) => l.map((c, j) => fn(c, [i, j])));
    };

    export const zeros = (rows: number, cols: number): RWMatrix<0> => {
        return pipe(
            Arrays.range(0, rows),
            Arrays.map(() => Arrays.range(0, cols)),
            map(() => 0)
        );
    };

    export const transpose = <T>(m: Matrix<T>): RWMatrix<T> => m.length === 0
        ? []
        : pipe(
            zeros(m[0].length, m.length),
            map((_, [row, col]) => m[col][row])
        )
    
    export const filter = <T>(fn: predicateFn<T>) => {
        return (m: Matrix<T>) => m.flatMap((line, row) => line.filter((val, col) => fn(val, [row, col])));
    };

    export const count = <T>(fn: predicateFn<T>) => reduce<T, number>((acc, v, p) => acc + (fn(v, p) ? 1 : 0), 0);

    export const filterPoints = <T>(fn: predicateFn<T>) => {
        return (m: Matrix<T>) => m.flatMap((line, row) => line
            .map((val, col) => [val, col] as const)
            .filter(([val], col) => fn(val, [row, col]))
            .map(([, col]) => [row, col] as const)
        );
    };

    export const reduce = <T, U>(fn: reducerFn<T, U>, initialValue: U) => {
        return (m: Matrix<T>) => m.reduce((acc, row, r) => row.reduce((acc, cell, c) => fn(acc, cell, [r, c]), acc), initialValue);
    };



    // neighborhood
    export const getNeighbors = <T>(m: Matrix<T>) => ([r, c]: Vector) =>
        [[-1, 0], [1, 0], [0, 1], [0, -1]]
            .map(([x, y]) => [r+x, c+y] as const)
            .filter(([r, c]) => r>=0 && c>=0 && r<m.length && c<m[0].length)
    
    export const getNeighborsWithDiags = <T>(m: Matrix<T>) => ([r, c]: Vector) =>
        [[-1, 0], [1, 0], [0, 1], [0, -1], [-1, 1], [-1, -1], [1, 1], [1, -1]]
            .map(([x, y]) => [r+x, c+y] as const)
            .filter(([r, c]) => r>=0 && c>=0 && r<m.length && c<m[0].length)

    export const getNeighborValues = <T>(m: Matrix<T>) => flow(getNeighbors(m), values(m));
    export const getNeighborWithDiagsValues = <T>(m: Matrix<T>) => flow(getNeighborsWithDiags(m), values(m));

    export const getCellInDirection = <T>(m: Matrix<T>) => ([r, c]: Vector, d: Direction) =>
        Matrices.at(m)(Directions.apply(d)([r, c]))

    export const getCellsInDirection = <T>(m: Matrix<T>) => ([r, c]: Vector, d: Direction) => {
        switch(d) {
            case '<':
                return Arrays.range(c-1, -1).map(z => [r, z] as const);
            case '>':
                return Arrays.range(c+1, m[0].length).map(z => [r, z] as const);
            case '^':
                return Arrays.range(r-1, -1).map(z => [z, c] as const);
            case 'v':
                return Arrays.range(r+1, m.length).map(z => [z, c] as const);
        }
    }

    export const getValuesInDirection = <T>(m: Matrix<T>) => ([r, c]: Vector, d: Direction) => {
        switch(d) {
            case '<':
                return Arrays.range(c-1, -1).map(z => m[r][z]);
            case '>':
                return Arrays.range(c+1, m[0].length).map(z => m[r][z]);
            case '^':
                return Arrays.range(r-1, -1).map(z => m[z][c]);
            case 'v':
                return Arrays.range(r+1, m.length).map(z => m[z][c]);
        }
    }

    // repeat
    export const repeat = <T>(rowF: number, colF: number) => (m: Matrix<T>): RWMatrix<T> => pipe(m,
        Arrays.repeat(rowF),
        Arrays.map(Arrays.repeat(colF))
    );
}
