import { flow } from 'fp-ts/lib/function';
import { PriorityQueue } from './priority-queue';

export type StateWithCost<S> = {
    cost: number,
    state: S,
};

// this is a mutable blob
export function findPath<S>(
    start: StateWithCost<S>[], 
    target: S[] | ((s:S)=>boolean),
    getNextStates: (from: StateWithCost<S>) => StateWithCost<S>[],
    getKey: (s: S) => string
) {
    const alreadySeen = new Set<string>();
    const isTarget = (() => {
        if(Array.isArray(target)) {
            const targetKeys = new Set<string>(target.map(getKey));
            return (s: S) => targetKeys.has(getKey(s));
        }
        return target;
    })();
    const alive = new PriorityQueue<StateWithCost<S>>((a, b) => a.cost < b.cost);
    alive.push(...start);

    while(alive.size() > 0) {
        const current = alive.pop();
        const key = getKey(current.state);
        if(isTarget(current.state)) {
            return current;
        }
        if(alreadySeen.has(key)) {
            continue; // happens when several paths lead to the same pos => just ignore the current one, which is the worst one.
        }
        alreadySeen.add(key);
        const nextStates = getNextStates(current)
            .filter(state => !alreadySeen.has(getKey(state.state)));
        //console.log(nextStates)
        alive.push(...nextStates);
        

        /*if(++cnt === 2000) {
            cnt = 0;
            console.log(`findPath, ${alive.size()} alive, ${alreadySeen.size} visited, ${current.cost} minimum cost`);
        }*/
    }
}

export function findReachableNodes<S>(
    start: S[], 
    getNextStates: (from: S) => S[],
    getKey: (s: S) => string
) {
    const alive = [...start];
    const reachable: S[] = [];
    const visited = new Set<string>(start.map(getKey));

    while(alive.length > 0) {
        const curr = alive.pop()!;
        const next = getNextStates(curr).filter(n => !visited.has(getKey(n)));
        next.forEach(n => visited.add(getKey(n))),
        alive.push(...next);
        reachable.push(curr);
    }
    return reachable;
}

export function findTargetBFS<S>(
    start: S[],
    isTarget: (s: S, step: number) => boolean,
    getNextStates: (from: S, step: number) => S[],
    getKey: (s: S, step: number) => string
): [number, S] | undefined {
    const visited = new Set<string>(start.map(s => getKey(s, 0)));
    let currentAlive = start.values();
    let step = 1;

    for(;;) {
        const nextAlive = new Map<string, S>();
        for(const curr of currentAlive) {
            if(isTarget(curr, step)) return [step, curr];
            getNextStates(curr, step).forEach(n => {
                const nKey = getKey(n, step)
                if(visited.has(nKey)) return;
                visited.add(nKey);
                nextAlive.set(nKey, n);
            });
        }

        if(nextAlive.size === 0) {
            return undefined;
        } else {
            currentAlive = nextAlive.values();
            step++;
        }
    }
}

export const findTargetDistBFS = flow(
    findTargetBFS,
    x => x ? x[0]-1 : undefined,
)

type StateWithPrev<S> = {state: S, prev?: StateWithPrev<S>};
const reduceToPath = <S>(s?: StateWithPrev<S>): S[] => s === undefined ? [] : [s.state, ...reduceToPath(s.prev)];

export function findTargetPathBFS<S>(
    start: S[],
    isTarget: (s: S, step: number) => boolean,
    getNextStates: (from: S, step: number) => S[],
    getKey: (s: S, step: number) => string
): S[] | undefined {
    const targetWithPath = findTargetBFS<StateWithPrev<S>>(
        start.map(s => ({state: s})),
        ({state}, step) => isTarget(state, step),
        (swp, step) => getNextStates(swp.state, step).map(s => ({state: s, prev: swp})),
        ({state}, step) => getKey(state, step),
    );

    if(targetWithPath) {
        return reduceToPath(targetWithPath[1])
    }
}


export function findTargetPath<S>(
    start: StateWithCost<S>[],
    isTarget: (s: S) => boolean,
    getNextStates: (from: StateWithCost<S>) => StateWithCost<S>[],
    getKey: (s: S) => string
) {
    const targetWithPath = findPath<StateWithPrev<S>>(
        start.map(({cost, state}) => ({cost, state: {state}})),
        ({state}) => isTarget(state),
        ({cost, state: {state, prev}}) => getNextStates({cost, state}).map((n) => ({cost: n.cost, state: {state: n.state, prev: {state, prev}}})),
        ({state}) => getKey(state),
    );

    return reduceToPath(targetWithPath?.state);
}