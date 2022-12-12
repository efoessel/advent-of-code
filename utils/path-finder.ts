import { PriorityQueue } from './priority-queue';

type StateWithCost<S> = {
    cost: number,
    state: S,
};

// this is a mutable blob
export function findPath<S>(
    start: StateWithCost<S>[], 
    target: S[],
    getNextStates: (from: StateWithCost<S>) => StateWithCost<S>[],
    getKey: (s: S) => string
) {
    let cnt = 0;
    const alreadySeen = new Set<string>();
    const targetKeys = new Set<string>(target.map(getKey));
    const alive = new PriorityQueue<StateWithCost<S>>((a, b) => a.cost < b.cost);
    alive.push(...start);

    while(alive.size() > 0) {
        const current = alive.pop();
        const key = getKey(current.state);
        if(targetKeys.has(key)) {
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
        

        if(++cnt === 2000) {
            cnt = 0;
            console.log(`findPath, ${alive.size()} alive, ${alreadySeen.size} visited, ${current.cost} minimum cost`);
        }
    }
}
