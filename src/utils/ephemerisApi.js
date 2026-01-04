// Ephemeris API client — POSTs birth data to a hosted ephemeris service and returns natal data.
export async function fetchNatalChartFromApi(apiUrl, apiKey, { birthDate, birthTime, latitude, longitude, houseSystem }) {
  if (!apiUrl) throw new Error('No API URL provided');
  const body = { birthDate, birthTime, latitude, longitude, houseSystem };
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ephemeris API error: ${res.status} ${text}`);
  }
  const json = await res.json();

  // Normalize common shapes: accept { positions: {planet: {longitude,...}}, ascendant, houses }
  if (json && json.positions && json.ascendant) return json;

  // If API returns a flat structure, attempt to coerce
  if (json && json.data && json.data.positions) return json.data;

  throw new Error('Unexpected ephemeris API response shape');
}
