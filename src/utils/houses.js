export const calculateHouses = (ascendant) => {
  const houses = [];
  for (let i = 0; i < 12; i++) {
    houses.push((ascendant + i * 30) % 360);
  }
  return houses;
};

export const calculateHousesWithSystem = async (ascendant, houseSystem = 'equal', latitude = 0, longitude = 0, date = new Date()) => {
  // Quick support: 'equal' and 'whole-sign' implemented locally.
  if (houseSystem === 'equal') return calculateHouses(ascendant);
  if (houseSystem === 'whole-sign') {
    const ascSign = Math.floor(ascendant / 30);
    return Array.from({ length: 12 }, (_, i) => ((ascSign + i) % 12) * 30);
  }

  // Attempt to use Swiss Ephemeris WASM (`sweph-wasm`) for accurate house calculations
  try {
    // Use dynamic import at runtime without static analysis so bundlers won't try to resolve optional WASM packages.
    const swe = await new Function('return import("sweph-wasm")')().catch(() => null);
    if (swe) {
      try {
        if (typeof swe.init === 'function') await swe.init();
      } catch (e) {}

      if (typeof swe.swe_houses === 'function') {
        try {
          const jd = date.getTime() / 86400000 + 2440587.5; // approximate JD
          const res = swe.swe_houses(jd, latitude, longitude, 0);
          if (Array.isArray(res) && res.length >= 12) return res.map(c => (c % 360 + 360) % 360);
        } catch (e) {}
      }

      if (typeof swe.getHouses === 'function') {
        try {
          const jd = date.getTime() / 86400000 + 2440587.5;
          const res = await swe.getHouses(jd, latitude, longitude, houseSystem);
          if (Array.isArray(res) && res.length >= 12) return res.map(c => (c % 360 + 360) % 360);
        } catch (e) {}
      }
    }
  } catch (e) {
    // ignore and continue to next option
  }

  // Attempt to use `astronomia` if available for Placidus/Koch
  try {
    const mod = await new Function('return import("astronomia")')().catch(() => null);
    if (mod && mod.house && typeof mod.house.placidus === 'function') {
      try {
        const jd = date.getTime() / 86400000 + 2440587.5; // Julian day approximation
        const cusps = mod.house.placidus(jd, latitude, longitude);
        if (Array.isArray(cusps) && cusps.length >= 12) return cusps.map(c => (c % 360 + 360) % 360);
      } catch (e) {}
    }
  } catch (e) {
    // ignore and fallback
  }

  // Fallback: equal houses
  return calculateHouses(ascendant);
};