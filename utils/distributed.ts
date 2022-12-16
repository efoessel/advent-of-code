import { Worker } from 'worker_threads';
import { Arrays } from './arrays';
import path from 'path';


type MyWorker<I, O> = {
    worker: Worker,
    status: 'idle' | 'working',
    currentTask?: MyTask<I, O>
}

type MyTask<I, O> = {
    input: I,
    resolve: (o: O) => void,
}

export class DistributedTask<I extends any[], O> {
    workers: MyWorker<I, O>[] = [];
    pendingTasks: MyTask<I, O>[] = [];

    constructor(workerCnt: number, private funcPath: string, process: (...i: I) => O) {
        this.workers = Arrays.range(0, workerCnt).map(i => {
            const worker = {
                worker: new Worker(path.join(__dirname, './distributed-worker.ts')),
                status: 'idle' as const,
            };
            worker.worker.on('message', (ev) => {
                this.pong(worker, ev);
            });
            return worker;
        });

    }

    process(...input: I): Promise<O> {
        return new Promise<O>(resolve => {
            this.pendingTasks.push({
                input,
                resolve,
            });
            this.ping();
        });
    }

    ping() {
        if(this.pendingTasks.length === 0 || this.workers.every(w => w.status !== 'idle')) {
            return;
        }
        const nextTask = this.pendingTasks.shift()!;
        const worker = this.workers.find(w => w.status === 'idle')!;
        worker.status = 'working';
        worker.currentTask = nextTask;
        worker.worker.postMessage({
            func: this.funcPath,
            input: nextTask.input,
        });
    }

    pong(worker: MyWorker<I, O>, data: any) {
        worker.status = 'idle';
        worker.currentTask?.resolve(data as O);
        worker.currentTask = undefined;
        this.ping();
    }
}