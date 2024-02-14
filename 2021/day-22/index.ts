import { flow, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Intervals, Parse, Strings, isFieldDefined } from '../../utils/@index';
import { Cube, CubeWithHoles, Cubes } from '../../utils/geometry/geometry-3d';

const parse = flow(
    Strings.split('\n'),
    Arrays.map(flow(
        Strings.split(' '),
        ([mode, cube]) => ({
            mode: mode === 'on',
            cube: pipe(cube,
                Parse.extractIntArray,
                ([x1, x2, y1, y2, z1, z2]): Cube => [
                    Intervals.fromIntegersIncluded(x1, x2),
                    Intervals.fromIntegersIncluded(y1, y2),
                    Intervals.fromIntegersIncluded(z1, z2),
                ]
            )
        })
    ))
);

const algo = (box: Cube) => flow(
    parse,
    Arrays.map(({mode, cube}) => ({
        mode,
        cube: Cubes.intersection(box, cube)
    })),
    Arrays.filter(isFieldDefined('cube')),
    Arrays.reduce(
        (box, {mode, cube}) => {
            if(mode) {
                return CubeWithHoles.remove(box, cube);
            } else {
                return CubeWithHoles.add(box, cube);
            }
        },
        CubeWithHoles.from(box)
    ),
    box => CubeWithHoles.holesVolume(box)
);

const algo1 = algo(Cubes.fromIntegersIncluded(-50, 50));
const algo2 = algo(Cubes.R3);


runStep(__dirname, 'step1', 'example', algo1, 39);
runStep(__dirname, 'step1', 'real', algo1, 611378);
runStep(__dirname, 'step2', 'example2', algo2, 2758514936282235);
runStep(__dirname, 'step2', 'real', algo2, 1214313344725528);