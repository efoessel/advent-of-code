export const basicParseInt = (x: string) => {
    if(isNaN(parseInt(x))) {
        throw new Error('Nan while parsing '+x)
    }
    return parseInt(x);
}



export function parseBlocks<T>(separator: string, map: (b: string, i: number, allBlocks: string[]) => T) {
    return (line: string) => line.split(separator).map(map);
}

export const castTo = <T> (x: unknown) => x as T;

export namespace Parse {
    export const extractInt = (x: string) => {
        const found = x.match(/(-?\d+)/);
        if(found === null) {
            throw new Error('Unable to extract integer from '+x);
        } else {
            return parseInt(found[1]);
        }
    }
    
    export const extractIntArray = (x: string): number[] => {
        const found = x.match(/(-?\d+)/g);
        if(found === null) {
            return [];
        } else {
            return found.map(basicParseInt);
        }
    }

    export const extractRegexp = (reg: RegExp) => (x: string) => {
        const found = x.match(reg);
        if(found === null) {
            throw new Error('Unable to extract regexp '+reg+' from '+x);
        } else {
            return found[1];
        }
    }
}