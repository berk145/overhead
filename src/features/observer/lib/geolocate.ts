import type { Observer } from '../store'
export function geolocate(): Promise<Observer> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not available in this browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          lat: Math.round(p.coords.latitude * 100) / 100,
          lon: Math.round(p.coords.longitude * 100) / 100,
          altM: Math.max(0, Math.round(p.coords.altitude ?? 0)),
          label: 'My location',
        }),
      (err) =>
        reject(
          new Error(
            err.code === err.PERMISSION_DENIED
              ? 'Location permission denied'
              : 'Could not get your location',
          ),
        ),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  })
}
