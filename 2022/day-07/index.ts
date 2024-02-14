import { flow, identity, pipe } from 'fp-ts/function'
import { runStep } from '../../utils/run';
import { Arrays, Objects, parseBlocks } from '../../utils/@index';

type State = {
    files: Record<string, number>;
    dirs: string[];
    pwd: string[]
};

function addToState(state: State, line: string): State {
    const fullPath = (leafName: string) => {
        return '/'+state.pwd.concat([leafName]).join('/')
    }
    if (line === '$ cd /') {
        return {
            ...state,
            pwd: [],
        };
    } else if(line === '$ cd ..') {
        return {
            ...state,
            pwd: state.pwd.slice(0, -1),
        };
    } else if (line.startsWith('$ cd')) {
        return {
            ...state,
            pwd: [...state.pwd, line.substring(5)],
        };
    } else if(line === '$ ls') {
        return state;
    } else if(line.startsWith('dir ')) {
        return {
            ...state,
            dirs: [...state.dirs, fullPath(line.substring(4))],
        }
    } else { // it's a file
        const [, size, fileName] = line.match(/(\d+) (.+)/)!;
        return {
            ...state,
            files: {
                ...state.files,
                [fullPath(fileName)]: parseInt(size),
            }
        }
    }
}

const parse = flow(
    parseBlocks('\n', identity),
    Arrays.reduce(addToState, {files: {}, dirs: [''], pwd: []}),
);

function computeDirectoriesSize(state: State) {
    return state.dirs.map(dir => pipe(
        state.files,
        Objects.filter((_, name) => name.startsWith(dir+ '/')),
        Objects.values,
        Arrays.sum
    ))
}

const algo1 = flow(
    parse,
    computeDirectoriesSize,
    Arrays.filter(size => size < 100000),
    Arrays.sum
);

const algo2 = flow(
    parse,
    computeDirectoriesSize,
    Arrays.sortNumbers('ASC', identity),
    function(sizes) {
        const toFree = sizes[sizes.length-1] - 40000000;
        return sizes.find(x => x >= toFree);
    }
);

runStep(__dirname, 'step1', 'example', algo1, 95437);
runStep(__dirname, 'step1', 'real', algo1, 1517599);
runStep(__dirname, 'step2', 'example', algo2, 24933642);
runStep(__dirname, 'step2', 'real', algo2, 2481982);