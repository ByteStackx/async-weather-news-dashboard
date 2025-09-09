import { getJSONCallback, buildWeatherUrl, buildNewsUrl, normalizeWeather, normalizeNews, displayResults, displayError, parseCoordsFromEnv } from './utils';

const coords = parseCoordsFromEnv();

function fetchWeatherThenNews() {
  const weatherUrl = buildWeatherUrl(coords);
  getJSONCallback(weatherUrl, (err, weatherRaw) => {
    if (err) return displayError(err);
    const weather = normalizeWeather(coords, weatherRaw);

    const newsUrl = buildNewsUrl(5);
    getJSONCallback(newsUrl, (err2, newsRaw) => {
      if (err2) return displayError(err2);
      const news = normalizeNews(newsRaw);
      displayResults(weather, news);
    });
  });
}

function fetchBothParallelWithCallbacks() {
  let weather: any, news: any;
  let pending = 2;

  getJSONCallback(buildWeatherUrl(coords), (err, weatherRaw) => {
    if (err) return displayError(err);
    weather = normalizeWeather(coords, weatherRaw);
    if (--pending === 0) displayResults(weather, news);
  });

  getJSONCallback(buildNewsUrl(5), (err, newsRaw) => {
    if (err) return displayError(err);
    news = normalizeNews(newsRaw);
    if (--pending === 0) displayResults(weather, news);
  });
}

function raceWithCallbacks() {
  let done = false;
  const doneOnce = (label: string) => {
    if (done) return;
    done = true;
    console.log('Race winner (callbacks):', label);
  };

  getJSONCallback(buildWeatherUrl(coords), (err) => {
    if (err) return displayError(err);
    doneOnce('weather');
  });
  getJSONCallback(buildNewsUrl(5), (err) => {
    if (err) return displayError(err);
    doneOnce('news');
  });
}

console.log('--- Callback Version ---');
fetchWeatherThenNews();

// fetchBothParallelWithCallbacks();
// raceWithCallbacks();
