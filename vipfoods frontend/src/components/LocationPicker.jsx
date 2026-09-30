import { motion, AnimatePresence } from "framer-motion";
import { FiMapPin, FiLoader, FiX, FiCheck, FiAlertCircle } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { useLocationContext } from "../context/LocationContext";


async function fetchAddressFromCoords(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&layer=address`,
    { signal: AbortSignal.timeout(12000) }
  );
  if (!res.ok) throw new Error("Could not resolve address");
  const data = await res.json();
  if (data.error || !data.address) throw new Error("No address found here");
  return data.address;
}

export default function LocationPicker({ onLocationChange, customTrigger }) {
  const {
    location,
    setLocation,
    isPickerOpen,
    openPicker,
    closePicker,
    required,
  } = useLocationContext();

  const [manualValue, setManualValue] = useState("");
  const [doorNumber, setDoorNumber] = useState("");
  const [detectedCoords, setDetectedCoords] = useState(null);
  const [locationNote, setLocationNote] = useState("");
  const requestRef = useRef(0);
  useEffect(() => () => { requestRef.current++; }, []);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);
  const [panelPosition, setPanelPosition] = useState({
    top: 88,
    left: 16,
  });

  const updatePanelPosition = () => {
    const rect = wrapperRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const panelWidth = Math.min(340, window.innerWidth - 24);
    const left = Math.min(
      Math.max(12, rect.left),
      window.innerWidth - panelWidth - 12
    );

    setPanelPosition({
      top: rect.bottom + 12,
      left,
    });
  };

  useEffect(() => {
    if (required) return;
    function handleClickOutside(e) {
      const clickedTrigger = wrapperRef.current?.contains(e.target);
      const clickedPanel = panelRef.current?.contains(e.target);

      if (!clickedTrigger && !clickedPanel) {
        closePicker();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [required, closePicker]);

  useEffect(() => {
    if (!isPickerOpen || required) {
      return undefined;
    }

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [isPickerOpen, required]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMsg("Your browser doesn't support location detection.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const requestId = ++requestRef.current;
    setDetectedCoords(null);
    setLocationNote("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude, accuracy } }) => {
        try {
          const addr = await fetchAddressFromCoords(latitude, longitude);
          if (requestId !== requestRef.current) return;
          const precise = Number.isFinite(accuracy) && accuracy <= 100;
          const street = addr.road || addr.pedestrian || addr.residential || addr.path;
          const parts = [
            ...(precise ? [addr.house_name, addr.building, street] : []),
            addr.neighbourhood, addr.quarter, addr.suburb, addr.locality,
            addr.hamlet, addr.city_district, addr.city || addr.town || addr.village,
            addr.state, addr.postcode, addr.country,
          ];
          const address = [...new Set(parts.filter(Boolean))].join(", ");
          if (!address) throw new Error("No address found");
          setManualValue(address);
          setDoorNumber(precise ? addr.house_number || "" : "");
          setDetectedCoords({ lat: latitude, lon: longitude, accuracy });
          // Automatically save detected location to context & storage
          setLocation(address, { lat: latitude, lon: longitude, accuracy });
          onLocationChange?.(address, { lat: latitude, lon: longitude, accuracy });

          setLocationNote(!precise
            ? `Your device returned an approximate location${Number.isFinite(accuracy) ? ` (about ${Math.round(accuracy)} m accuracy)` : ""}. Door/flat number can be updated below.`
            : `GPS accuracy: about ${Math.round(accuracy)} m. Location set successfully! You can add your door/flat number below if needed.`);
          setStatus("idle");
        } catch {
          if (requestId !== requestRef.current) return;
          setStatus("error");
          setErrorMsg("Your location was found, but the street address could not be resolved. Retry or enter your address below.");
        }
      },
      (error) => {
        if (requestId !== requestRef.current) return;
        setStatus("error");
        setErrorMsg(error.code === 1
          ? "Location permission was denied. Please allow location access in your browser or enter your address below."
          : "Couldn't get a fresh location. Try again near a window or enter your address below.");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualValue.trim()) return;
    requestRef.current++;
    const address = [doorNumber.trim(), manualValue.trim()].filter(Boolean).join(", ");
    setLocation(address, detectedCoords);
    onLocationChange?.(address, detectedCoords);
    setManualValue("");
    setDoorNumber("");
    setDetectedCoords(null);
    setLocationNote("");
    setStatus("idle");
  };

  const panelContent = (
    <motion.div
      initial={required ? { opacity: 0, y: 20, scale: 0.96 } : { opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={required ? { opacity: 0, y: 20, scale: 0.96 } : { opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className={
        required
          ? "w-[92%] max-w-[380px] rounded-3xl p-6 sm:p-7 backdrop-blur-2xl bg-white/90 border border-white/70 shadow-[0_30px_80px_rgba(154,52,18,0.35)]"
          : "fixed z-[5000] w-[min(340px,calc(100vw-24px))] rounded-3xl p-5 sm:p-6 backdrop-blur-2xl bg-white/95 border border-white/70 shadow-[0_20px_60px_rgba(154,52,18,0.25)]"
      }
      style={
        required
          ? undefined
          : {
              maxHeight: "calc(100dvh - 110px)",
              overflowY: "auto",
              top: `${panelPosition.top}px`,
              left: `${panelPosition.left}px`,
            }
      }
      ref={required ? undefined : panelRef}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-stone-900 font-bold text-base">
          {required ? "Delivery location needed" : "Delivery location"}
        </h4>
        {!required && (
          <button onClick={closePicker} className="text-stone-400 hover:text-stone-700 transition-colors" aria-label="Close">
            <FiX size={18} />
          </button>
        )}
      </div>

      {required && (
        <p className="flex items-start gap-2 text-stone-600 text-sm mb-4 leading-6">
          <FiAlertCircle className="text-red-600 shrink-0 mt-0.5" size={16} />
          We need your delivery location to check what's available and place your order.
        </p>
      )}

      <button
        onClick={handleUseCurrentLocation}
        disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold text-sm shadow-[0_10px_25px_rgba(194,65,12,0.35)] hover:shadow-[0_15px_35px_rgba(194,65,12,0.5)] transition-shadow disabled:opacity-70"
      >
        {status === "loading" ? (
          <>
            <FiLoader className="animate-spin" size={16} />
            Detecting location now…
          </>
        ) : (
          <>
            <FiMapPin size={16} />
            Detect location now
          </>
        )}
      </button>

      {status === "error" && <p className="text-red-600 text-xs mt-3 leading-5">{errorMsg}</p>}

      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1 bg-stone-200"></div>
        <span className="text-stone-400 text-xs font-medium">OR</span>
        <div className="h-px flex-1 bg-stone-200"></div>
      </div>

      {locationNote && <p role="status" className="text-stone-600 text-xs mb-3 leading-5">{locationNote}</p>}
      <form onSubmit={handleManualSubmit} className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-stone-700" htmlFor="delivery-door">Door / flat number</label>
        <input id="delivery-door" type="text" value={doorNumber} onChange={e => setDoorNumber(e.target.value)} placeholder="Enter or confirm door / flat number" className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm" />
        <label className="text-xs font-semibold text-stone-700" htmlFor="delivery-address">Street and area</label>
        <input
          id="delivery-address"
          type="text"
          required
          value={manualValue}
          onChange={(e) => { setManualValue(e.target.value); setDetectedCoords(null); }}
          placeholder="Street, area, city and pincode"
          className="flex-1 px-4 py-3 rounded-2xl border border-stone-200 bg-white/70 text-stone-800 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="submit"
          disabled={status === "loading"}
          aria-label="Confirm address"
          className="w-full h-11 rounded-2xl bg-stone-900 text-white flex gap-2 items-center justify-center disabled:opacity-50"
        >
          <FiCheck size={18} /> Confirm address
        </motion.button>
      </form>
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="block text-[10px] text-stone-400 mt-3">Address data © OpenStreetMap contributors</a>
    </motion.div>
  );

  return (
    <div className="relative" ref={wrapperRef}>
      {customTrigger ? (
        customTrigger({
          onClick: () => {
            updatePanelPosition();
            openPicker();
          },
          location,
          detectLocation: handleUseCurrentLocation,
          isDetecting: status === "loading",
        })
      ) : (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => {
            updatePanelPosition();
            openPicker();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/70 shadow text-stone-800 font-medium text-sm sm:text-base max-w-[220px] sm:max-w-xs"
        >
          <FiMapPin className="text-red-600 shrink-0" size={18} />
          <span className="truncate">{location || "Detect the location now"}</span>
        </motion.button>
      )}

      <AnimatePresence>
        {isPickerOpen && !required && panelContent}
      </AnimatePresence>

      <AnimatePresence>
        {isPickerOpen && required && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm px-4"
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
