/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEATHERAPI_BASE_URL?: string
  readonly VITE_WEATHERAPI_KEY?: string
  readonly VITE_OPEN_METEO_BASE_URL?: string
  readonly VITE_GEOCODING_BASE_URL?: string
  readonly VITE_REVERSE_GEOCODE_URL?: string
  readonly VITE_LOCATIONIQ_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
