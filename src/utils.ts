import https from 'https';
import { URL } from 'url';

export type WeatherResult = {
  provider: 'open-meteo';
  latitude: number;
  longitude: number;
  temperature_2m?: number;
  wind_speed_10m?: number;
  fetchedAt: string;
};

export type NewsItem = {
  id: number;
  title: string;
  body: string;
};

export type NewsResult = {
  provider: 'dummyjson';
  count: number;
  items: NewsItem[];
  fetchedAt: string;
};

class AppError extends Error {
  code?: string | number | undefined;
  cause?: unknown;
  constructor(message: string, code?: string | number, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

export { AppError };

export type Coords = { lat: number; lon: number };

export function getDefaultCoords(): Coords {
  // Default to jozi
  return { lat: -26.2041, lon: 28.0473 };
}

export function parseCoordsFromEnv(): Coords {
  const lat = process.env.LAT;
  const lon = process.env.LON;
  if (!lat || !lon) return getDefaultCoords();
  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (Number.isNaN(latNum) || Number.isNaN(lonNum)) return getDefaultCoords();
  return { lat: latNum, lon: lonNum };
}

// --------- HTTPS helpers (Callback, Promise) ----------

export type HttpCallback = (err: Error | null, data?: any) => void;

export function getJSONCallback(urlString: string, cb: HttpCallback) {
  try {
    const url = new URL(urlString);
    const req = https.get(url, (res) => {
      const { statusCode } = res;
      if (!statusCode || statusCode < 200 || statusCode >= 300) {
        cb(new AppError(`HTTP ${statusCode} for ${urlString}`, statusCode));
        res.resume();
        return;
      }
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          cb(null, json);
        } catch (e) {
          cb(new AppError('Failed to parse JSON response', 'EJSON', e));
        }
      });
    });
    req.on('error', (e) => cb(new AppError('Network error', 'ENET', e)));
    req.setTimeout(15000, () => {
      req.destroy(new AppError('Request timed out', 'ETIMEDOUT'));
    });
  } catch (e) {
    cb(new AppError('Bad URL', 'EBADURL', e));
  }
}

export function getJSONPromise<T = any>(urlString: string): Promise<T> {
  return new Promise((resolve, reject) => {
    getJSONCallback(urlString, (err, data) => {
      if (err) reject(err);
      else resolve(data as T);
    });
  });
}

// --------- Domain-specific helpers ----------

export function buildWeatherUrl(coords: Coords): string {
  const params = new URLSearchParams({
    latitude: String(coords.lat),
    longitude: String(coords.lon),
    current: 'temperature_2m,wind_speed_10m'
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

export function buildNewsUrl(limit = 5): string {
  const params = new URLSearchParams({ limit: String(limit) });
  return `https://dummyjson.com/posts?${params.toString()}`;
}

export function normalizeWeather(coords: Coords, raw: any): WeatherResult {
  const w = raw?.current ?? {};
  return {
    provider: 'open-meteo',
    latitude: coords.lat,
    longitude: coords.lon,
    temperature_2m: typeof w.temperature_2m === 'number' ? w.temperature_2m : undefined,
    wind_speed_10m: typeof w.wind_speed_10m === 'number' ? w.wind_speed_10m : undefined,
    fetchedAt: new Date().toISOString(),
  };
  }

export function normalizeNews(raw: any): NewsResult {
  const items = Array.isArray(raw?.posts) ? raw.posts.slice(0, 5) : [];
  return {
    provider: 'dummyjson',
    count: items.length,
    items: items.map((p: any) => ({
      id: Number(p.id) || 0,
      title: String(p.title || ''),
      body: String(p.body || ''),
    })),
    fetchedAt: new Date().toISOString(),
  };
}

export function displayResults(weather: WeatherResult, news: NewsResult) {
  console.log('=== Weather ===');
  console.log(`Lat/Lon: ${weather.latitude}, ${weather.longitude}`);
  console.log(`Temperature (°C): ${weather.temperature_2m ?? 'N/A'}`);
  console.log(`Wind Speed (m/s): ${weather.wind_speed_10m ?? 'N/A'}`);
  console.log('\n=== News (DummyJSON) ===');
  console.log(`Items: ${news.count}`);
  for (const item of news.items) {
    console.log(`- [${item.id}] ${item.title}`);
  }
}

export function displayError(e: unknown) {
  if (e instanceof AppError) {
    console.error(`[Error] ${e.message}${e.code ? ' (code: ' + e.code + ')' : ''}`);
    if (e.cause) console.error('Cause:', e.cause);
  } else if (e instanceof Error) {
    console.error('[Error]', e.message);
  } else {
    console.error('[Error]', e);
  }
}
