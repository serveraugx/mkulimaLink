/**
 * Weather Intelligence — live forecast from Open-Meteo (no API key required).
 * https://open-meteo.com/en/docs
 */

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
}

export interface WeatherSnapshot {
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    cloudCover: number;
  };
  daily: DailyForecast[];
  warnings: string[];
}

export async function getWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toFixed(4));
  url.searchParams.set('longitude', lon.toFixed(4));
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,cloud_cover'
  );
  url.searchParams.set(
    'daily',
    'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max'
  );
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url, { next: { revalidate: 60 * 30 } });
  if (!res.ok) throw new Error(`Open-Meteo forecast failed: ${res.status}`);
  const data = await res.json();

  const daily: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
    date,
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    precipitationSum: data.daily.precipitation_sum[i],
    precipitationProbability: data.daily.precipitation_probability_max[i],
    windSpeedMax: data.daily.wind_speed_10m_max[i],
  }));

  const warnings: string[] = [];
  const next48h = daily.slice(0, 2).reduce((sum, d) => sum + d.precipitationSum, 0);
  if (next48h >= 25) {
    warnings.push('Heavy rainfall expected within the next 48 hours.');
  }
  const heatDays = daily.filter((d) => d.tempMax >= 35).length;
  if (heatDays >= 2) {
    warnings.push('Extreme heat expected — monitor crops for heat stress.');
  }
  const windy = daily.some((d) => d.windSpeedMax >= 40);
  if (windy) {
    warnings.push('Strong winds forecast — secure structures and check for lodging risk.');
  }

  return {
    current: {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      windSpeed: data.current.wind_speed_10m,
      cloudCover: data.current.cloud_cover,
    },
    daily,
    warnings,
  };
}
