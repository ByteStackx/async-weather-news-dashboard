# Async Weather & News Dashboard

## Overview

This project demonstrates asynchronous programming and the event loop in Node.js/TypeScript by fetching weather data and news headlines from public APIs using three different async styles:

- **Callbacks**
- **Promises**
- **Async/Await**

It showcases how to handle sequential, parallel, and racing requests, and how to normalize API responses for consistent downstream use.

## Usage

### Running Each Version

From the project root, run:

#### Callback Version

```bash
npm run callback
```

#### Promise Version

```bash
npm run promise
```

#### Async/Await Version

```bash
npm run async
```

### Environment Variables

You can override the default location by setting `LAT` and `LON` environment variables:

```bash
# Example for Johannesburg
set LAT=-26.2041
set LON=28.0473
npx ts-node src/asyncAwaitVersion.ts
```

## Learning Outcomes

- **Understand the event loop and async flow in Node.js**
- **Compare callback, promise, and async/await styles**
- **Handle parallel and racing requests with `Promise.all` and `Promise.race`**
- **Normalize and validate API responses for robust code**
- **Gracefully handle errors and edge cases**
- **Structure TypeScript code for maintainability and reuse**

## APIs Used

- **Weather:** [Open-Meteo](https://open-meteo.com/)
- **News:** [DummyJSON Posts](https://dummyjson.com/docs/posts)