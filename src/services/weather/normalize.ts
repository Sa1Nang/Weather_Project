import type { OpenMeteoForecast } from '@/lib/schemas'
import type {
  CurrentWeather,
  DayPoint,
  HourPoint,
  WeatherBundle,
} from '@/types/weather'
import { wmoToCondition } from '@/utils/wmo'

function at<T>(
  arr: readonly T[] | null | undefined,
  i: number,
): Exclude<T, undefined> | null {
  if (!arr || i < 0 || i >= arr.length) return null
  const value = arr[i] as Exclude<T, undefined> | undefined
  return value === undefined ? null : value
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : fallback
}

/** Index of the hourly entry closest to `current.time`. */
function nearestHourIndex(hourlyTime: readonly string[], currentTime: string): number {
  let best = 0
  let bestDiff = Number.POSITIVE_INFINITY
  const target = Date.parse(currentTime)
  for (let i = 0; i < hourlyTime.length; i += 1) {
    const t = hourlyTime[i]
    if (t === undefined) continue
    const diff = Math.abs(Date.parse(t) - target)
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  }
  return best
}

/**
 * Normalizes a validated Open-Meteo payload into provider-agnostic app models.
 * Pure function — no network, no side effects, fully unit-testable.
 */
export function normalizeForecast(payload: OpenMeteoForecast): WeatherBundle {
  const { current, hourly, daily } = payload
  const nowIdx = nearestHourIndex(hourly.time, current.time)

  const normalizedCurrent: CurrentWeather = {
    observedAt: current.time,
    temperatureC: current.temperature_2m,
    feelsLikeC: current.apparent_temperature,
    humidityPct: current.relative_humidity_2m,
    rainProbabilityPct: at(hourly.precipitation_probability, nowIdx),
    precipitationMm: current.precipitation,
    weatherCode: current.weather_code,
    condition: wmoToCondition(current.weather_code),
    isDay: current.is_day === 1,
    cloudCoverPct: current.cloud_cover ?? null,
    pressureHpa: current.pressure_msl ?? current.surface_pressure ?? null,
    windSpeedKmh: current.wind_speed_10m,
    windDirectionDeg: current.wind_direction_10m,
    windGustsKmh: current.wind_gusts_10m ?? null,
    uvIndex: at(hourly.uv_index, nowIdx),
    visibilityM: at(hourly.visibility, nowIdx),
  }

  const normalizedHourly: HourPoint[] = hourly.time.map((time, i) => {
    const code = num(at(hourly.weather_code, i), 0)
    return {
      time,
      temperatureC: num(at(hourly.temperature_2m, i), 0),
      feelsLikeC: at(hourly.apparent_temperature, i),
      rainProbabilityPct: at(hourly.precipitation_probability, i),
      precipitationMm: num(at(hourly.precipitation, i), 0),
      weatherCode: code,
      condition: wmoToCondition(code),
      isDay: at(hourly.is_day, i) === 1,
      humidityPct: at(hourly.relative_humidity_2m, i),
      windSpeedKmh: num(at(hourly.wind_speed_10m, i), 0),
      uvIndex: at(hourly.uv_index, i),
    }
  })

  const normalizedDaily: DayPoint[] = daily.time.map((date, i) => {
    const code = num(at(daily.weather_code, i), 0)
    return {
      date,
      weatherCode: code,
      condition: wmoToCondition(code),
      tempMaxC: num(at(daily.temperature_2m_max, i), 0),
      tempMinC: num(at(daily.temperature_2m_min, i), 0),
      rainProbabilityMaxPct: at(daily.precipitation_probability_max, i),
      precipitationSumMm: num(at(daily.precipitation_sum, i), 0),
      sunrise: at(daily.sunrise, i),
      sunset: at(daily.sunset, i),
      uvIndexMax: at(daily.uv_index_max, i),
      windSpeedMaxKmh: at(daily.wind_speed_10m_max, i),
      windGustsMaxKmh: at(daily.wind_gusts_10m_max, i),
      windDirectionDominantDeg: at(daily.wind_direction_10m_dominant, i),
    }
  })

  return {
    latitude: payload.latitude,
    longitude: payload.longitude,
    timezone: payload.timezone,
    updatedAt: new Date().toISOString(),
    current: normalizedCurrent,
    hourly: normalizedHourly,
    daily: normalizedDaily,
  }
}
