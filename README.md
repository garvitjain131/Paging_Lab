# Paging Lab

A small OS project using only HTML, CSS and JavaScript. No installation, dependencies, backend, API keys or build step.

## Run locally

Open `index.html` in a browser. Alternatively, serve this directory with any static web server.

## Features

- FIFO and LRU replacement with configurable RAM frames.
- Step forward, step back, autoplay, reset and jump to a request.
- Memory contents, hit/fault status and evicted pages at each step.
- Full-sequence comparison of faults, hits and hit rates.
- Working-set tracker using the last k references, with a memory-pressure indicator.
- Input validation and responsive layout.

## Deploy on Vercel

1. Upload this folder to a GitHub repository.
2. In Vercel, add a new project and import that repository.
3. Choose **Other** as the framework preset. No build command is required. The output directory is `.` (the project root). If the repository contains several projects, set Root Directory to `OS`.
4. Click Deploy. `vercel.json` includes the static-site settings.

Alternatively, with the Vercel CLI installed, run `vercel` from this folder and follow its prompts.

Official reference: https://vercel.com/docs/builds/configure-a-build

## Explain the implementation

`algorithms.js` stores pages in a fixed-size array of frames. FIFO selects the frame with the earliest load time; LRU selects the frame with the oldest last-access time. Hits update LRU access times but do not update FIFO load times. Each request saves a snapshot for the playback controls. `app.js` renders those snapshots. `style.css` controls the design.

The working set contains distinct page IDs in the most recent k requests. This is a simplified reference-window version of Denning's process-time model. It measures demand, rather than acting as a third replacement policy. A set larger than RAM indicates pressure, not proof of thrashing. Scheduling, multiple processes and I/O latency are outside this demo.

Source: P. J. Denning, "The Working Set Model for Program Behavior," Communications of the ACM 11(5), 323–333, 1968. https://doi.org/10.1145/363095.363141

Full paper: https://denninginstitute.com/pjd/PUBS/WSModel_1968.pdf

## Verify algorithms

With Node.js available, run `node --test tests.cjs`.
