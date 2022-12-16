
import fs from 'fs';
import path from 'path';
import { Arrays } from './arrays';

function readFile(dirname: string) {
    const fileStr = fs.readFileSync(path.join(dirname, process.argv[2] + '-data'), {
        encoding: 'utf-8',
    });
    return fileStr;
}

function toReadableTime(delay: number) {
    const split = [24, 60, 60, 1000].reduceRight(([curr, ...rest], s) => ([Math.floor(curr/s), curr%s , ...rest]), [delay]);
    return (Arrays.zip(split, ['j', 'h', 'm', 's', 'ms'])
        .filter(([v]) => v !== 0)
        .slice(0, 2)
        .map(a => a.join(''))
        .join('') || '<1ms').padStart(8, ' ');
}

export async function run(dirname: string, ...algos: ((input: string) => unknown)[]) {
    for(let step = 1 ; step < algos.length+1 ; step++ ) {
        const algo = algos[step-1];
        const data = readFile(dirname);
        const start = new Date().getTime();
        if(data.split('\n').pop() === '') {
            console.log(`\x1b[31mWarning, last line of input is empty !!!\x1b[0m`)
        }
        const result = await Promise.resolve(algo(data));
        const end = new Date().getTime();
        console.log(`Step ${step}:`, result, toReadableTime(end - start));
    }
    // keep running for ts-node-dev auto-restart
    setTimeout(() => console.log('auto-shutdown'), 1000000000);
}

export function assert<T, U>(dirname: string, algo1: (input: string) => T, algo2: (input: string) => U, [expected1, expected2]: [T, U]) {
    const data = readFile(dirname);
    const start = new Date().getTime();
    const res1 = algo1(data);
    const after1 = new Date().getTime();
    const res2 = algo2(data);
    const after2 = new Date().getTime();
    
    if(res1 === expected1 && res2 === expected2) {
        console.log(`\x1b[32m${dirname}\x1b[0m\t`, toReadableTime(after1 - start), toReadableTime(after2-after1));
    } else {
        console.log(`\x1b[31m${dirname}\x1b[0m`);
        if(res1 !== expected1) {
            console.log('On step 1:', {
                got: res1,
                expected: expected1,
            })
        }
        if(res2 !== expected2) {
            console.log('On step 2:', {
                got: res2,
                expected: expected2,
            })
        }
    }

    setTimeout(() => console.log('auto-shutdown'), 1000000000);
}