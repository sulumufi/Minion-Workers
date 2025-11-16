# Gru's Thumbnail Factory: Understanding Worker Threads

> _"MINIONS! We have work to do!"_ - Gru, probably

Welcome to the most **despicably efficient** way to learn Node.js Worker Threads! This project uses everyone's favorite supervillain and his yellow helpers to demonstrate parallel processing in Node.js.

---

## The Story

Imagine **Gru** has 52 large photos of his minions that need to be shrunk down to thumbnail size (200x200 pixels) for his secret lair's photo wall.

### The Problem

If Gru does all the work himself (single-threaded):

- He processes one photo at a time
- Each photo takes time to resize
- 52 photos = A VERY long coffee break

### The Solution

**Gru delegates to his Minions!** (Worker Threads)

- Each minion can work on a photo independently
- Multiple minions work simultaneously (parallel processing)
- The job gets done MUCH faster!

---

## Project Structure

```
WorkerThreads/
├── src/
│   ├── gruWithFixedMinions.js    - Gru with a smart team (Thread Pool)
│   ├── gruWithInfiniteMinions.js - Gru with chaos mode (Unlimited Threads)
│   └── minion.js                 - The Minion (Worker Thread)
├── input/
│   └── minion/                   - 52 original minion photos
├── output/                       - Generated thumbnails appear here
└── package.json                  - Project configuration
```

---

## The Characters

### **Gru** (Main Thread)

**File:** `gruWithFixedMinions.js` or `gruWithInfiniteMinions.js`

**Role:** The mastermind who:

- Makes a list of all photos that need resizing
- Hires minions (creates worker threads)
- Assigns tasks to available minions
- Tracks completed work
- Dismisses minions when their job is done

### **Minion** (Worker Thread)

**File:** `minion.js`

**Role:** The hardworking helper who:

- Receives a photo filename from Gru
- Resizes the photo to 200x200 pixels using Jimp
- Saves the thumbnail with a "thumb-" prefix
- Reports back to Gru: "Job done, boss!"
- Leaves when finished

---

## Two Approaches: From Simple to Smart

### Approach 1: **Infinite Minions** (Start Here!)

**File:** `gruWithInfiniteMinions.js`

This is the straightforward approach - perfect for learning the basics!

```javascript
// Gru sends ALL 52 minions to work AT ONCE
files.forEach((file) => {
  const worker = new Worker('./minion.js', { workerData: file });
});
```

**Characteristics:**

- All 52 threads created simultaneously
- Simple to understand and implement
- Great for learning Worker Threads basics
- Works well for small datasets

**Analogy:** Like releasing all minions into the lab at once. It works, but someone's going to knock over the Jello!

---

### Approach 2: **Fixed Minions** (Level Up!)

**File:** `gruWithFixedMinions.js`

After mastering the basics, implement this smarter, production-ready pattern!

```javascript
// Gru checks his computer's CPU count
const MAX_WORKERS = os.cpus().length; // e.g., 8 minions

// Gru maintains a job queue
// Only 8 minions work at once
// When a minion finishes, another takes their place
```

**Benefits:**

- Controlled chaos (only 8 minions at a time)
- Efficient resource usage
- Scalable to any number of photos
- Production-ready!

**Analogy:** Like a well-organized factory assembly line where each station is always busy, but you don't have 52 minions bumping into each other!

---

## How It Works: The Technical Breakdown

### 1. **Gru Creates a Job List**

```javascript
const files = await readdir('./input/minion');
// Result: ['photo1.jpg', 'photo2.jpg', ..., 'photo52.jpg']
```

### 2. **Gru Hires Minions (Creates Workers)**

```javascript
const worker = new Worker('./minion.js', {
  workerData: filename, // "Hey Bob, resize photo5.jpg!"
});
```

### 3. **Minion Does the Work**

```javascript
// Inside minion.js
const image = await Jimp.read(`./input/minion/${workerData}`);
await image.resize({ w: 200, h: 200 });
await image.write(`./output/thumb-${workerData}`);
parentPort.postMessage('done'); // "Boss, I finished!"
```

### 4. **Gru Receives Progress Updates**

```javascript
worker.on('message', () => {
  done++;
  console.log(`${done}/${total} thumbnails created!`);
  worker.terminate(); // "Thanks, Bob. You can go now."
});
```

### 5. **Repeat Until All Photos Done!**

---

## Running the Project

### Prerequisites

```bash
# Make sure you have Node.js installed (v14+)
node --version
```

### Installation

```bash
# Install dependencies (Jimp for image processing)
npm install
```

### Step 1: Start with Infinite Minions

Begin with the straightforward approach to understand the basics:

```bash
node src/gruWithInfiniteMinions.js
```

**What You'll See:**

```
Processing Files: [array of 52 filenames]
Done: 1/52
Done: 2/52
...
Done: 52/52
```

- All 52 workers start simultaneously
- Thumbnails complete in random order
- Simple and easy to understand!

### Step 2: Level Up to Fixed Minions

Once you understand the basics, try the smarter approach:

```bash
node src/gruWithFixedMinions.js
```

**What You'll See:**

```
Starting thumbnail generation with thread pool...
Total files: 52
Max workers: 8
8/52 thumbnails created!
16/52 thumbnails created!
24/52 thumbnails created!
...
52/52 thumbnails created!
All done! Check the ./output folder
```

- Controlled worker pool (8 at a time)
- More efficient resource usage
- Production-ready pattern!

---

## Performance Comparison

| Approach             | Threads Created | Memory Usage | Speed  | Best For            |
| -------------------- | --------------- | ------------ | ------ | ------------------- |
| **Single-threaded**  | 1               | Low          | Slow   | 1-5 files           |
| **Infinite Minions** | 52 (all files)  | High         | Fast\* | Learning the basics |
| **Fixed Minions**    | 8 (CPU count)   | Optimal      | Fast   | Production use      |

\*Fast but resource-intensive

---

## Key Concepts Explained

### What Are Worker Threads?

Worker threads let Node.js run JavaScript code in parallel, using multiple CPU cores. Think of them as separate minions, each with their own workspace.

### Why Use Worker Threads?

**Perfect for CPU-intensive tasks:**

- Image processing (like our thumbnails!)
- Complex calculations
- File compression
- Encryption/Decryption

**NOT needed for:**

- API calls (use async/await)
- File I/O (Node.js handles this efficiently)
- Simple operations

### The Main APIs Used

```javascript
// Creating a worker (hiring a minion)
const worker = new Worker('./worker.js', {
  workerData: 'data-for-minion',
});

// Listening for messages (getting updates)
worker.on('message', (msg) => console.log(msg));

// Sending messages from worker (reporting back)
parentPort.postMessage('I am done!');

// Cleaning up (dismissing the minion)
worker.terminate();
```

---

## The Thumbnail Process

**Input:** Large photos (up to 3840x2160 pixels, ~1.5MB)

```
input/minion/854307-2880x1800-desktop-hd-minions-background.jpg
```

**Processing:** Each worker:

1. Reads the image file
2. Resizes to 200x200 pixels
3. Maintains aspect ratio and quality
4. Saves with "thumb-" prefix

**Output:** Small thumbnails (200x200 pixels, ~10-20KB)

```
output/thumb-854307-2880x1800-desktop-hd-minions-background.jpg
```

---

## Real-World Applications

This same pattern is used for:

- **Video Processing:** Converting video formats
- **Audio Processing:** Transcoding music files
- **Data Processing:** Analyzing large datasets
- **Batch Operations:** Processing thousands of files
- **Scientific Computing:** Running simulations
- **Machine Learning:** Training models

---

## 📚 Code Deep Dive

### The Thread Pool Pattern (Smart Gru)

```javascript
async function startNextJob() {
  // Check if there's work and room for more workers
  if (fileQueue.length === 0 || activeWorkers >= MAX_WORKERS) {
    return; // Wait for a slot to open up
  }

  const file = fileQueue.shift(); // Get next job
  activeWorkers++; // Increment active workers

  const worker = new Worker('./minion.js', { workerData: file });

  worker.on('message', () => {
    done++;
    activeWorkers--; // Decrement when done
    worker.terminate();
    startNextJob(); // Process next file in queue
  });
}

// Kick off initial batch of workers
for (let i = 0; i < MAX_WORKERS; i++) {
  startNextJob();
}
```

**Why This Works:**

1. Maintains a queue of pending work
2. Never exceeds `MAX_WORKERS` limit
3. Automatically processes next job when a worker finishes
4. Self-balancing and efficient!

---

## What You've Learned

By exploring this project, you now understand:

1. **What Worker Threads Are:** Parallel execution in Node.js
2. **When to Use Them:** CPU-intensive tasks
3. **Thread Pool Pattern:** Efficient resource management
4. **Worker Communication:** `postMessage` and event listeners
5. **Real-World Application:** Image processing pipeline

---

## 🎬 Credits

**Inspired by:** Despicable Me & the hardworking Minions
**Built with:** Node.js, Worker Threads, Jimp
**Purpose:** Education & efficient thumbnail generation

---

## 📜 License

MIT - Feel free to use this project to learn about Worker Threads!

---

<div align="center">

### 🍌 "Banana!" 🍌

_- Every Minion, probably_

Made with 💛 for learning parallel processing

**Now go forth and parallelize responsibly!**

</div>
