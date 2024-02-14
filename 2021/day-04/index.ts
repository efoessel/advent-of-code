import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, Parse, Stream, Strings, assertDefined } from '../../utils/@index';
import { Matrix, Matrices } from '../../utils/grids';
import { Logic } from '../../utils/logic';

const parse = flow(
    Strings.split('\n\n'),
    ([draw, ...grids]) => ({
        draw: Parse.extractIntArray(draw),
        grids: grids.map(Bingo.parse),
    }),
);

namespace Bingo {
    type Cell = {
        val: number,
        played: boolean,
    }

    export type Grid = Matrix<Cell>;

    export const parse: (str: string) => Grid = flow(
        Strings.split('\n'),
        Arrays.map(Parse.extractIntArray),
        Matrices.map(val => ({val, played: false}))
    );

    export const play = (n: number) => (g: Grid): Grid => {
        const grid = pipe(g, Matrices.map(({val, played}) => ({val, played: played || val === n})));
        return grid;
    }

    const hasLine: (g: Grid) => boolean = Arrays.some(Arrays.every(({played}) => played));
    const hasColumn: (g: Grid) => boolean = flow(Matrices.transpose, hasLine);

    export const score = (lastPlayed: number) => (g: Grid): number => {
        const isWinning = hasLine(g) || hasColumn(g);
        return isWinning
            ? pipe(g,
                Matrices.filter(Logic.not(Objects.pluck('played'))),
                Arrays.map(Objects.pluck('val')),
                Arrays.sum,
            ) * lastPlayed
            : 0;
    }
}

const playUntilWin = (grid: Bingo.Grid, draws: number[]) => Stream.fromIterable(draws).reduceUntil(
        ({score}) => score > 0,
        ({grid}, d, i) => {
            const ngrid = Bingo.play(d)(grid);
            const score = Bingo.score(d)(ngrid);
            return {grid: ngrid, score, i};
        },
        {grid, score: 0, i: -1}
    )

const algo1 = flow(
    parse,
    ({draw, grids}) => grids.map(grid => playUntilWin(grid, draw)),
    Arrays.withMin(Objects.pluck('i')),
    assertDefined,
    Objects.pluck('score')
);

const algo2 = flow(
    parse,
    ({draw, grids}) => grids.map(grid => playUntilWin(grid, draw)),
    Arrays.withMax(Objects.pluck('i')),
    assertDefined,
    Objects.pluck('score')
);

runStep(__dirname, 'step1', 'example', algo1, 4512);
runStep(__dirname, 'step1', 'real', algo1, 38913);
runStep(__dirname, 'step2', 'example', algo2, 1924);
runStep(__dirname, 'step2', 'real', algo2, 16836);
