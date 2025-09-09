import { getJSONPromise, buildWeatherUrl, buildNewsUrl, normalizeWeather, normalizeNews, displayResults, displayError, parseCoordsFromEnv, AppError } from './utils';

const coords = parseCoordsFromEnv();

function chainPromises() {
  const weatherUrl = buildWeatherUrl(coords);
  return getJSONPromise(weatherUrl)
    .then((weatherRaw) => {
      const weather = normalizeWeather(coords, weatherRaw);
      return getJSONPromise(buildNewsUrl(5)).then((newsRaw) => {
        const news = normalizeNews(newsRaw);
        displayResults(weather, news);
      });
    })
    .catch(displayError);
}

function runAll() {
  return Promise.all([
    getJSONPromise(buildWeatherUrl(coords)),
    getJSONPromise(buildNewsUrl(5)),
  ]).then(([weatherRaw, newsRaw]) => {
    const weather = normalizeWeather(coords, weatherRaw);
    const news = normalizeNews(newsRaw);
    displayResults(weather, news);
  }).catch(displayError);
}

function runRace() {
  return Promise.race([
    getJSONPromise(buildWeatherUrl(coords)).then(() => 'weather'),
    getJSONPromise(buildNewsUrl(5)).then(() => 'news'),
  ]).then((winner) => {
    console.log('Race winner (promises):', winner);
  }).catch((e) => {
    // If the first settled is a rejection, handle it consistently
    displayError(new AppError('Race failed first', 'ERACE', e));
  });
}

console.log('--- Promise Version ---');
(async () => {
  await chainPromises();
  await runAll();
  await runRace();
})();
