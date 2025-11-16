import { Worker } from 'worker_threads';
import fs from 'fs';

const files = fs.readdirSync('./input/minion');

let done = 0;
const total = files.length;
console.log('Processing Files: ', files);

for (const file of files) {
  const worker = new Worker('./src/minion.js', { workerData: file });

  worker.on('message', () => {
    done = done + 1;
    console.log(`Done : ${done}/${total}`);
    worker.terminate();
  });
}
