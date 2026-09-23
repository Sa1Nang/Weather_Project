import { z } from 'zod'

/**
 * Boundary validation for every external API response.
 * Services `safeParse` here; malformed payloads become `ApiError('parse')`
 * instead of runtime crashes downstream.
 */

const num = z.coerce.number()

/* ---------------- Open-Meteo Forecast ---------------- */

const currentBlock = z.object({
  time: z.string(),
  temperature_2m: num,
  relative_humidity_2m: num,
  apparent_temperature: num,
  is_day: z.union([z.literal(0), z.literal(1)]),
  precipitation: num,
  weather_code: num,
  cloud_cover: num.nullish(),
  pressure_msl: num.nullish(),
  surface_pressure: num.nullish(),
  wind_speed_10m: num,
  wind_direction_10m: num,
  wind_gusts_10m: num.nullish(),
})

const hourlyBlock = z.object({
  time: z.array(z.string()),
  temperature_2m: z.array(num),
  apparent_temperature: z.array(num).nullish(),
  precipitation_probability: z.array(num.nullish()).nullish(),
  precipitation: z.array(num),
  weather_code: z.array(num),
  relative_humidity_2m: z.array(num).nullish(),
  wind_speed_10m: z.array(num),
  uv_index: z.array(num.nullish()).nullish(),
  visibility: z.array(num.nullish()).nullish(),
  is_day: z.array(z.union([z.literal(0), z.literal(1)])),
})

const dailyBlock = z.object({
  time: z.array(z.string()),
  weather_code: z.array(num),
  temperature_2m_max: z.array(num),
  temperature_2m_min: z.array(num),
  sunrise: z.array(z.string()).nullish(),
  sunset: z.array(z.string()).nullish(),
  uv_index_max: z.array(num.nullish()).nullish(),
  precipitation_sum: z.array(num),
  precipitation_probability_max: z.array(num.nullish()).nullish(),
  wind_speed_10m_max: z.array(num.nullish()).nullish(),
  wind_gusts_10m_max: z.array(num.nullish()).nullish(),
  wind_direction_10m_dominant: z.array(num.nullish()).nullish(),
})

export const openMeteoForecastSchema = z.object({
  latitude: num,
  longitude: num,
  timezone: z.string(),
  current: currentBlock,
  hourly: hourlyBlock,
  daily: dailyBlock,
})

export type OpenMeteoForecast = z.infer<typeof openMeteoForecastSchema>

/* ---------------- WeatherAPI.com Forecast ---------------- */
// forecast.json: location + current + forecast.forecastday[].day/astro/hour

const weatherApiCondition = z.object({
  text: z.string().nullish(),
  code: num,
})

const weatherApiLocation = z.object({
  lat: num,
  lon: num,
  tz_id: z.string(),
  localtime: z.string().nullish(),
})

const weatherApiCurrent = z.object({
  last_updated: z.string(),
  temp_c: num,
  feelslike_c: num,
  humidity: num,
  cloud: num.nullish(),
  pressure_mb: num.nullish(),
  precip_mm: num.nullish(),
  uv: num.nullish(),
  vis_km: num.nullish(),
  is_day: z.union([z.literal(0), z.literal(1)]),
  wind_kph: num,
  wind_degree: num.nullish(),
  gust_kph: num.nullish(),
  condition: weatherApiCondition,
})

const weatherApiHour = z.object({
  time: z.string(),
  temp_c: num,
  feelslike_c: num.nullish(),
  chance_of_rain: num.nullish(),
  precip_mm: num.nullish(),
  humidity: num.nullish(),
  wind_kph: num,
  wind_degree: num.nullish(),
  gust_kph: num.nullish(),
  uv: num.nullish(),
  vis_km: num.nullish(),
  is_day: z.union([z.literal(0), z.literal(1)]),
  cloud: num.nullish(),
  pressure_mb: num.nullish(),
  condition: weatherApiCondition,
})

const weatherApiDay = z.object({
  maxtemp_c: num,
  mintemp_c: num,
  maxwind_kph: num.nullish(),
  totalprecip_mm: num.nullish(),
  daily_chance_of_rain: num.nullish(),
  uv: num.nullish(),
  condition: weatherApiCondition,
})

const weatherApiAstro = z.object({
  sunrise: z.string().nullish(),
  sunset: z.string().nullish(),
})

const weatherApiForecastDay = z.object({
  date: z.string(),
  day: weatherApiDay,
  astro: weatherApiAstro.nullish(),
  hour: z.array(weatherApiHour).nullish(),
})

export const weatherApiForecastSchema = z.object({
  location: weatherApiLocation,
  current: weatherApiCurrent,
  forecast: z.object({
    forecastday: z.array(weatherApiForecastDay).min(1),
  }),
})

export type WeatherApiForecast = z.infer<typeof weatherApiForecastSchema>

/* ---------------- LocationIQ geocoding (forward + reverse) ---------------- */
// lat/lon arrive as strings ("14.5995") — coerce to numbers.

const locationIqAddress = z
  .object({
    city: z.string().nullish(),
    town: z.string().nullish(),
    village: z.string().nullish(),
    hamlet: z.string().nullish(),
    suburb: z.string().nullish(),
    county: z.string().nullish(),
    state: z.string().nullish(),
    country: z.string().nullish(),
  })
  .nullish()

const locationIqHit = z.object({
  place_id: z.union([z.number(), z.string()]),
  lat: num,
  lon: num,
  display_name: z.string(),
  address: locationIqAddress,
})

export const openMeteoGeocodingSchema = z.array(locationIqHit)

export type OpenMeteoGeocoding = z.infer<typeof openMeteoGeocodingSchema>

/* ---------------- LocationIQ reverse geocode ---------------- */

export const reverseGeocodeSchema = z.object({
  place_id: z.union([z.number(), z.string()]).nullish(),
  lat: num.nullish(),
  lon: num.nullish(),
  display_name: z.string().nullish(),
  address: locationIqAddress,
})

export type ReverseGeocode = z.infer<typeof reverseGeocodeSchema>
