import type { WeatherApiForecast } from '@/lib/schemas'
import type {
  CurrentWeather,
  DayPoint,
  HourPoint,
  WeatherBundle,
} from '@/types/weather'
import { wmoToCondition } from '@/utils/wmo'
import { weatherApiToWmo } from '@/utils/weatherApiCodes'

/** "2026-09-23 13:00" → "2026-09-23T13:00" for date-fns parseISO. */
function toIso(localTime: string): string {
  return localTime.includes('T') ? localTime : localTime.replace(' ', 'T')
}

/** "05:45 AM" + "2026-09-23" → "2026-09-23T05:45" (null when unparseable). */
function astroToIso(date: string, time: string | null | undefined): string | null {
  if (!time) return null
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i)
  if (!match) return null
  let hours = Number(match[1])
  const minutes = match[2]
  const meridiem = match[3]?.toUpperCase()
  if (!Number.isFinite(hours)) return null
  if (meridiem === 'PM' && hours < 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  return `${date}T${String(hours).padStart(2, '0')}:${minutes}`
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function nearestHourIndex(times: string[], target: string): number {
  let best = 0
  let bestDiff = Number.POSITIVE_INFINITY
  const targetMs = Date.parse(toIso(target))
  for (let i = 0; i < times.length; i += 1) {
    const t = times[i]
    if (t === undefined) continue
    const diff = Math.abs(Date.parse(toIso(t)) - targetMs)
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  }
  return best
}

/**
 * Normalizes a validated WeatherAPI.com payload into provider-agnostic
 * app models. WeatherAPI condition codes are mapped to WMO equivalents
 * so icons, labels, and derived warnings keep working unchanged.
 * Pure function — no network, no side effects.
 */
export function normalizeWeatherApi(payload: WeatherApiForecast): WeatherBundle {
  const { location, current, forecast } = payload

  const flatHours = forecast.forecastday.flatMap((d) => d.hour ?? [])

  const normalizedHourly: HourPoint[] = flatHours.map((h) => {
    const wmo = weatherApiToWmo(num(h.condition?.code, 0))
    return {
      time: toIso(h.time),
      temperatureC: num(h.temp_c, 0),
      feelsLikeC:
        typeof h.feelslike_c === 'number' && Number.isFinite(h.feelslike_c)
          ? h.feelslike_c
          : null,
      rainProbabilityPct:
        typeof h.chance_of_rain === 'number' && Number.isFinite(h.chance_of_rain)
          ? h.chance_of_rain
          : null,
      precipitationMm: num(h.precip_mm, 0),
      weatherCode: wmo,
      condition: wmoToCondition(wmo),
      isDay: h.is_day === 1,
      humidityPct:
        typeof h.humidity === 'number' && Number.isFinite(h.humidity)
          ? h.humidity
          : null,
      windSpeedKmh: num(h.wind_kph, 0),
      uvIndex:
        typeof h.uv === 'number' && Number.isFinite(h.uv) ? h.uv : null,
    }
  })

  const hourTimes = flatHours.map((h) => h.time)
  const nowIdx = hourTimes.length > 0 ? nearestHourIndex(hourTimes, current.last_updated) : 0
  const nowHour = flatHours[nowIdx] ?? null

  const observedAt = toIso(current.last_updated)
  const currentWmo = weatherApiToWmo(num(current.condition?.code, 0))

  const normalizedCurrent: CurrentWeather = {
    observedAt,
    temperatureC: num(current.temp_c, 0),
    feelsLikeC: num(current.feelslike_c, 0),
    humidityPct: num(current.humidity, 0),
    rainProbabilityPct:
      typeof nowHour?.chance_of_rain === 'number' &&
      Number.isFinite(nowHour.chance_of_rain)
        ? nowHour.chance_of_rain
        : null,
    precipitationMm: num(current.precip_mm, 0),
    weatherCode: currentWmo,
    condition: wmoToCondition(currentWmo),
    isDay: current.is_day === 1,
    cloudCoverPct:
      typeof current.cloud === 'number' && Number.isFinite(current.cloud)
        ? current.cloud
        : null,
    pressureHpa:
      typeof current.pressure_mb === 'number' && Number.isFinite(current.pressure_mb)
        ? current.pressure_mb
        : null,
    windSpeedKmh: num(current.wind_kph, 0),
    windDirectionDeg: num(current.wind_degree, 0),
    windGustsKmh:
      typeof current.gust_kph === 'number' && Number.isFinite(current.gust_kph)
        ? current.gust_kph
        : null,
    uvIndex:
      typeof current.uv === 'number' && Number.isFinite(current.uv)
        ? current.uv
        : (nowHour?.uv ?? null),
    visibilityM:
      typeof current.vis_km === 'number' && Number.isFinite(current.vis_km)
        ? Math.round(current.vis_km * 1000)
        : null,
  }

  const normalizedDaily: DayPoint[] = forecast.forecastday.map((d) => {
    const wmo = weatherApiToWmo(num(d.day?.condition?.code, 0))
    return {
      date: d.date,
      weatherCode: wmo,
      condition: wmoToCondition(wmo),
      tempMaxC: num(d.day?.maxtemp_c, 0),
      tempMinC: num(d.day?.mintemp_c, 0),
      rainProbabilityMaxPct:
        typeof d.day?.daily_chance_of_rain === 'number' &&
        Number.isFinite(d.day.daily_chance_of_rain)
          ? d.day.daily_chance_of_rain
          : null,
      precipitationSumMm: num(d.day?.totalprecip_mm, 0),
      sunrise: astroToIso(d.date, d.astro?.sunrise),
      sunset: astroToIso(d.date, d.astro?.sunset),
      uvIndexMax:
        typeof d.day?.uv === 'number' && Number.isFinite(d.day.uv) ? d.day.uv : null,
      windSpeedMaxKmh:
        typeof d.day?.maxwind_kph === 'number' && Number.isFinite(d.day.maxwind_kph)
          ? d.day.maxwind_kph
          : null,
      windGustsMaxKmh: null,
      windDirectionDominantDeg: null,
    }
  })

  return {
    latitude: num(location.lat, 0),
    longitude: num(location.lon, 0),
    timezone: location.tz_id,
    updatedAt: new Date().toISOString(),
    current: normalizedCurrent,
    hourly: normalizedHourly,
    daily: normalizedDaily,
  }
}
