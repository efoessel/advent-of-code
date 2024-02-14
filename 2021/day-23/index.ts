import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Logic, Matrices, Matrix, Strings, findPath, findTargetPathBFS, memo } from '../../utils/@index';


const ALL_AMPHIPODS = ['A', 'B', 'C', 'D'] as const;
type Amphipod = typeof ALL_AMPHIPODS[number];
const costMultiplier = {A:1, B:10, C:100, D:1000};
function isAmphipod(x: string): x is Amphipod {
    return (ALL_AMPHIPODS as readonly string[]).includes(x);
}

const ROOMS = ['L1', 'L2', 'M1', 'M2', 'M3', 'R1', 'R2'] as const;
type Room = typeof ROOMS[number];
function isRoom(x: string): x is Room {
    return (ROOMS as readonly string[]).includes(x);
}

type Position = `G${Amphipod}` | Amphipod | Room;

// In order to make the state as memoizable as possible, we don't keep track of the positions of the amphipods in each room.
// we assume they always go far in the back. Given the rules (an amphipod only ever enters his home), it doesn't change results.
type State = Partial<Record<Room, Amphipod>> & Record<Amphipod, Amphipod[]>;


// The graph for path-finding in & out the rooms
const connections: Partial<Record<Position, Position[]>> = {
    'L1': ['L2'], // Hall areas from left to right
    'L2': ['L1', 'GA'],
    'GA': ['L2', 'M1', 'A'], // Gx area are the spot of the hall just in front of the x room
    'M1': ['GA', 'GB'],
    'GB': ['M1', 'M2', 'B'],
    'M2': ['GB', 'GC'],
    'GC': ['M2', 'M3', 'C'],
    'M3': ['GC', 'GD'],
    'GD': ['M3', 'R2', 'D'],
    'R2': ['GD', 'R1'],
    'R1': ['R2'],
};

// get the rooms required to be free for the move, and the total length of it
const connect = memo(
    (room: Room, home: Amphipod) => {
        const res = findTargetPathBFS<Position>(
            [room],
            (s) => s === home,
            (r) => connections[r] ?? [],
            identity
        )!;
        return [res.filter(isRoom).slice(0, -1), res.length-1] as const;
    },
    (room, home) => room+home
)



const parse = (step: 1|2) => flow(
    Strings.split('\n'),
    Arrays.slice(2, 4),
    Arrays.map(flow(
        Strings.split(''),
        Arrays.filter(isAmphipod)
        )),
    ([a, b]): Matrix<Amphipod> => step === 1 ? [a, b] : [a, ['D', 'C', 'B', 'A'], ['D', 'B', 'A', 'C'], b],
    (m) => ({
        'A': Matrices.getColumn(m, 0),
        'B': Matrices.getColumn(m, 1),
        'C': Matrices.getColumn(m, 2),
        'D': Matrices.getColumn(m, 3),
    })
);


function getTarget(step: 1|2): State {
    return {
        'A': pipe(['A'], Arrays.repeat(2*step)),
        'B': pipe(['B'], Arrays.repeat(2*step)),
        'C': pipe(['C'], Arrays.repeat(2*step)),
        'D': pipe(['D'], Arrays.repeat(2*step)),
    };
}

function getKey(s: State) {
    return ALL_AMPHIPODS.map(k => s[k].toString()).join(';') + '$' + ROOMS.map(k => s[k] ?? '.').join(';');
}

const algo = (step: 1|2) => flow(
    parse(step),
    (s0) => findPath<State>(
        [{state: s0, cost: 0}],
        [getTarget(step)],
        ({state, cost}) => {
            const moves: {state: State, cost: number}[] = [];

            // Amphipod moving out of a room
            ALL_AMPHIPODS.forEach(h => {
                const x = state[h];
                if(x.length === 0) return; // this home is empty
                if(x.every(Logic.eq(h))) return; // this home is already filled with the right amphipods, going out is guaranteed not optimal
                const [f, ...rest] = x;

                ROOMS.filter(r => state[r] === undefined).forEach(r => { // for each room outside
                    const [path, pLength] = connect(r, h); // the path to get there
                    if(path.some(p => state[p] !== undefined)) return // not reachable because another amphipod is on the path

                    moves.push({
                        state: {
                            ...state,
                            [r]: f,
                            [h]: rest,
                        },
                        cost: cost + costMultiplier[f] * (pLength + 2*step - x.length),
                    })
                })
            })

            // Amphipod moving back to a room
            ROOMS.forEach(r => {
                const x = state[r];
                if(!x) return; // room is empty
                if(state[x].some(y => y !== x)) return; // it can't go home because home contains an other type of amphipod
                const [path, pLength] = connect(r, x); // the path to get there
                if(path.some(p => state[p] !== undefined)) return // not reachable because another amphipod is on the path

                moves.push({
                    state: {
                        ...state,
                        [r]: undefined,
                        [x]: [x, ...state[x]],
                    },
                    cost: cost + costMultiplier[x] * (pLength + 2*step - state[x].length -1),
                })
            });

            return moves;
        },
        getKey
    )!.cost
);


runStep(__dirname, 'step1', 'example', algo(1), 12521);
runStep(__dirname, 'step1', 'real', algo(1), 12530);
runStep(__dirname, 'step2', 'example', algo(2), 44169);
runStep(__dirname, 'step2', 'real', algo(2), 50492);
