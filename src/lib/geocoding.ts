/**
 * Geocoding using OpenStreetMap (Nominatim)
 * Optimized for Brazilian addresses with component-based search.
 */

interface GeocodeComponents {
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

const cache = new Map<string, any>();

async function nominatimSearch(query: string | GeocodeComponents) {
  const cacheKey = typeof query === 'string' ? query : JSON.stringify(query);
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=br&limit=1`;
  
  if (typeof query === 'string') {
    url += `&q=${encodeURIComponent(query)}`;
  } else {
    if (query.street) url += `&street=${encodeURIComponent(query.street)}`;
    if (query.city) url += `&city=${encodeURIComponent(query.city)}`;
    if (query.state) url += `&state=${encodeURIComponent(query.state)}`;
    // neighborhood isn't a direct param in Nominatim search, usually part of street or q
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'CardapioDigitalApp/1.0' }
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name,
      };
      cache.set(cacheKey, result);
      return result;
    }
    return null;
  } catch (err) {
    console.error('[geocoding] fetch error:', err);
    return null;
  }
}

export async function geocodeAddress(address: string, components?: GeocodeComponents) {
  try {
    // 1. Try structured search first (fastest and most accurate)
    if (components && (components.street || components.city)) {
      console.log('[geocoding] tentando busca estruturada:', components);
      const res = await nominatimSearch(components);
      if (res) return res;
    }

    // 2. Try with neighborhood included if street search failed
    if (components?.neighborhood && components.city) {
      const q = `${components.neighborhood}, ${components.city}, ${components.state || ''}`;
      console.log('[geocoding] tentando busca por bairro:', q);
      const res = await nominatimSearch(q);
      if (res) return res;
    }

    // 3. Fallback to free-text search variants
    const variants = new Set<string>();
    let normalized = address.replace(/\s+/g, ' ').trim();
    variants.add(normalized);
    
    const noBrasil = normalized.replace(/,\s*Brasil\s*$/i, '').trim();
    if (noBrasil !== normalized) variants.add(noBrasil);

    for (const q of variants) {
      console.log('[geocoding] tentando variante texto:', q);
      const res = await nominatimSearch(q);
      if (res) return res;
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'User-Agent': 'CardapioDigitalApp/1.0' } }
    );
    if (!response.ok) throw new Error('Reverse geocoding service error');
    return await response.json();
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
