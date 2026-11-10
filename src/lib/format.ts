export function formatNumber(n: number, digits = 0) { return new Intl.NumberFormat('en', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n) }
export function formatDistance(km: number) { return `${formatNumber(km, km < 1000 ? 1 : 0)} km` }
export function formatSpeed(kmS: number) { return `${formatNumber(kmS, 2)} km/s` }
export function formatDegrees(d: number, digits = 2) { return `${formatNumber(d, digits)}°` }
export function formatCoord(lat: number, lon: number) { return `${formatNumber(Math.abs(lat), 2)}°${lat < 0 ? 'S' : 'N'} ${formatNumber(Math.abs(lon), 2)}°${lon < 0 ? 'W' : 'E'}` }
export function formatRelativeTime(ms: number, now = Date.now()) { const minutes = Math.max(0, Math.floor((now - ms) / 60000)); if (minutes < 1) return 'just now'; if (minutes < 60) return `${minutes} min ago`; const hours = Math.floor(minutes / 60); return hours < 24 ? `${hours} h ago` : `${Math.floor(hours / 24)} d ago` }
export function formatTime(ms: number, options: { timeZone?: string; seconds?: boolean } = {}) { return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', ...(options.seconds ? { second: '2-digit' } : {}), timeZone: options.timeZone, hour12: false }).format(ms) }
export function formatDateShort(ms: number) { return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(ms).replace(',', '') }
export function formatUtcClock(ms: number) { return `${new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(ms).replace(',', '')} · ${formatTime(ms, { timeZone: 'UTC', seconds: true })} UTC` }
export function formatDuration(ms: number) { const minutes = Math.floor(ms / 60000); const hours = Math.floor(minutes / 60); return hours ? `${hours} h ${minutes % 60} min` : `${minutes} min` }
