import { wmoToCondition } from '@/utils/wmo'
import type { WeatherCondition } from '@/types/weather'

/**
 * WeatherAPI.com condition code → equivalent WMO code.
 * Mapping keeps the rest of the app (icons, labels, derived warnings)
 * provider-agnostic: normalized bundles always carry WMO codes.
 * Reference: https://www.weatherapi.com/docs/weather_conditions.json
 */
export function weatherApiToWmo(code: number): number {
  switch (code) {
    case 1000:
      return 0 // Sunny / Clear
    case 1003:
      return 2 // Partly cloudy
    case 1006:
    case 1009:
      return 3 // Cloudy / Overcast
    case 1012: // Haze
    case 1015: // Dust haze
    case 1018: // Blowing dust
    case 1021: // Dust storm
    case 1024: // Sandstorm
    case 1027: // Severe sandstorm
    case 1030: // Mist
    case 1033: // Smoke
    case 1036: // Smoky haze
    case 1039: // Smog
    case 1042: // Severe smog
    case 1045: // Saharan dust
    case 1048: // Dust
    case 1135: // Fog
    case 1147: // Freezing fog
      return 45
    case 1069: // Patchy sleet possible
    case 1072: // Patchy freezing drizzle possible
    case 1150: // Patchy light drizzle
    case 1153: // Light drizzle
    case 1168: // Freezing drizzle
    case 1171: // Heavy freezing drizzle
      return 51
    case 1063: // Patchy rain possible
    case 1180: // Patchy light rain
    case 1183: // Light rain
    case 1186: // Moderate rain at times
    case 1189: // Moderate rain
    case 1192: // Heavy rain at times
    case 1195: // Heavy rain
    case 1198: // Light freezing rain
    case 1201: // Moderate/heavy freezing rain
    case 1204: // Light sleet
    case 1207: // Moderate/heavy sleet
    case 1240: // Light rain shower
    case 1243: // Moderate/heavy rain shower
    case 1246: // Torrential rain shower
      return 61
    case 1066: // Patchy snow possible
    case 1114: // Blowing snow
    case 1117: // Blizzard
    case 1210: // Patchy light snow
    case 1213: // Light snow
    case 1216: // Patchy moderate snow
    case 1219: // Moderate snow
    case 1222: // Patchy heavy snow
    case 1225: // Heavy snow
    case 1237: // Ice pellets
    case 1249: // Light sleet showers
    case 1252: // Moderate/heavy sleet showers
    case 1255: // Light snow showers
    case 1258: // Moderate/heavy snow showers
    case 1261: // Light showers of ice pellets
    case 1264: // Moderate/heavy showers of ice pellets
      return 71
    case 1087: // Thundery outbreaks possible
    case 1273: // Patchy light rain with thunder
    case 1276: // Moderate/heavy rain with thunder
    case 1279: // Patchy light snow with thunder
    case 1282: // Moderate/heavy snow with thunder
      return 95
    default:
      return 0
  }
}

/** WeatherAPI code → shared condition (via WMO mapping). */
export function weatherApiToCondition(code: number): WeatherCondition {
  return wmoToCondition(weatherApiToWmo(code))
}
