import { Worker } from 'worker_threads';
import fs from 'fs';
import os from 'os';

const files = fs.readdirSync('./input/minion');
const total = files.length;

console.log(files);

const MAX_WORKERS = os.cpus().length;
const queue = [...files];

let activeWorkers = 0;
let done = 0;

console.log('Total Files', total);
console.log('Max parallel workers', MAX_WORKERS);

const startNextJob = () => {
  if (queue.length == 0) {
    return;
  }

  if (activeWorkers > MAX_WORKERS) {
    return;
  }

  const file = queue.shift();
  activeWorkers = activeWorkers + 1;

  const worker = new Worker('./src/minion.js', { workerData: file });

  worker.on('message', () => {
    activeWorkers = activeWorkers - 1;
    done = done + 1;

    console.log(`Done :  ${done}/${total}`);

    worker.terminate();
    startNextJob();
  });

  worker.on('error', (error) => {
    console.log('error in worker', error);
  });
};

for (let i = 0; i < MAX_WORKERS; i++) {
  startNextJob();
}
