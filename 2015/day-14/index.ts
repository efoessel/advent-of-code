import { flow } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Stream, parseBlocks } from '../../utils/@index';

const parse = flow(
    parseBlocks('\n', flow(
        (l) => l.split(/ can fly | km\/s for | seconds, but then must rest for | seconds\./),
        // Comet can fly 14 km/s for 10 seconds, but then must rest for 127 seconds.
        ([name, speed, endurance, rest,]) => ({name, speed: parseInt(speed), endurance: parseInt(endurance), rest: parseInt(rest)})
    )),
);

const getPositionAt = ({speed, endurance, rest}: {speed: number, endurance: number, rest: number}) => (time: number) => {
    const fullCycles = Math.floor(time / (endurance + rest));
    const lastCycleDuration = time - fullCycles * (endurance + rest);
    return speed * (endurance * fullCycles + Math.min(lastCycleDuration, endurance));
}

const algo1 = (raceDuration: number) => flow(
    parse,
    Arrays.map(getPositionAt),
    Arrays.map(f => f(raceDuration)),
    Arrays.max
)

const algo2 = (raceDuration: number) => flow(
    parse,
    Arrays.map(getPositionAt),
    (positionComputers) => Stream.fromRange(1, raceDuration+1)
        .map(time => positionComputers.map(p => p(time)))
        .reduce(
            (scores, positions) => {
                const max = Arrays.max(positions);
                return scores.map((s, i) => s + (positions[i] === max ? 1 : 0))
            },
            positionComputers.map(() => 0)
        ),
    Arrays.max
)

runStep(__dirname, 'step1', 'example', algo1(1000), 1120);
runStep(__dirname, 'step1', 'real', algo1(2503), 2696);
runStep(__dirname, 'step2', 'example', algo2(1000), 689);
runStep(__dirname, 'step2', 'real', algo2(2503), 1084);