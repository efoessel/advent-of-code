let hit = 0, miss=0;

let globalIdCnt = 0;
const globalSeen = new WeakMap<object, number>();
export const uniqueObjectId = (o: object) => {
    if(globalSeen.has(o)) {
        return globalSeen.get(o)
    } else {
        globalSeen.set(o, ++globalIdCnt);
        return globalIdCnt;
    }
}

export const uniqueObjectIds = (...o: object[]) => {
    return o.map(uniqueObjectId).join(',');
}

export const memo = <T extends unknown[], U>(fn: (...x: T) => U, hash: (...x: T) => string = (...x) => JSON.stringify(x)): (...x: T) => U => {
    const seen = new Map<string, U>();
    return (...x: T) => {
        // console.log('cache stats', hit, miss)
        const h = hash(...x);
        if(seen.has(h)) {
            hit++;
            return seen.get(h)!;
        }
        const res = fn(...x);
        miss++;
        seen.set(h, res);
        return res;
    }
}

export const verboseMemo = <T extends unknown[], U>(fn: (...x: T) => U, hash: (...x: T) => string = (...x) => JSON.stringify(x)): (...x: T) => U => {
    const seen = new Map<string, U>();
    const seenInputs = new Map<string, T>();
    return (...x: T) => {
        const h = hash(...x);
        if(seen.has(h)) {
            console.log('cache hit', x, seen.get(h), seenInputs.get(h))
            hit++;
            return seen.get(h)!;
        }
        console.log('cache miss', hit, miss)
        const res = fn(...x);
        miss++;
        seen.set(h, res);
        seenInputs.set(h, x);
        return res;
    }
}

export const showMemoStats = () => {
    console.log('cache hits:', hit, 'miss:', miss);
}

export const resetMemoStats = () => {
    hit = 0;
    miss = 0;
}

export const cycleDetector = <T>(action: (i: T, cnt: number) => T, hash : (i: T) => string, targetCycle: number, initial: T) => {
    const seen = new Map<string, number>();
    let current = initial;
    for(let i = 0 ; i < targetCycle ; i++) {
        const h = hash(current);
        const prev = seen.get(h);
        if(prev !== undefined) {
            const period = i - prev;
            i += Math.floor((targetCycle - i) / period) * period
            return {start: prev, period, current};
        }
        seen.set(hash(current), i);
        current = action(current, i);
    }
    return { current };
}

export const runWithPeriodSkipper = <T>(action: (i: T, cnt: number) => T, hash : (i: T) => string, targetCycle: number, initial: T) => {
    let {start, period, current} = cycleDetector(action, hash, targetCycle, initial);
    if(period === undefined || start === undefined) return current;

    let i = start + Math.floor((targetCycle - start) / period) * period
    for( ; i < targetCycle ; i++) {
        current = action(current, i);
    }
    return current;
}