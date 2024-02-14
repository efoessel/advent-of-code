import { Arrays } from './arrays';


export namespace PG2D {
    export type Point = [number, number];
    export type Segment = [Point, Point];
    export type Square = [Point, Point];

    export function Square(p1: Point, p2: Point): Square {
        return [
            [Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1])],
            [Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1])],
        ];
    }

    export type SquareWithHoles = {
        sq: Square
        holes: SquareWithHoles[];
    }

    type Interval = readonly [number, number];
    export namespace Interval {

        export const intersection = (i1: Interval) => (i2: Interval): Interval|undefined => {
            const newFrom = Math.max(i1[0], i2[0]);
            const newTo = Math.min(i1[1], i2[1]);
            if(newFrom > newTo) return undefined;
            else return [newFrom, newTo];
        }

        export const overlap = (i1: Interval) => (i2: Interval): boolean => {
            return Math.min(i1[1], i2[1]) <= Math.max(i1[0], i2[0]);
        }

        export const union = (i1: Interval) => (i2: Interval): Interval[] => {
            return Math.min(i1[1], i2[1]) <= Math.max(i1[0], i2[0])
                ? [[Math.min(i1[0], i2[0]), Math.max(i1[1], i2[1])]]
                : [i1, i2]
        }

        export const remove = (i1: Interval) => (i2: Interval): Interval[] => {
            const left = intersection(i1)([-Infinity, i2[0]-1]);
            const right = intersection(i1)([i2[1]+1, Infinity]);
            return left && right ? [left, right] : left ? [left] : right ? [right]: [];
        }

        export const containsValue = (i: Interval, p: number) => i[0] <= p && i[1] >= p;

        export const length = (i: Interval) => i[1] - i[0] + 1;
    }

    export namespace Square {
        type Dim = typeof DIMS[number];
        const DIMS = [1, 2] as const;

        /**
         * Creates a square from to opposite angles
         * @returns AlignedSquare
         */
        export function fromAngles(p1: Point, p2: Point): Square {
            return [
                [Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1])],
                [Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1])],
            ];
        }

        /**
         * Creates a square from the ranges covered
         * @returns AlignedSquare
         */
        export function fromRanges(rx: Interval, ry: Interval): Square {
            return [
                [rx[0], ry[0]],
                [rx[1], ry[1]],
            ];
        }

        /**
         * Gets the coordinate range intersected by the square (dim is 1 or 2)
         * @returns AlignedSquare
         */
        export const range = (dim: 1|2) => (sq1: Square): Interval  => ([sq1[0][dim-1], sq1[1][dim-1]]);

        /**
         * Gets the intersection of two squares. It's a smaller square, or undefined
         * @returns AlignedSquare | undefined
         */
        export const intersection = (sq1: Square) => (sq2: Square): Square | undefined  => {
            const [interX, interY] = DIMS.map((dim) => Interval.intersection(range(dim)(sq1))(range(dim)(sq2)));
            if(interX && interY) return fromRanges(interX, interY);
            else return;
        }

        export const surface = (sq: Square) => Arrays.prod(DIMS.map(d => Interval.length(range(d)(sq))));

        export const cutSlice = (sq: Square, dim: Dim, slice: Interval): {cut?: Square, remaining: Square[]} => {
            const replaceRange = (r: Interval) => DIMS.map(i => i===dim ? r : range(i)(sq)) as [Interval, Interval];
            const intersection = Interval.intersection(range(dim)(sq))(slice);
            if(intersection === undefined) return {remaining: [sq]};
            const toKeep = Interval.remove(range(dim)(sq))(slice);
            return {
                cut: fromRanges(...replaceRange(intersection)),
                remaining: toKeep.map(i => fromRanges(...replaceRange(i))),
            }
        }

        export const cutHole = (sq: Square, hole: Square): Square[] => {
            const sqxr = range(1)(sq), hxr = range(1)(hole), ix = Interval.intersection(sqxr)(hxr);
            const sqyr = range(2)(sq), hyr = range(2)(hole), iy = Interval.intersection(sqyr)(hyr);
            if(ix === undefined || iy === undefined) return [sq];
            const restx = Interval.remove(sqxr)(hxr);
            const resty = Interval.remove(sqyr)(hyr);
            return [
                ...restx.map(i => fromRanges(i, sqyr)),
                ...resty.map(i => fromRanges(ix, i)),
            ];
        }

        export const cutHole2 = (sq: Square) => (hole: Square): Square[] => {
            type S = {done: Square[], toCut?: Square}
            return DIMS.reduce(({done, toCut}, dim) => {
                if(!toCut) return {done};
                const {cut, remaining} = cutSlice(toCut, dim, range(dim)(hole));
                return {
                    toCut: cut,
                    done: done.concat(remaining),
                }
            }, {done: [], toCut: sq} as S).done;
        }

        export const containsPoint = (sq: Square, p: Point): boolean => DIMS.every(d => Interval.containsValue(range(d)(sq), p[d-1]));

    }

    
    


}