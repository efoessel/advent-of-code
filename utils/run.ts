
import fs from 'fs';
import path from 'path';

function readFile(dirname: string) {
    const fileStr = fs.readFileSync(path.join(dirname, process.argv[2] + '-data'), {
        encoding: 'utf-8',
    });
    return fileStr;
}

export function run(dirname: string, ...algos: ((input: string) => unknown)[]) {
    algos.forEach((algo, step) => {
        const data = readFile(dirname);
        if(data.split('\n').pop() === '') {
            console.log(`\x1b[31mWarning, last line of input is empty !!!\x1b[0m`)
        }
        console.log(`Step ${step+1}:`, algo(data));
    });
    // keep running for ts-node-dev auto-restart
    setTimeout(() => console.log('auto-shutdown'), 1000000000);
}

export function assert<T, U>(dirname: string, algo1: (input: string) => T, algo2: (input: string) => U, [expected1, expected2]: [T, U]) {
    const data = readFile(dirname);
    const res1 = algo1(data);
    const res2 = algo2(data);
    
    if(res1 === expected1 && res2 === expected2) {
        console.log(`\x1b[32m${dirname}\x1b[0m`);
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
}