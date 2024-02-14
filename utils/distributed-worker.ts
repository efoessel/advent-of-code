import { parentPort } from 'worker_threads';

type Task = {
    func: string,
    input: unknown[],
}

if(!parentPort) throw new Error('worker unabled to connect to parent');

parentPort.on('message', async ({func, input}: Task) => {
    const executableFunc = (await import(func)).process as (...i: unknown[]) => unknown;
    const result = executableFunc(...input);
    parentPort!.postMessage(result);
})
