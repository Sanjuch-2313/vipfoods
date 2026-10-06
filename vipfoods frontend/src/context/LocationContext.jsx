import { lookupAddress, fullAddress } from "../utils/locationLookup";
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";

const LocationContext = createContext(null);
const LOCAL_STORAGE_KEY = "vip-foods-location";

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY) || "";
      // Strip out any demo / mock / foreign location strings if previously stored
      if (!stored || /new\s*york|demo|sample|dummy|test|united\s*states|usa|broadway/i.test(stored)) {
        try { localStorage.removeItem(LOCAL_STORAGE_KEY); } catch {}
        return "";
      }
      return stored;
    } catch {
      return "";
    }
  });
  const [coords, setCoords] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`${LOCAL_STORAGE_KEY}-coords`) || "null");
      return saved && Number.isFinite(saved.lat) && Number.isFinite(saved.lon) ? saved : null;
    } catch { return null; }
  });
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [required, setRequired] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const setLocation = useCallback((address, coordsValue) => {
    setLocationState(address);
    setCoords(coordsValue || null);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, address);
      if (coordsValue) localStorage.setItem(`${LOCAL_STORAGE_KEY}-coords`, JSON.stringify(coordsValue));
      else localStorage.removeItem(`${LOCAL_STORAGE_KEY}-coords`);
    } catch {
      // ignore storage failures
    }
    setPickerOpen(false);
    setRequired(false);
  }, []);

  const openPicker = useCallback((opts = {}) => {
    setRequired(!!opts.required);
    setPickerOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    setPickerOpen((wasOpen) => (required ? wasOpen : false));
  }, [required]);

  const ensureLocation = useCallback(() => {
    if (location) return true;
    openPicker({ required: true });
    return false;
  }, [location, openPicker]);

  // Direct location detection function
  const detectCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return Promise.reject(new Error("Geolocation not supported"));

    setIsDetecting(true);
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude, longitude, accuracy } }) => {
          try {
            const addr = await lookupAddress(latitude, longitude);
            const address = fullAddress(addr);
            if (!address) throw new Error("Empty address");

            setLocation(address, { lat: latitude, lon: longitude, accuracy });
            setIsDetecting(false);
            resolve(address);
          } catch (err) {
            setIsDetecting(false);
            reject(err);
          }
        },
        (err) => {
          setIsDetecting(false);
          reject(err);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
      );
    });
  }, [setLocation]);

  // Auto-detect on first load if permission was already granted in browser
  useEffect(() => {
    if (!location && typeof navigator !== "undefined" && navigator.permissions?.query) {
      navigator.permissions.query({ name: "geolocation" }).then((res) => {
        if (res.state === "granted") {
          detectCurrentLocation().catch(() => {});
        }
      }).catch(() => {});
    }
  }, [location, detectCurrentLocation]);

  const value = useMemo(
    () => ({
      location,
      coords,
      setLocation,
      isPickerOpen,
      openPicker,
      closePicker,
      required,
      ensureLocation,
      detectCurrentLocation,
      isDetecting,
    }),
    [location, coords, setLocation, isPickerOpen, openPicker, closePicker, required, ensureLocation, detectCurrentLocation, isDetecting],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext must be used within a LocationProvider");
  }
  return context;
}
