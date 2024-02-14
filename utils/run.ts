
import fs from 'fs';
import path from 'path';
import { Arrays } from './arrays';
import { resetMemoStats } from './memo';

setInterval(() => console.log('tic-tac'), 1000000000);

let skipLongValue = false;
export function skipLong() {
    skipLongValue = true;
}

function readFile(dirname: string, file: string) {
    const fileStr = fs.readFileSync(path.join(dirname, file + '-data'), {
        encoding: 'utf-8',
    });
    return fileStr;
}

function toReadableTime(delay: number) {
    const split = [24, 60, 60, 1000].reduceRight(([curr, ...rest], s) => ([Math.floor(curr/s), curr%s , ...rest]), [delay]);
    return (Arrays.zip([split, ['j', 'h', 'm', 's', 'ms']])
        .filter(([v]) => v !== 0)
        .slice(0, 2)
        .map(a => a.join(''))
        .join('') || '<1ms').padStart(8, ' ');
}

export async function run(dirname: string, ...algos: ((input: string) => unknown)[]) {
    for(let step = 1 ; step < algos.length+1 ; step++ ) {
        const algo = algos[step-1];
        const data = readFile(dirname, process.argv[2]);
        const start = new Date().getTime();
        if(data.split('\n').pop() === '') {
            console.log(`\x1b[33mWarning, last line of input is empty !!!\x1b[0m`)
        }
        const result = await Promise.resolve(algo(data));
        const end = new Date().getTime();
        console.log(`Step ${step}:`, result, toReadableTime(end - start));
    }
    // keep running for ts-node-dev auto-restart
    setTimeout(() => console.log('auto-shutdown'), 1000000000);
}

function expandName(n: string) {
    const root = path.join(__dirname, '..');
    if(n.startsWith('@/')) return n.replace('@', root);
    return n;
}

export async function runAll(dirname: string | string[]) {
    const start = new Date().getTime();

    if(Array.isArray(dirname)) {
        for(const dir of dirname) {
            await runAll(dir);
        }
    } else {
        dirname = expandName(dirname);

        if(!fs.lstatSync(dirname).isDirectory()) {
            console.log(`\x1b[33m${dirname} skipped: not a directory\x1b[0m\t`);
            return;
        }

        for(const file of fs.readdirSync(dirname)) {
            if(fs.existsSync(path.join(dirname, file, 'index.ts'))) {
                await import(path.join(dirname, file));
            } else {
                await runAll(path.join(dirname, file));
            }
        }
    }

    const after = new Date().getTime();
    console.log(dirname, toReadableTime(after - start))
}

export async function createAndRun(dirName: string) {
    dirName = expandName(dirName);
    if(!fs.existsSync(dirName)) {
        console.log('Creating base for', dirName);
        fs.mkdirSync(dirName);
        fs.copyFileSync(path.join(__dirname, '../run/template/template.ts'), path.join(dirName, 'index.ts'));
        fs.closeSync(fs.openSync(path.join(dirName, 'example-data'), 'w'));
        fs.closeSync(fs.openSync(path.join(dirName, 'real-data'), 'w'));
    }
    await import(dirName);
}

export function runStep(dirname: string, label: string, inputData: string, algo: (input: string) => unknown, expected: unknown, long = false) {
    if(!inputData.includes(process.argv[2])) return;
    if(long && skipLongValue) {
        console.log(`\x1b[33m${dirname}\t ${label.padEnd(10, ' ')}\t ${inputData.padEnd(20, ' ')}\x1b[0m\t`, ' skipped');
        return;
    }

    const data = readFile(dirname, inputData);

    if(data.split('\n').pop() === '') {
        console.log(`\x1b[33mWarning, last line of input is empty !!!\x1b[0m`)
    }

    resetMemoStats();
    const start = new Date().getTime();
    const res = algo(data);
    const after = new Date().getTime();
    
    if(JSON.stringify(res) === JSON.stringify(expected)) {
        console.log(`\x1b[32m${dirname}\t ${label.padEnd(10, ' ')}\t ${inputData.padEnd(20, ' ')}\x1b[0m\t`, toReadableTime(after - start));
    } else {
        console.log(`\x1b[31m${dirname}\t ${label.padEnd(10, ' ')}\t ${inputData.padEnd(20, ' ')}\x1b[0m\t`, toReadableTime(after - start));
        console.log('got', res)
        console.log('expected', expected);
    }
}

export function assertThat<U>(fn: (u: U) => boolean, msg: string) {
    return (u: U) => {
        if(fn(u)) {
            return u;
        }
        throw msg;
    }
}

export function assertJSONEqual(a: unknown, b: unknown) {
    if(JSON.stringify(a) !== JSON.stringify(b)) {
        console.log(`\x1b[31m${JSON.stringify(a)} != ${JSON.stringify(b)}\x1b[0m`);
            throw 'Assertion error';
    }
}
