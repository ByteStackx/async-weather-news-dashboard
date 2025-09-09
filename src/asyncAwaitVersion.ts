import { getJSONPromise, buildWeatherUrl, buildNewsUrl, normalizeWeather, normalizeNews, displayResults, displayError, parseCoordsFromEnv } from './utils';

const coords = parseCoordsFromEnv();

async function fetchSequential() {
  try {
    const weatherRaw = await getJSONPromise(buildWeatherUrl(coords));
    const newsRaw = await getJSONPromise(buildNewsUrl(5));
    const weather = normalizeWeather(coords, weatherRaw);
    const news = normalizeNews(newsRaw);
    displayResults(weather, news);
  } catch (e) {
    displayError(e);
  }
}

async function fetchParallelAll() {
  try {
    const [weatherRaw, newsRaw] = await Promise.all([
      getJSONPromise(buildWeatherUrl(coords)),
      getJSONPromise(buildNewsUrl(5)),
    ]);
    const weather = normalizeWeather(coords, weatherRaw);
    const news = normalizeNews(newsRaw);
    displayResults(weather, news);
  } catch (e) {
    displayError(e);
  }
}

async function raceFastest() {
  try {
    const winner = await Promise.race([
      getJSONPromise(buildWeatherUrl(coords)).then(() => 'weather'),
      getJSONPromise(buildNewsUrl(5)).then(() => 'news'),
    ]);
    console.log('Race winner (async/await):', winner);
  } catch (e) {
    displayError(e);
  }
}

console.log('--- Async/Await Version ---');
(async () => {
  await fetchSequential();
  await fetchParallelAll();
  await raceFastest();
})();
