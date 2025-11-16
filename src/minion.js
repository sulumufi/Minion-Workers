import { Jimp } from 'jimp';
import { parentPort, workerData } from 'worker_threads';

const inputPath = `./input/minion/${workerData}`;
const outputPath = `./output/thumb-${workerData}`;

Jimp.read(inputPath)
  .then((img) => {
    return img.resize({ w: 200, h: 200 }).write(outputPath);
  })
  .then(() => {
    parentPort.postMessage('done');
  });
