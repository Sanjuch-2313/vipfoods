// Share the same address lookup across navbar, picker, and checkout.
const pending = new Map();
export function lookupAddress(latitude, longitude) {
  const key = `${latitude},${longitude}`;
  if (pending.has(key)) return pending.get(key);
  const request = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const params = new URLSearchParams({ format: 'jsonv2', lat: String(latitude), lon: String(longitude), zoom: '18', addressdetails: '1', layer: 'address', 'accept-language': 'en' });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error('Address service is unavailable. Please retry or enter your address.');
      const data = await response.json();
      if (data.error || !data.address) throw new Error('No mapped address was found. Please enter your address.');
      return data.address;
    } finally { clearTimeout(timeout); }
  })();
  pending.set(key, request);
  request.finally(() => pending.delete(key)).catch(() => {});
  return request;
}
export function streetAddress(address) {
  return [...new Set([
    address.house_number, address.house_name, address.building,
    address.road || address.pedestrian || address.residential || address.path,
    address.neighbourhood, address.quarter, address.suburb, address.locality,
    address.hamlet, address.isolated_dwelling, address.city_district,
  ].filter(Boolean))].join(', ');
}
export function fullAddress(address) {
  return [...new Set([streetAddress(address), address.city || address.town || address.village || address.county,
    address.state, address.postcode, address.country].filter(Boolean))].join(', ');
}
