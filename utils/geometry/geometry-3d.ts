import { flow } from 'fp-ts/lib/function';
import { Interval, Intervals } from '../interval';
import { Arrays } from '../arrays';


export type Vector3d = readonly [number, number, number];
export type Vector3dw = [number, number, number];

export namespace Geometry3d {
    export type Rotation = (v: Vector3d) => Vector3dw;

    export const BASE_VECTORS: Vector3d[] = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ];

    export const allRotations: Rotation[] = [
        ([x, y, z]) => [x, y, z],
        ([x, y, z]) => [x, z, -y],
        ([x, y, z]) => [x, -y, -z],
        ([x, y, z]) => [x, -z, y],
        ([x, y, z]) => [y, x, -z],
        ([x, y, z]) => [y, z, x],
        ([x, y, z]) => [y, -x, z],
        ([x, y, z]) => [y, -z, -x],
        ([x, y, z]) => [z, x, y],
        ([x, y, z]) => [z, y, -x],
        ([x, y, z]) => [z, -x, -y],
        ([x, y, z]) => [z, -y, x],
        ([x, y, z]) => [-x, y, -z],
        ([x, y, z]) => [-x, z, y],
        ([x, y, z]) => [-x, -y, z],
        ([x, y, z]) => [-x, -z, -y],
        ([x, y, z]) => [-y, x, z],
        ([x, y, z]) => [-y, z, -x],
        ([x, y, z]) => [-y, -x, -z],
        ([x, y, z]) => [-y, -z, x],
        ([x, y, z]) => [-z, x, -y],
        ([x, y, z]) => [-z, y, x],
        ([x, y, z]) => [-z, -x, y],
        ([x, y, z]) => [-z, -y, -x],
    ];
}


export type Cube = [Interval, Interval, Interval];

export namespace Cubes {
    export const R3: Cube = [Intervals.ALL, Intervals.ALL, Intervals.ALL];

    const replace = (c: Cube, i: number, repl: Interval): Cube => [
        i === 0 ? repl : c[0],
        i === 1 ? repl : c[1],
        i === 2 ? repl : c[2],
    ];

    export const from = (a: number, b: number): Cube => [Intervals.from(a, b), Intervals.from(a, b), Intervals.from(a, b)];
    export const fromIntegersIncluded = (a: number, b: number): Cube => [Intervals.fromIntegersIncluded(a, b), Intervals.fromIntegersIncluded(a, b), Intervals.fromIntegersIncluded(a, b)];

    export const volume: (c: Cube) => number = flow(Arrays.map(Intervals.length), Arrays.prod);

    export const includes = (n: Vector3d) => (c: Cube) => [0, 1, 2].every((i) => Intervals.includes(n[i])(c[i]));
    export const includedIn = (c: Cube) => (n: Vector3d) => [0, 1, 2].every((i) => Intervals.includes(n[i])(c[i]));

    export const contains = (contained: Cube) => (container: Cube) =>
        [0, 1, 2].every((i) => Intervals.contains(contained[i])(container[i]));
    export const containedIn = (container: Cube) => (contained: Cube) =>
        [0, 1, 2].every((i) => Intervals.contains(contained[i])(container[i]));

    export function intersection(...cubes: Cube[]): Cube | undefined {
        const res = [0, 1, 2].map(i => Intervals.intersection(...cubes.map(cube => cube[i])));
        if(res.some(i => i === undefined)) return undefined;
        return res as Cube;
    }
    export const intersects = (c1: Cube, c2: Cube) => [0, 1, 2].every((i) => Intervals.intersects(c1[i])(c2[i]));

    export const exclude = (from: Cube, removed: Cube) => [0, 1, 2].reduce<{safe: Cube[], toSplitAgain?: Cube}>(
        ({safe, toSplitAgain}, i) => {
            if(toSplitAgain === undefined) return {safe};
            const fromI = from[i], removedI = removed[i];
            const safeI = Intervals.exclude(fromI, removedI);
            const toSplitAgainI = Intervals.intersection(fromI, removedI);
            return {
                safe: safe.concat(safeI.map(si => replace(toSplitAgain, i, si))),
                toSplitAgain: toSplitAgainI ? replace(toSplitAgain, i, toSplitAgainI) : undefined
            };
        },
        {safe: [] as Cube[], toSplitAgain: from}
    ).safe;

    export const excludeAll = (from: Cube, removed: Cube[]) => removed.reduce(
        (from, r) => from.flatMap(f => exclude(f, r)),
        [from]
    );

    export const toString = (c: Cube) => '[' + c.map(Intervals.toString).join(',') +']';

    export const equals = (a: Cube, b: Cube) => a[0].from===b[0].from && a[0].to===b[0].to
        && a[1].from===b[1].from && a[1].to===b[1].to
        && a[2].from===b[2].from && a[2].to===b[2].to;
    export const eq = (a: Cube) => equals.bind(null, a);
}



// Utility to efficiently add / remove pieces of cubes
// holes are not guaranteed to not overlap, but must be kept consistent with regards to their own holes
export type CubeWithHoles = { container: Cube, holes: CubeWithHoles[] }
export namespace CubeWithHoles {
    export const from = (c: Cube): CubeWithHoles => ({container: c, holes: []});

    export function add(cube: CubeWithHoles, toAdd: Cube): CubeWithHoles {
        return {
            container: cube.container,
            holes: cube.holes.map(h => remove(h, toAdd)),
        };
    }

    export function remove(cube: CubeWithHoles, toRemove: Cube): CubeWithHoles {
        const inter = Cubes.intersection(cube.container, toRemove);
        if(inter) {
            if(Cubes.equals(inter, cube.container)) {
                return {
                    container: inter,
                    holes: [from(inter)],
                }
            }
            return {
                container: cube.container,
                holes: cube.holes.map(h => add(h, inter)).concat([from(inter)]),
            }
        } else {
            return cube;
        }
    }

    export function volume(cube: CubeWithHoles): number {
        return Cubes.volume(cube.container) - holesVolume(cube);
    }

    export function holesVolume(cube: CubeWithHoles): number {
        return cube.holes.reduce(
            ({alreadyCounted, volume}, hole) => {
                const holeWithoutOverlap = alreadyCounted.reduce((h, c) => remove(h, c), hole);
                return {
                    alreadyCounted: alreadyCounted.concat([hole.container]),
                    volume: volume + CubeWithHoles.volume(holeWithoutOverlap),
                }
            },
            {alreadyCounted: [] as Cube[], volume: 0}
        ).volume;
    }
}


// const findDistanceBetweenLines = (a: HailStone, b: HailStone) => {
//     const dir = crossProd3d(a.speed, b.speed);
//     if(Vector.isZero(dir)) { //parallel
//         return Vector.norm2(crossProd3d(Vector.sub(b.pos, a.pos), a.speed)) / Vector.norm2(b.speed);
//     } else {
//         // console.log('not coplanar', a, b, Math.abs(Vector.dotProd(dir, Vector.sub(a.pos, b.pos))) / Vector.norm2(dir))
//         return Math.abs(Vector.dotProd(dir, Vector.sub(a.pos, b.pos))) / Vector.norm2(dir);
//     }
// }