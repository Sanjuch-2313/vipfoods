import { createContext, useContext, useState, useCallback, useMemo } from "react";

const LocationContext = createContext(null);
const LOCAL_STORAGE_KEY = "vip-foods-location";

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [coords, setCoords] = useState(null);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [required, setRequired] = useState(false);

  const setLocation = useCallback((address, coordsValue) => {
    setLocationState(address);
    setCoords(coordsValue || null);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, address);
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
    }),
    [location, coords, setLocation, isPickerOpen, openPicker, closePicker, required, ensureLocation],
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
