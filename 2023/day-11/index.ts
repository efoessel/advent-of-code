import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Intervals, Vector, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', (line => {
        return line
    })),
);

const findGalaxies = (universe: string[]) => {
    return universe.flatMap((line, y) => {
        return line.split('#')
            .slice(0, -1)
            .reduce(
                ({cnt, gal}, chunk) => ({cnt: cnt+chunk.length+1, gal: gal.concat([[cnt+chunk.length, y]])}),
                {cnt: 0, gal:[] as [number, number][]})
            .gal
    })
}

const findGalaxyLessLine = (galaxies: [number, number][], dir: 0|1) => {
    const min = Math.min(...galaxies.map(g => g[dir]));
    const max = Math.max(...galaxies.map(g => g[dir]));
    return Arrays.range(min, max).filter(
        l => galaxies.every(g => g[dir] !== l)
    )
}

const algo = (factor: number) => flow(
    parse,
    findGalaxies,
    (galaxies) => {
        const rows = findGalaxyLessLine(galaxies, 1);
        const cols = findGalaxyLessLine(galaxies, 0);
        return pipe(galaxies,
            Arrays.getPairs,
            Arrays.map(([g1, g2]) => Vector.manhattanDist(g1, g2)
                + rows.filter(Intervals.includedIn(Intervals.fromIntegersIncluded(g1[1], g2[1]))).length * (factor-1)
                + cols.filter(Intervals.includedIn(Intervals.fromIntegersIncluded(g1[0], g2[0]))).length * (factor-1)
            )
        )
    },
    Arrays.sum
);

runStep(__dirname, 'step1', 'example', algo(2), 374);
runStep(__dirname, 'step1', 'real', algo(2), 9312968);
runStep(__dirname, 'step2', 'example', algo(10), 1030);
runStep(__dirname, 'step2', 'example', algo(100), 8410);
runStep(__dirname, 'step2', 'real', algo(1000000), 597714117556);
