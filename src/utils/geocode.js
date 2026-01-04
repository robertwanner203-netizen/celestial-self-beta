// Simple geocoding utility using Nominatim (OpenStreetMap).
// Caches results in localStorage under `geocode:<query>`.

export async function geocodeCity(query) {
  if (!query) return null;
  const key = `geocode:${query}`;
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    // ignore localStorage errors
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'CelestialSelf/1.0 (contact@yourdomain.example)' } });
    if (!res.ok) return null;
    const json = await res.json();
    if (Array.isArray(json) && json.length > 0) {
      const { lat, lon } = json[0];
      const result = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      try { localStorage.setItem(key, JSON.stringify(result)); } catch (e) {}
      return result;
    }
  } catch (e) {
    return null;
  }
  return null;
}

// Note: Nominatim requires a valid User-Agent and should be used respectfully.
// For production/high-volume use, configure a paid geocoding provider (OpenCage, Google).
